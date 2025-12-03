# Microservices Architecture Demo

A minimal microservices demo consisting of three FastAPI services (users, orders, inventory) behind an Nginx gateway, orchestrated with Docker Compose.

## Services
- Gateway (Nginx): routes requests to backend services via path prefixes
- Users (FastAPI): simple endpoints under `/`
- Orders (FastAPI): simple endpoints under `/`
- Inventory (FastAPI): simple endpoints under `/`

## Prerequisites
- Docker and Docker Compose

## Quick start
```sh
# From this directory
docker compose up --build

# In another shell
curl http://localhost:8080/users/
curl http://localhost:8080/orders/
curl http://localhost:8080/inventory/
```

## Start/Stop
- Start (detached, rebuild if needed):
  - `make up` or `docker compose up -d --build`
- Follow logs (gateway + services):
  - `make logs`
- Stop everything:
  - `make down`

UI
- Open `http://localhost:8080/` for the minimal UI served by the gateway.
- Swagger docs: `/users/docs`, `/orders/docs`, `/inventory/docs`.

## Project layout
```
.
├── docker-compose.yml
├── gateway/
│   ├── Dockerfile
│   └── nginx.conf
└── services/
    ├── users/
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   └── app/main.py
    ├── orders/
    │   ├── Dockerfile
    │   ├── requirements.txt
    │   └── app/main.py
    └── inventory/
        ├── Dockerfile
        ├── requirements.txt
        └── app/main.py
```

## Notes
- Nginx performs simple path-based routing (`/users/`, `/orders/`, `/inventory/`).
- Each service exposes a root (`/`) endpoint and a health endpoint (`/healthz`).
