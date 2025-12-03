# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Core commands

- Start the full stack (build + run):
  - `make up`
- Follow logs (gateway + services):
  - `make logs`
- Stop everything:
  - `make down`
- Rebuild images without cache:
  - `make rebuild`
- Build or run a single service with Docker Compose:
  - Build: `docker compose build users` (or `orders`, `inventory`)
  - Run detached: `docker compose up -d users`

Local (non-Docker) service run for development:
- From a service directory (e.g., `services/users`):
  - Install deps: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
  - Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

Notes on linting/tests:
- No project-level lint or test configuration is present (no pytest/flake8 configs found). If tests are added later, document the commands here (including how to run a single test).

## Big-picture architecture

- Orchestration: Docker Compose (`docker-compose.yml`) defines four services on a single bridge network `msnet`.
  - `gateway` (Nginx) publishes `localhost:8080 -> container:80` and depends on the three backend services.
  - Backends: `users`, `orders`, `inventory` — each a small FastAPI app listening on port 8000 inside its container.
- Routing: `gateway/nginx.conf` performs simple, path-based reverse proxying with trailing-slash normalization:
  - Redirects `/users` → `/users/`, `/orders` → `/orders/`, `/inventory` → `/inventory/`.
  - Proxies:
    - `/users/` → `users:8000/`
    - `/orders/` → `orders:8000/`
    - `/inventory/` → `inventory:8000/`
- Service apps (FastAPI):
  - Location of entrypoints: `services/<name>/app/main.py`.
  - Each defines `app = FastAPI(title="<name>-service")` and exposes two endpoints:
    - `GET /` — returns static JSON payload for that domain.
    - `GET /healthz` — returns `{ "status": "healthy" }`.
- State: No databases, queues, or inter-service calls; all responses are static/demo data.

## Useful URLs and curl checks

- Gateway base URL: `http://localhost:8080/`
- Health checks:
  - `curl http://localhost:8080/users/healthz`
  - `curl http://localhost:8080/orders/healthz`
  - `curl http://localhost:8080/inventory/healthz`
- Root endpoints:
  - `curl http://localhost:8080/users/`
  - `curl http://localhost:8080/orders/`
  - `curl http://localhost:8080/inventory/`

## Repository layout (high level)

- `docker-compose.yml` — service topology and network.
- `gateway/nginx.conf` — reverse proxy and path routing.
- `services/<service>/app/main.py` — FastAPI app per service.
- `Makefile` — convenience targets for compose lifecycle.

## Tips for agents working in this repo

- When adding a new service, mirror the existing pattern:
  1) create `services/<new>/app/main.py` with a FastAPI `app`,
  2) add the service to `docker-compose.yml` (exposed on 8000),
  3) add an upstream and `location /<new>/` block in `gateway/nginx.conf`.
- Trailing slashes matter at the gateway; requests without `/` are redirected.
