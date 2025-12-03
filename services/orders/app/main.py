"""
Orders Service API

This module implements a FastAPI-based microservice for managing orders.
It provides endpoints for order data retrieval and health checking.

The service is designed to be part of a microservices architecture and includes
standard endpoints for service discovery and health monitoring.

Endpoints:
    GET /: Returns service information and sample order data
    GET /healthz: Health check endpoint for orchestration systems

Attributes:
    app (FastAPI): The FastAPI application instance configured with the title "orders-service"
"""
from fastapi import FastAPI
app = FastAPI(title="orders-service")

@app.get("/")
def root():
    """
    Root endpoint for the orders service.

    Returns:
        dict: A dictionary containing the service name, status, and a list of sample order data.
            - service (str): The name of the service ("orders").
            - status (str): The operational status of the service ("ok").
            - data (list): A list of order objects, each containing:
                - id (str): The order identifier.
                - user_id (int): The ID of the user who placed the order.
    """
    return {"service": "orders", "status": "ok", "data": [{"id": "A100", "user_id": 1}, {"id": "B200", "user_id": 2}]}

@app.get("/healthz")
def health():
    """
    Health check endpoint for the orders service.

    This endpoint is used by orchestration systems (like Kubernetes) to verify
    that the service is running and able to respond to requests.

    Returns:
        dict: A dictionary containing the health status of the service.
            - status (str): Always returns "healthy" when the service is operational.

    Example:
        GET /healthz
        Response: {"status": "healthy"}
    """
    return {"status": "healthy"}
