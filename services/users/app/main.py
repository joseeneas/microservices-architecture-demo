"""
Users Service FastAPI Application.

This module implements a users microservice using FastAPI with full CRUD operations.
It provides endpoints for creating, reading, updating, and deleting user data,
with PostgreSQL database persistence.

The service is designed to be part of a microservices architecture and includes:
- CRUD endpoints for user management
- A health check endpoint for service monitoring and orchestration

Attributes:
    app (FastAPI): The FastAPI application instance configured with the title "users-service".
"""
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="users-service")

@app.get("/healthz", response_model=dict)
def health():
    """
    Health check endpoint for the users service.

    This endpoint is used by load balancers, orchestration systems (like Kubernetes),
    or monitoring tools to verify that the service is running and responsive.

    Returns:
        dict: A dictionary containing the health status of the service.
            - status (str): Always returns "healthy" when the service is operational.

    Example:
        GET /healthz
        Response: {"status": "healthy"}
    """
    return {"status": "healthy"}

@app.get("/", response_model=List[schemas.User])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    List all users with pagination.

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
        db: Database session (injected)

    Returns:
        List of user objects
    """
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get a single user by ID.

    Args:
        user_id: ID of the user to retrieve
        db: Database session (injected)

    Returns:
        User object

    Raises:
        HTTPException: 404 if user not found
    """
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.

    Args:
        user: User data to create
        db: Database session (injected)

    Returns:
        Created user object

    Raises:
        HTTPException: 400 if email already exists
    """
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    """
    Update an existing user.

    Args:
        user_id: ID of the user to update
        user: Updated user data
        db: Database session (injected)

    Returns:
        Updated user object

    Raises:
        HTTPException: 404 if user not found
    """
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Delete a user.

    Args:
        user_id: ID of the user to delete
        db: Database session (injected)

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 404 if user not found
    """
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
