"""
Users Service FastAPI Application.

This module implements a users microservice using FastAPI with full CRUD operations.
It provides endpoints for creating, reading, updating, and deleting user data,
with PostgreSQL database persistence.

The service is designed to be part of a microservices architecture and includes:
- CRUD endpoints for user management
- Authentication endpoints (register, login)
- A health check endpoint for service monitoring and orchestration

Attributes:
    app (FastAPI): The FastAPI application instance configured with the title "users-service".
"""
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session

from . import crud, models, schemas, auth
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


@app.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.

    Args:
        user: User registration data (name, email, password)
        db: Database session (injected)

    Returns:
        JWT access token

    Raises:
        HTTPException: 400 if email already exists
    """
    # Check if user already exists
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password
    password_hash = auth.get_password_hash(user.password)
    
    # Create user in database
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=password_hash,
        role="user",
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = auth.create_access_token(
        data={"sub": str(db_user.id), "email": db_user.email, "role": db_user.role}
    )
    return schemas.Token(access_token=access_token)


@app.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate and login a user.

    Args:
        credentials: User login credentials (email, password)
        db: Database session (injected)

    Returns:
        JWT access token

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    user = auth.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role}
    )
    return schemas.Token(access_token=access_token)


@app.get("/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user)):
    """
    Get current authenticated user information.

    Args:
        current_user: Current authenticated user (injected)

    Returns:
        Current user object
    """
    return current_user

@app.get("/me/preferences", response_model=dict)
def get_preferences(current_user: models.User = Depends(auth.get_current_user)):
    """
    Get current user's preferences.

    Args:
        current_user: Current authenticated user (injected)

    Returns:
        User preferences dictionary
    """
    return current_user.preferences or {}

@app.put("/me/preferences", response_model=dict)
def update_preferences(
    preferences_data: schemas.PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Update current user's preferences.

    Args:
        preferences_data: New preferences data
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        Updated preferences dictionary
    """
    current_user.preferences = preferences_data.preferences
    db.commit()
    db.refresh(current_user)
    return current_user.preferences

@app.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_admin(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """
    Create a new user (admin only).

    Generates a default password (password123) which the user should change later.
    """
    # Prevent duplicate emails
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Use provided temp password or default
    raw_password = user.password if getattr(user, "password", None) else "password123"
    temp_hash = auth.get_password_hash(raw_password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=temp_hash,
        role="user",
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/{user_id}/reset_password", response_model=dict)
def reset_password(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """
    Reset a user's password (admin only). Returns a new temporary password once.
    """
    import secrets, string
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    alphabet = string.ascii_letters + string.digits
    temp_pw = "".join(secrets.choice(alphabet) for _ in range(12))
    db_user.password_hash = auth.get_password_hash(temp_pw)
    db.commit()
    return {"temp_password": temp_pw}

@app.get("/", response_model=List[schemas.User])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """
    List all users with pagination (admin only).

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
        db: Database session (injected)
        current_user: Current authenticated admin user (injected)

    Returns:
        List of user objects
    """
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Get a single user by ID (authenticated users only).

    Args:
        user_id: ID of the user to retrieve
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        User object

    Raises:
        HTTPException: 404 if user not found
    """
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Update an existing user (self or admin).

    Args:
        user_id: ID of the user to update
        user: Updated user data
        db: Database session (injected)
        current_user: Current authenticated user (injected)

    Returns:
        Updated user object

    Raises:
        HTTPException: 403 if not authorized
        HTTPException: 404 if user not found
    """
    # Check if user is updating themselves or is admin
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    db_user = crud.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_admin)
):
    """
    Delete a user (admin only).

    Args:
        user_id: ID of the user to delete
        db: Database session (injected)
        current_user: Current authenticated admin user (injected)

    Returns:
        None (204 No Content)

    Raises:
        HTTPException: 404 if user not found
    """
    success = crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
