"""
Users Service FastAPI Application.

This module implements a simple users microservice using FastAPI.
It provides endpoints for retrieving user data and health check functionality.

The service is designed to be part of a microservices architecture and includes:
- A root endpoint that returns service information and sample user data
- A health check endpoint for service monitoring and orchestration

Attributes:
    app (FastAPI): The FastAPI application instance configured with the title "users-service".
"""
from fastapi import FastAPI
app = FastAPI(title="users-service")

@app.get("/")
def root():
    """
    Root endpoint that returns the service status and a list of sample users.

    Returns:
        dict: A dictionary containing:
            - service (str): The name of the service ("users")
            - status (str): The current status of the service ("ok")
            - data (list): A list of user dictionaries, each containing:
                - id (int): The user's unique identifier
                - name (str): The user's name
    """
    return {"service": "users", "status": "ok", "data": [{"id": 1, "name": "Ada"}, {"id": 2, "name": "Linus"}]}

@app.get("/healthz")
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
