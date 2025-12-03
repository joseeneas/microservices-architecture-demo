"""
    Inventory Service API

    This module implements a FastAPI-based microservice for managing inventory data with full CRUD operations.
    It provides endpoints for creating, reading, updating, and deleting inventory data,
    with PostgreSQL database persistence.

    The service exposes:
    - CRUD endpoints for inventory management
    - Health endpoint: Provides service health status for monitoring and orchestration

    This service is part of a microservices architecture demo and can be integrated
    with other services for complete inventory management functionality.
"""
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="inventory-service")

@app.get("/healthz", response_model=dict)
def health():
    """
    Health check endpoint for the inventory service.

    This endpoint is typically used by orchestrators (like Kubernetes) or load balancers
    to determine if the service is running and ready to accept requests.

    Returns:
        dict: A dictionary containing the health status of the service.
            - status (str): "healthy" if the service is operational.

    Example:
        GET /healthz
        Response: {"status": "healthy"}
    """
    return {"status": "healthy"}

@app.get("/", response_model=List[schemas.InventoryItem])
def list_inventory_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all inventory items with pagination.

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
        db: Database session (injected)

    Returns:
        List of inventory item objects
    """
    items = crud.get_inventory_items(db, skip=skip, limit=limit)
    return items

@app.get("/{item_id}", response_model=schemas.InventoryItem)
def get_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """
    Get a single inventory item by ID.

    Args:
        item_id: ID of the inventory item to retrieve
        db: Database session (injected)

    Returns:
        Inventory item object

    Raises:
        HTTPException: 404 if item not found
    """
    db_item = crud.get_inventory_item(db, item_id=item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return db_item

@app.post("/", response_model=schemas.InventoryItem, status_code=status.HTTP_201_CREATED)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db)):
    """
    Create a new inventory item.

    Args:
        item: Inventory item data to create
        db: Database session (injected)

    Returns:
        Created inventory item object

    Raises:
        HTTPException: 400 if SKU already exists
    """
    db_item = crud.get_inventory_item_by_sku(db, sku=item.sku)
    if db_item:
        raise HTTPException(status_code=400, detail="SKU already exists")
    return crud.create_inventory_item(db=db, item=item)

@app.put("/{item_id}", response_model=schemas.InventoryItem)
def update_inventory_item(item_id: int, item: schemas.InventoryItemUpdate, db: Session = Depends(get_db)):
    """
    Update an existing inventory item.

    Args:
        item_id: ID of the inventory item to update
        item: Updated item data
        db: Database session (injected)

    Returns:
        Updated inventory item object

    Raises:
        HTTPException: 404 if item not found
    """
    db_item = crud.update_inventory_item(db, item_id=item_id, item=item)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return db_item

@app.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    """
    Delete an inventory item.

    Args:
        item_id: ID of the inventory item to delete
        db: Database session (injected)

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 404 if item not found
    """
    success = crud.delete_inventory_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Inventory item not found")
