.PHONY: up down logs rebuild

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f gateway users orders inventory

rebuild:
	docker compose build --no-cache
