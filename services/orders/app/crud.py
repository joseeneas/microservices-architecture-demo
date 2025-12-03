"""
CRUD (Create, Read, Update, Delete) operations for the Orders service.

This module contains all database operations for order management.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from . import models, schemas

def get_order(db: Session, order_id: str) -> Optional[models.Order]:
    """
    Retrieve a single order by ID.
    
    Args:
        db: Database session
        order_id: ID of the order to retrieve
        
    Returns:
        Order object or None if not found
    """
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[models.Order]:
    """
    Retrieve a list of orders with pagination.
    
    Args:
        db: Database session
        skip: Number of records to skip (offset)
        limit: Maximum number of records to return
        
    Returns:
        List of Order objects
    """
    return db.query(models.Order).offset(skip).limit(limit).all()

def create_order(db: Session, order: schemas.OrderCreate) -> models.Order:
    """
    Create a new order in the database.
    
    Args:
        db: Database session
        order: Order data to create
        
    Returns:
        Created Order object
    """
    db_order = models.Order(
        id=order.id,
        user_id=order.user_id,
        total=order.total,
        status=order.status
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: str, order: schemas.OrderUpdate) -> Optional[models.Order]:
    """
    Update an existing order.
    
    Args:
        db: Database session
        order_id: ID of the order to update
        order: Updated order data (only provided fields will be updated)
        
    Returns:
        Updated Order object or None if not found
    """
    db_order = get_order(db, order_id)
    if db_order is None:
        return None
    
    update_data = order.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)
    
    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: str) -> bool:
    """
    Delete an order from the database.
    
    Args:
        db: Database session
        order_id: ID of the order to delete
        
    Returns:
        True if order was deleted, False if not found
    """
    db_order = get_order(db, order_id)
    if db_order is None:
        return False
    
    db.delete(db_order)
    db.commit()
    return True
