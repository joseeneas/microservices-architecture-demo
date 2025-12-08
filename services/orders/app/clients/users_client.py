"""
HTTP client for communicating with the Users service.

This module provides functions to validate user existence and retrieve user data
from the Users microservice.
"""
import httpx
from typing import Optional

# Use internal Docker network hostname
USERS_SERVICE_URL = "http://users:8000"
TIMEOUT = 5.0  # seconds


async def validate_user_exists(user_id: int) -> bool:
    """
    Check if a user exists in the Users service.
    
    Args:
        user_id: The ID of the user to validate
        
    Returns:
        True if the user exists, False otherwise
        
    Raises:
        httpx.HTTPError: If there's a network error or the service is unavailable
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(f"{USERS_SERVICE_URL}/{user_id}")
            return response.status_code == 200
    except httpx.HTTPError:
        raise


async def get_user(user_id: int) -> Optional[dict]:
    """
    Retrieve user data from the Users service.
    
    Args:
        user_id: The ID of the user to retrieve
        
    Returns:
        User data as a dictionary if found, None otherwise
        
    Raises:
        httpx.HTTPError: If there's a network error or the service is unavailable
    """
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(f"{USERS_SERVICE_URL}/{user_id}")
            if response.status_code == 200:
                return response.json()
            return None
    except httpx.HTTPError:
        raise
