# Microservices Architecture Demo, Version 1.0

© J. Eneas, 2025

A minimal microservices demo consisting of three FastAPI services (users, orders, inventory) behind an Nginx gateway, orchestrated with Docker Compose.

NGINX is an open-source web server software that is widely used as a reverse proxy, load balancer, and high-performance HTTP cache. It efficiently handles incoming web traffic by distributing it across multiple servers, making it a crucial component for modern, scalable web applications, APIs, and microservices. Its event-driven architecture allows it to handle thousands of concurrent connections with low CPU consumption, providing high stability and performance.

Key functions of NGINX:

* **[Reverse Proxy](https://www.google.com/search?client=safari&rls=en&q=Reverse+Proxy&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEAk):** Sits in front of back-end servers to manage client requests, directing them to the appropriate server and returning the response. This can include tasks like SSL/TLS termination and security filtering.
* **[Load Balancer](https://www.google.com/search?client=safari&rls=en&q=Load+Balancer&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEAs):** Distributes incoming network traffic across a group of backend servers to ensure no single server is overwhelmed.
* **[HTTP Cache](https://www.google.com/search?client=safari&rls=en&q=HTTP+Cache&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEA0):** Stores copies of frequently accessed files and data to reduce the need for repeated requests to the backend server, which speeds up performance.
* **[Web Server](https://www.google.com/search?client=safari&rls=en&q=Web+Server&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEA8):** Serves static content like HTML, CSS, and JavaScript files directly and efficiently.
* **[API Gateway](https://www.google.com/search?client=safari&rls=en&q=API+Gateway&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEBE):** Can be used to route API requests, handle authentication, and manage other API-related functions.
* **[Security Tool](https://www.google.com/search?client=safari&rls=en&q=Security+Tool&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEBM):** Functions as a web application firewall, protecting against DDoS attacks by limiting request rates, and can be configured with custom security rules.
* **[Mail Proxy Server](https://www.google.com/search?client=safari&rls=en&q=Mail+Proxy+Server&ie=UTF-8&oe=UTF-8&ved=2ahUKEwjG5N6shKKRAxXQFFkFHcpULY4QgK4QegYIAQgAEBU):** Also supports proxying for email protocols like IMAP, POP3, and SMTP.

## Services

* Gateway (Nginx, acting as the API Gateway): routes requests to backend services via path prefixes
* Users (FastAPI): simple endpoints under `/`
* Orders (FastAPI): simple endpoints under `/`
* Inventory (FastAPI): simple endpoints under `/`

## Prerequisites

* Docker and Docker Compose

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

* Start (detached, rebuild if needed):
  * `make up` or `docker compose up -d --build`
* Follow logs (gateway + services):
  * `make logs`
* Stop everything:
  * `make down`

## UI

* Open `http://localhost:8080/` for the minimal UI served by the gateway.
* Swagger docs: `/users/docs`, `/orders/docs`, `/inventory/docs`.

## Project layout

```plaintext
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

* Nginx performs simple path-based routing (`/users/`, `/orders/`, `/inventory/`).
* Each service exposes a root (`/`) endpoint and a health endpoint (`/healthz`).
