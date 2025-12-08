# Microservices Architecture Demo, Version 1.0

© J. Eneas, 2025

A full-featured microservices demo with three FastAPI services (users, orders, inventory) behind an Nginx gateway, complete with JWT authentication, PostgreSQL databases, inter-service communication, automatic inventory management, and a modern React UI.

NGINX is an open-source web server software that is widely used as a reverse proxy, load balancer, and high-performance HTTP cache. It efficiently handles incoming web traffic by distributing it across multiple servers, making it a crucial component for modern, scalable web applications, APIs, and microservices. Its event-driven architecture allows it to handle thousands of concurrent connections with low CPU consumption, providing high stability and performance.

Key functions of NGINX:

* **[Reverse Proxy](https://www.google.com/search?client=safari&rls=en&q=Reverse+Proxy&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEAk):** Sits in front of back-end servers to manage client requests, directing them to the appropriate server and returning the response. This can include tasks like SSL/TLS termination and security filtering.
* **[Load Balancer](https://www.google.com/search?client=safari&rls=en&q=Load+Balancer&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEAs):** Distributes incoming network traffic across a group of backend servers to ensure no single server is overwhelmed.
* **[HTTP Cache](https://www.google.com/search?client=safari&rls=en&q=HTTP+Cache&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEA0):** Stores copies of frequently accessed files and data to reduce the need for repeated requests to the backend server, which speeds up performance.
* **[Web Server](https://www.google.com/search?client=safari&rls=en&q=Web+Server&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEA8):** Serves static content like HTML, CSS, and JavaScript files directly and efficiently.
* **[API Gateway](https://www.google.com/search?client=safari&rls=en&q=API+Gateway&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEBE):** Can be used to route API requests, handle authentication, and manage other API-related functions.
* **[Security Tool](https://www.google.com/search?client=safari&rls=en&q=Security+Tool&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEBM):** Functions as a web application firewall, protecting against DDoS attacks by limiting request rates, and can be configured with custom security rules.
* **[Mail Proxy Server](https://www.google.com/search?client=safari&rls=en&q=Mail+Proxy+Server&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEBU):** Also supports proxying for email protocols like IMAP, POP3, and SMTP.

## Features

* **Authentication & Authorization**: JWT-based authentication with role-based access control (user/admin)
* **Inter-Service Communication**: Orders service validates users and inventory via HTTP calls
* **Automatic Inventory Management**: Orders automatically deduct inventory with rollback on failure
* **Modern React UI**: SPA with sidebar navigation, data tables, search, and authentication flow
* **PostgreSQL Persistence**: Each service has its own database with health checks
* **API Gateway**: Nginx reverse proxy with path-based routing and trailing-slash normalization

## Services

* **Gateway** (Nginx): Routes requests to backend services and web UI
* **Users** (FastAPI + PostgreSQL): User management with authentication endpoints
* **Orders** (FastAPI + PostgreSQL): Order management with user/inventory validation
* **Inventory** (FastAPI + PostgreSQL): Inventory tracking with automatic deduction
* **Web** (React + TypeScript): Modern SPA with Tailwind CSS

## Prerequisites

* Docker and Docker Compose

## Quick start

```sh
# Start all services
make up

# Open the web UI
open http://localhost:8080/

# Login with test admin account
# Email: admin@test.com
# Password: password123

# Or test via API (get auth token first)
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Use the token to access protected endpoints
TOKEN="your-jwt-token-here"
curl http://localhost:8080/users/ -H "Authorization: Bearer $TOKEN"
curl http://localhost:8080/orders/ -H "Authorization: Bearer $TOKEN"
curl http://localhost:8080/inventory/ -H "Authorization: Bearer $TOKEN"
```

## Start/Stop

* Start (detached, rebuild if needed):
  * `make up` or `docker compose up -d --build`
* Follow logs (gateway + services):
  * `make logs`
* Stop everything:
  * `make down`

## Web UI

* **Main UI**: `http://localhost:8080/` - Modern React SPA with sidebar navigation
  * Login/Register page with form validation
  * Users page with searchable data table (admin only)
  * Orders page with status badges and filtering
  * Inventory page with color-coded stock levels
* **API Documentation**: Swagger/OpenAPI docs at `/users/docs`, `/orders/docs`, `/inventory/docs`

## Project layout

```plaintext
├── docker-compose.yml          # Service orchestration
├── Makefile                     # Convenience commands
├── gateway/
│   ├── Dockerfile
│   └── nginx.conf              # Reverse proxy routing
├── services/
│   ├── users/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── main.py         # FastAPI endpoints
│   │       ├── models.py       # SQLAlchemy models
│   │       ├── schemas.py      # Pydantic schemas
│   │       ├── crud.py         # Database operations
│   │       ├── database.py     # DB connection
│   │       ├── auth.py         # JWT authentication
│   │       └── config.py       # Configuration
│   ├── orders/
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── main.py
│   │       ├── models.py
│   │       ├── schemas.py
│   │       ├── crud.py
│   │       ├── database.py
│   │       ├── auth.py
│   │       └── clients/
│   │           ├── users_client.py      # User validation
│   │           └── inventory_client.py  # Inventory deduction
│   └── inventory/
│       ├── Dockerfile
│       ├── requirements.txt
│       └── app/
│           ├── main.py
│           ├── models.py
│           ├── schemas.py
│           ├── crud.py
│           ├── database.py
│           └── auth.py
└── web/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── Layout.tsx          # Main layout with sidebar
        │   ├── Sidebar.tsx         # Navigation sidebar
        │   └── DataTable.tsx       # Reusable table component
        ├── pages/
        │   ├── LoginPage.tsx       # Authentication page
        │   ├── UsersPage.tsx       # Users management
        │   ├── OrdersPage.tsx      # Orders management
        │   └── InventoryPage.tsx   # Inventory management
        ├── context/
        │   └── AuthContext.tsx     # Auth state management
        ├── api/
        │   ├── apiClient.ts        # Axios with auth interceptors
        │   ├── usersApi.ts         # Users API calls
        │   ├── ordersApi.ts        # Orders API calls
        │   └── inventoryApi.ts     # Inventory API calls
        └── types/
            └── index.ts            # TypeScript interfaces
```

## Architecture Notes

* **Routing**: Nginx performs path-based routing with trailing-slash normalization:
  * `/users/` → Users service
  * `/orders/` → Orders service  
  * `/inventory/` → Inventory service
  * `/` → React web UI
* **Authentication**: All services use JWT tokens validated against the Users service secret
* **Authorization**: Role-based access control (users see only their data, admins see all)
* **Inventory Management**: Orders service automatically deducts inventory with rollback on failure
* **Health Checks**: All services expose `/healthz` endpoint for monitoring
* **Database**: Each service has its own PostgreSQL 15 database with persistent volumes
* **Network**: All containers communicate on the `msnet` bridge network

## Technology Stack

* **Backend**: Python 3.11, FastAPI, SQLAlchemy, python-jose, passlib, bcrypt
* **Frontend**: React 18, TypeScript, Tailwind CSS, Axios
* **Gateway**: Nginx (Alpine)
* **Database**: PostgreSQL 15 (Alpine)
* **Orchestration**: Docker Compose
