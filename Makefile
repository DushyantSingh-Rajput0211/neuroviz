.PHONY: help up down build clean test seed logs shell-backend shell-processing shell-frontend

# Default target
help:
	@echo "NeuroViz - Neural Signal Visualization Platform"
	@echo ""
	@echo "Available commands:"
	@echo "  up          - Start all services with docker-compose"
	@echo "  down        - Stop all services and remove volumes"
	@echo "  build       - Build all services"
	@echo "  clean       - Clean up containers, images, and volumes"
	@echo "  test        - Run all tests"
	@echo "  seed        - Seed demo data"
	@echo "  logs        - Show logs from all services"
	@echo "  shell-*     - Open shell in specific service"
	@echo ""
	@echo "Development commands:"
	@echo "  dev-backend    - Run backend in development mode"
	@echo "  dev-processing - Run processing service in development mode"
	@echo "  dev-frontend   - Run frontend in development mode"

# Main commands
up:
	@echo "Starting NeuroViz services..."
	docker-compose up --build -d
	@echo "Services starting up..."
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost/api"
	@echo "Processing API: http://localhost/py"
	@echo "Demo user: demo@neuroviz.ai / Demo@123"

down:
	@echo "Stopping NeuroViz services..."
	docker-compose down

build:
	@echo "Building all services..."
	docker-compose build

clean:
	@echo "Cleaning up..."
	docker-compose down -v --rmi all
	docker system prune -f

# Testing
test:
	@echo "Running all tests..."
	@echo "Backend tests..."
	cd backend && ./gradlew test
	@echo "Processing tests..."
	cd processing && python -m pytest
	@echo "Frontend tests..."
	cd frontend && npm test

test-backend:
	cd backend && ./gradlew test

test-processing:
	cd processing && python -m pytest

test-frontend:
	cd frontend && npm test

# Seeding
seed:
	@echo "Seeding demo data..."
	@if [ ! -f .env ]; then cp env.example .env; fi
	python scripts/seed/seed_demo_data.py

# Logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-processing:
	docker-compose logs -f processing

logs-frontend:
	docker-compose logs -f frontend

# Shell access
shell-backend:
	docker-compose exec backend /bin/bash

shell-processing:
	docker-compose exec processing /bin/bash

shell-frontend:
	docker-compose exec frontend /bin/bash

shell-postgres:
	docker-compose exec postgres psql -U neuro -d neuroviz

# Development mode (local)
dev-backend:
	@echo "Starting backend in development mode..."
	cd backend && ./gradlew bootRun

dev-processing:
	@echo "Starting processing service in development mode..."
	cd processing && uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

dev-frontend:
	@echo "Starting frontend in development mode..."
	cd frontend && npm run dev

# Health checks
health:
	@echo "Checking service health..."
	@echo "Backend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost/api/actuator/health || echo 'DOWN')"
	@echo "Processing: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost/py/health || echo 'DOWN')"
	@echo "Frontend: $$(curl -s -o /dev/null -w '%{http_code}' http://localhost || echo 'DOWN')"

# Database operations
db-migrate:
	cd backend && ./gradlew flywayMigrate

db-reset:
	docker-compose down -v
	docker-compose up postgres -d
	sleep 10
	make db-migrate

# Quick start
quickstart:
	@echo "Quick start - setting up NeuroViz..."
	@if [ ! -f .env ]; then cp env.example .env; fi
	make up
	sleep 30
	make seed
	@echo "Setup complete! Open http://localhost"
