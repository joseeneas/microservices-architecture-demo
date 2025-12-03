"""
Pydantic schemas for request/response validation in the Orders service.

These schemas define the structure of data for API requests and responses.
"""
from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

class OrderBase(BaseModel):
    """Base schema with common order attributes."""
    user_id: int
    total: Decimal
    status: str = "pending"

class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    id: str
    user_id: int
    total: Decimal
    status: Optional[str] = "pending"

class OrderUpdate(BaseModel):
    """Schema for updating an existing order. All fields are optional."""
    user_id: Optional[int] = None
    total: Optional[Decimal] = None
    status: Optional[str] = None

class Order(OrderBase):
    """
    Schema for order responses, includes all database fields.
    
    Attributes:
        id (str): Order's unique identifier
        user_id (int): ID of the user who placed the order
        total (Decimal): Total amount of the order
        status (str): Order status
        created_at (datetime): When the order was created
    """
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
