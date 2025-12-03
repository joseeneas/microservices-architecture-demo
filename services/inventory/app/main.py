"""
    Inventory Service API

    This module implements a FastAPI-based microservice for managing inventory data.
    It provides endpoints for retrieving inventory information and health status checks.

    The service exposes:
    - Root endpoint: Returns inventory data with SKU and quantity information
    - Health endpoint: Provides service health status for monitoring and orchestration

    This service is part of a microservices architecture demo and can be integrated
    with other services for complete inventory management functionality.
"""
from fastapi import FastAPI
app = FastAPI(title="inventory-service")

@app.get("/")
def root():
    """
    Root endpoint for the inventory service.

    Returns:
        dict: A dictionary containing:
            - service (str): The name of the service ("inventory")
            - status (str): The operational status of the service ("ok")
            - data (list): A list of inventory items, each containing:
                - sku (str): Stock Keeping Unit identifier
                - qty (int): Quantity available in inventory
    """
    return {"service": "inventory", "status": "ok", "data": [{"sku": "X-1", "qty": 42}, {"sku": "Y-2", "qty": 7}]}

@app.get("/healthz")
def health():
    """
    Health check endpoint for the inventory service.

    This endpoint is typically used by orchestrators (like Kubernetes) or load balancers
    to determine if the service is running and ready to accept requests.

    Returns:
        dict: A dictionary containing the health status of the service.
            - status (str): "healthy" if the service is operational.

    Example:
        GET /healthz
        Response: {"status": "healthy"}
    """
    return {"status": "healthy"}