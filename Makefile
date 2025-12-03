# Makefile for managing Docker Compose services in the microservices architecture demo
#
# Available targets:
#
# up        - Starts all services defined in docker-compose.yml with a fresh build
#             This will rebuild images if Dockerfiles have changed
#
# down      - Stops and removes all containers, networks, and volumes created by up
#
# logs      - Follows and displays logs for specific services: gateway, users, orders, and inventory
#             Use Ctrl+C to stop following logs
#
# rebuild   - Forces a complete rebuild of all Docker images without using cache
#             Useful when you want to ensure all dependencies are fresh
.PHONY: up down logs rebuild

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f gateway users orders inventory

rebuild:
	docker compose build --no-cache
