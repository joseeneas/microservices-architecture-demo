"""
SQLAlchemy ORM models for the Orders service.

Defines the database schema for order-related tables.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric
from .database import Base

class Order(Base):
    """
    Order model representing a customer order in the system.
    
    Attributes:
        id (str): Primary key, order ID (e.g., "A100", "B200")
        user_id (int): ID of the user who placed the order
        total (Decimal): Total amount of the order
        status (str): Order status (e.g., "pending", "completed", "cancelled")
        created_at (datetime): Timestamp when the order was created
    """
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    total = Column(Numeric(10, 2), nullable=False, default=0.00)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
