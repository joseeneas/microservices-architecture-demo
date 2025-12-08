"""
Orders Service API

This module implements a FastAPI-based microservice for managing orders with full CRUD operations.
It provides endpoints for creating, reading, updating, and deleting order data,
with PostgreSQL database persistence.

The service is designed to be part of a microservices architecture and includes
standard endpoints for service discovery and health monitoring.

Endpoints:
    GET /: List all orders with pagination
    GET /{order_id}: Get a single order by ID
    POST /: Create a new order
    PUT /{order_id}: Update an existing order
    DELETE /{order_id}: Delete an order
    GET /healthz: Health check endpoint for orchestration systems

Attributes:
    app (FastAPI): The FastAPI application instance configured with the title "orders-service"
"""
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import crud, models, schemas, auth
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="orders-service")

@app.get("/healthz", response_model=dict)
def health():
    """
    Health check endpoint for the orders service.

    This endpoint is used by orchestration systems (like Kubernetes) to verify
    that the service is running and able to respond to requests.

    Returns:
        dict: A dictionary containing the health status of the service.
            - status (str): Always returns "healthy" when the service is operational.

    Example:
        GET /healthz
        Response: {"status": "healthy"}
    """
    return {"status": "healthy"}

@app.get("/", response_model=List[schemas.Order])
def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """
    List orders with pagination (authenticated users see their own, admins see all).

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        List of order objects
    """
    orders = crud.get_orders(db, skip=skip, limit=limit)
    # Filter by user_id unless admin
    if current_user.role != "admin":
        orders = [order for order in orders if order.user_id == current_user.id]
    return orders

@app.get("/{order_id}", response_model=schemas.Order)
def get_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """
    Get a single order by ID (owner or admin).

    Args:
        order_id: ID of the order to retrieve
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        Order object

    Raises:
        HTTPException: 403 if not authorized
        HTTPException: 404 if order not found
    """
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check ownership unless admin
    if current_user.role != "admin" and db_order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this order"
        )
    
    return db_order

@app.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """
    Create a new order with validation and inventory deduction (authenticated users only).
    
    This endpoint:
    - Validates user exists in the Users service
    - Validates inventory items exist in the Inventory service
    - Checks sufficient stock for the order items
    - Deducts inventory automatically (with rollback on failure)
    - Users can only create orders for themselves (unless admin)

    Args:
        order: Order data to create
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        Created order object

    Raises:
        HTTPException: 400 if order ID already exists or validation fails
        HTTPException: 403 if not authorized
        HTTPException: 503 if dependent services are unavailable
    """
    # Check if order ID already exists
    db_order = crud.get_order(db, order_id=order.id)
    if db_order:
        raise HTTPException(status_code=400, detail="Order ID already exists")
    
    # Check authorization: users can only create orders for themselves (unless admin)
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only create orders for yourself"
        )
    
    # Validate order data with other services
    is_valid, error_message = await crud.validate_order_data(order)
    if not is_valid:
        # Check if it's a service communication error
        if "Service communication error" in error_message:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_message
            )
        # Otherwise it's a validation error
        raise HTTPException(status_code=400, detail=error_message)
    
    # Process inventory deductions (only if order has items and status is active)
    if order.items and order.status != "cancelled":
        success, error_msg, _ = await crud.process_inventory_for_order(order.items, deduct=True)
        if not success:
            raise HTTPException(status_code=400, detail=error_msg)
    
    # Create the order in database
    try:
        return crud.create_order(db=db, order=order)
    except Exception as e:
        # If order creation fails, inventory has already been rolled back by process_inventory_for_order
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@app.put("/{order_id}", response_model=schemas.Order)
async def update_order(
    order_id: str,
    order: schemas.OrderUpdate,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """
    Update an existing order with inventory management (owner or admin).
    
    Handles inventory restoration when cancelling orders,
    and inventory deduction when reactivating cancelled orders.

    Args:
        order_id: ID of the order to update
        order: Updated order data
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        Updated order object

    Raises:
        HTTPException: 403 if not authorized
        HTTPException: 404 if order not found
    """
    # Get existing order
    existing_order = crud.get_order(db, order_id=order_id)
    if existing_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check ownership unless admin
    if current_user.role != "admin" and existing_order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this order"
        )
    
    # Check if status is changing
    if order.status and order.status != existing_order.status:
        old_status = existing_order.status
        new_status = order.status
        
        # If cancelling an order, restore inventory
        if new_status == "cancelled" and old_status != "cancelled":
            if existing_order.items:
                success, error_msg, _ = await crud.process_inventory_for_order(
                    existing_order.items, 
                    deduct=False
                )
                if not success:
                    raise HTTPException(status_code=400, detail=f"Failed to restore inventory: {error_msg}")
        
        # If reactivating a cancelled order, deduct inventory
        elif old_status == "cancelled" and new_status != "cancelled":
            if existing_order.items:
                success, error_msg, _ = await crud.process_inventory_for_order(
                    existing_order.items,
                    deduct=True
                )
                if not success:
                    raise HTTPException(status_code=400, detail=f"Failed to deduct inventory: {error_msg}")
    
    # Update the order
    db_order = crud.update_order(db, order_id=order_id, order=order)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: auth.CurrentUser = Depends(auth.get_current_user)
):
    """
    Delete an order (owner or admin).

    Args:
        order_id: ID of the order to delete
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 403 if not authorized
        HTTPException: 404 if order not found
    """
    # Get existing order to check ownership
    existing_order = crud.get_order(db, order_id=order_id)
    if existing_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check ownership unless admin
    if current_user.role != "admin" and existing_order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this order"
        )
    
    success = crud.delete_order(db, order_id=order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
