"""
Pydantic schemas for request/response validation in the Users service.

These schemas define the structure of data for API requests and responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    """Base schema with common user attributes."""
    name: str
    email: EmailStr

class UserCreate(UserBase):
    """Schema for creating a new user."""
    pass

class UserUpdate(BaseModel):
    """Schema for updating an existing user. All fields are optional."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    """
    Schema for user responses, includes all database fields.
    
    Attributes:
        id (int): User's unique identifier
        name (str): User's full name
        email (str): User's email address
        created_at (datetime): When the user was created
    """
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
