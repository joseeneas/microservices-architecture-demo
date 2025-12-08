"""
Pydantic schemas for request/response validation in the Orders service.

These schemas define the structure of data for API requests and responses.
"""
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    """Schema for an order line item."""
    sku: str = Field(..., description="Product SKU from inventory")
    quantity: int = Field(..., gt=0, description="Quantity ordered")
    price: Decimal = Field(..., ge=0, description="Price per unit")


class OrderBase(BaseModel):
    """Base schema with common order attributes."""
    user_id: int
    total: Decimal
    status: str = "pending"
    items: List[OrderItem] = Field(default_factory=list, description="Order line items")


class OrderCreate(BaseModel):
    """Schema for creating a new order."""
    id: str
    user_id: int
    total: Decimal
    status: Optional[str] = "pending"
    items: List[OrderItem] = Field(default_factory=list, description="Order line items")


class OrderUpdate(BaseModel):
    """Schema for updating an existing order. All fields are optional."""
    user_id: Optional[int] = None
    total: Optional[Decimal] = None
    status: Optional[str] = None
    items: Optional[List[OrderItem]] = None


class Order(OrderBase):
    """
    Schema for order responses, includes all database fields.
    
    Attributes:
        id (str): Order's unique identifier
        user_id (int): ID of the user who placed the order
        total (Decimal): Total amount of the order
        status (str): Order status
        items (List[OrderItem]): Order line items
        created_at (datetime): When the order was created
    """
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
