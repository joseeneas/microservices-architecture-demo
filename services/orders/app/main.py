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

from . import crud, models, schemas
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
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all orders with pagination.

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
        db: Database session (injected)

    Returns:
        List of order objects
    """
    orders = crud.get_orders(db, skip=skip, limit=limit)
    return orders

@app.get("/{order_id}", response_model=schemas.Order)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """
    Get a single order by ID.

    Args:
        order_id: ID of the order to retrieve
        db: Database session (injected)

    Returns:
        Order object

    Raises:
        HTTPException: 404 if order not found
    """
    db_order = crud.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.post("/", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order.

    Args:
        order: Order data to create
        db: Database session (injected)

    Returns:
        Created order object

    Raises:
        HTTPException: 400 if order ID already exists
    """
    db_order = crud.get_order(db, order_id=order.id)
    if db_order:
        raise HTTPException(status_code=400, detail="Order ID already exists")
    return crud.create_order(db=db, order=order)

@app.put("/{order_id}", response_model=schemas.Order)
def update_order(order_id: str, order: schemas.OrderUpdate, db: Session = Depends(get_db)):
    """
    Update an existing order.

    Args:
        order_id: ID of the order to update
        order: Updated order data
        db: Database session (injected)

    Returns:
        Updated order object

    Raises:
        HTTPException: 404 if order not found
    """
    db_order = crud.update_order(db, order_id=order_id, order=order)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@app.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: str, db: Session = Depends(get_db)):
    """
    Delete an order.

    Args:
        order_id: ID of the order to delete
        db: Database session (injected)

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 404 if order not found
    """
    success = crud.delete_order(db, order_id=order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
