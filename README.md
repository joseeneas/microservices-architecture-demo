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

### Core Features
* **Authentication & Authorization**: JWT-based authentication with role-based access control (user/admin)
* **Inter-Service Communication**: Orders service validates users and inventory via HTTP calls
* **Automatic Inventory Management**: Orders automatically deduct inventory with rollback on failure
* **Modern React UI**: SPA with sidebar navigation, data tables, search, and authentication flow
* **PostgreSQL Persistence**: Each service has its own database with health checks
* **API Gateway**: Nginx reverse proxy with path-based routing and trailing-slash normalization

### Advanced Features
* **CSV Import/Export**: Bulk import/export for users, orders, and inventory with upsert support
* **Analytics Dashboard**: Real-time metrics, revenue tracking, and low stock alerts
* **Order History Timeline**: Visual timeline of order events with status transitions
* **Performance Optimizations**: Redis caching, database indexes, and frontend lazy loading
* **Enhanced Validations**: Order item validation, status transition validation, and total verification
* **Webhook System**: HTTP POST notifications for order events (configurable via environment variables)

## Services

* **Gateway** (Nginx): Routes requests to backend services and web UI
* **Users** (FastAPI + PostgreSQL): User management with authentication endpoints
* **Orders** (FastAPI + PostgreSQL): Order management with user/inventory validation and event tracking
* **Inventory** (FastAPI + PostgreSQL): Inventory tracking with automatic deduction
* **Web** (React + TypeScript): Modern SPA with Tailwind CSS and lazy loading
* **Redis** (Redis 7): Caching layer for performance optimization

## Prerequisites

* Docker and Docker Compose

## Quick Start

### First Time Setup

```sh
# 1. Start all services (builds images and starts containers)
make up
# or: docker compose up -d --build

# 2. Wait for services to be healthy (about 30 seconds)
docker compose ps

# 3. (Optional) Apply database indexes for better performance
docker exec microservices-architecture-demo-users-db-1 psql -U users -d usersdb -c "
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);"

docker exec microservices-architecture-demo-orders-db-1 psql -U orders -d ordersdb -c "
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);"

docker exec microservices-architecture-demo-inventory-db-1 psql -U inventory -d inventorydb -c "
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_qty ON inventory(qty);
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);"

# 4. Open the web UI
open http://localhost:8080/
```

### Login Credentials

**Test Admin Account:**
- Email: `admin@test.com`
- Password: `password123`
- Role: `admin` (full access)

### Using the Web UI

1. **Dashboard** - View metrics, revenue, recent orders, and low stock alerts
2. **Users** - Manage user accounts (admin only)
3. **Orders** - Create and manage orders, view timeline of events
4. **Inventory** - Track inventory levels and stock
5. **Settings** - Configure user preferences

### API Testing

```sh
# Get authentication token
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Save the access_token from response
TOKEN="your-jwt-token-here"

# Access protected endpoints
curl http://localhost:8080/users/ -H "Authorization: Bearer $TOKEN"
curl http://localhost:8080/orders/ -H "Authorization: Bearer $TOKEN"
curl http://localhost:8080/inventory/ -H "Authorization: Bearer $TOKEN"

# View order timeline
curl http://localhost:8080/orders/ORDER_ID/timeline -H "Authorization: Bearer $TOKEN"

# Get analytics
curl http://localhost:8080/orders/analytics -H "Authorization: Bearer $TOKEN"
```

## Operations

### Start/Stop

```sh
# Start all services (with rebuild)
make up
# or: docker compose up -d --build

# Start without rebuilding
docker compose up -d

# Stop all services
make down
# or: docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v
```

### Monitoring

```sh
# View all service status
docker compose ps

# Follow logs for all services
make logs
# or: docker compose logs -f

# View logs for specific service
docker compose logs -f users
docker compose logs -f orders
docker compose logs -f inventory
docker compose logs -f gateway
docker compose logs -f redis

# Check service health
curl http://localhost:8080/users/healthz
curl http://localhost:8080/orders/healthz
curl http://localhost:8080/inventory/healthz
```

### Rebuilding Services

```sh
# Rebuild specific service
docker compose build users
docker compose build orders
docker compose build web

# Restart specific service
docker compose restart users
docker compose restart gateway

# Rebuild and restart
make rebuild
# or: docker compose up -d --build --force-recreate
```

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

## Architecture

> 📊 **[View Detailed Architecture Diagrams](./ARCHITECTURE.md)** - System overview, request flows, data models, security, and deployment views

### Routing

Nginx gateway performs path-based routing with trailing-slash normalization:
- `/users/` → Users service (port 8000)
- `/orders/` → Orders service (port 8000)
- `/inventory/` → Inventory service (port 8000)
- `/` → React web UI (port 80)

### Authentication & Authorization

- **JWT Tokens**: All services use JWT tokens (30-minute expiration)
- **Secret Key**: Shared secret key in `services/users/app/config.py` (should be env var in production)
- **Role-Based Access**:
  - **Users**: See only their own data
  - **Admins**: Full access to all resources
- **Protected Endpoints**: Most endpoints require Bearer token in Authorization header

### Data Validation

**Order Validation** (enforced in `services/orders/app/validators.py`):
- Maximum 100 items per order
- No duplicate SKUs allowed
- Quantity limits: 1-10,000 per item
- Price limits: $0-$1,000,000 per item
- Order total must match sum of (quantity × price)

**Status Transitions** (enforced state machine):
- `pending` → `processing` or `cancelled`
- `processing` → `shipped` or `cancelled`
- `shipped` → `delivered` or `cancelled`
- `cancelled` → `pending` (reactivation)
- `delivered` → terminal state (no further transitions)

### Inventory Management

- **Automatic Deduction**: Orders automatically deduct inventory when created (if status ≠ "cancelled")
- **Automatic Restoration**: Cancelling an order restores inventory
- **Reactivation**: Reactivating a cancelled order re-deducts inventory
- **Rollback Logic**: If deduction fails mid-transaction, changes are rolled back
- **Validation**: Orders service validates inventory availability before creation

### Event Tracking

All order operations are logged to `order_events` table:
- **Event Types**: `created`, `status_changed`, `updated`, `deleted`
- **Timeline View**: Accessible at `/orders/{id}/timeline`
- **Audit Trail**: Includes user_id, timestamps, old/new values

### Performance Optimizations

**Backend:**
- Redis caching layer (separate DB per service)
- Database indexes on frequently queried columns
- Async webhook delivery with timeout

**Frontend:**
- React.lazy() for code splitting
- React Query with 5-minute stale time
- Lazy loading of heavy components

### Webhooks

Configure webhook URLs via environment variable:
```sh
WEBHOOK_URLS=https://example.com/webhook1,https://example.com/webhook2
```

Webhook events:
- `order.created` - New order created
- `order.status_changed` - Order status updated
- `order.updated` - Order details modified
- `order.deleted` - Order removed

Payload format:
```json
{
  "event": "order.created",
  "data": { /* order data */ },
  "timestamp": "2025-12-19T21:00:00Z"
}
```

### Health Checks

- All services expose `/healthz` endpoint
- PostgreSQL databases have health checks (5s interval)
- Redis has health check via `redis-cli ping`

### Database

- Each service has its own PostgreSQL 15 database
- Persistent volumes for data retention
- Databases: `usersdb`, `ordersdb`, `inventorydb`
- Redis: Separate logical databases (0=users, 1=orders, 2=inventory)

### Network

All containers communicate on the `msnet` bridge network using service names as hostnames.

## Technology Stack

* **Backend**: Python 3.11, FastAPI, SQLAlchemy, python-jose, passlib, bcrypt, httpx
* **Frontend**: React 19, TypeScript, Tailwind CSS, Axios, React Query, React Router
* **Gateway**: Nginx 1.27 (Alpine)
* **Database**: PostgreSQL 15 (Alpine)
* **Cache**: Redis 7 (Alpine)
* **Orchestration**: Docker Compose

## Troubleshooting

### Login Issues ("Method Not Allowed")

If you get "Method Not Allowed" errors when logging in:
```sh
# Restart the gateway to fix routing
docker compose restart gateway

# Wait 2-3 seconds, then try again
```

### Services Not Starting

```sh
# Check service status
docker compose ps

# View service logs
docker compose logs users

# Ensure databases are healthy
docker compose ps | grep healthy
```

### Database Connection Issues

```sh
# Restart database containers
docker compose restart users-db orders-db inventory-db

# Wait for health checks to pass
docker compose ps
```

### Redis Connection Issues

```sh
# Check Redis is running
docker compose ps redis

# Test Redis connection
docker exec microservices-architecture-demo-redis-1 redis-cli ping
# Should return: PONG
```

### Clean Start

If you encounter persistent issues:
```sh
# Stop and remove everything (including volumes)
make down
docker compose down -v

# Rebuild and start fresh
make up
```

## Contributing

This is a demo project for learning purposes. Feel free to:
- Fork and modify for your own learning
- Use as a template for your own microservices projects
- Experiment with additional features

## License

© J. Eneas, 2025 - Demo/Educational purposes
