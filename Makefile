# Makefile for iFarm Docker Management
# Simplifies common Docker commands

.PHONY: help dev build up down logs restart clean test

# Default target
help:
	@echo "iFarm Docker Management Commands:"
	@echo ""
	@echo "  make dev          - Start local development environment"
	@echo "  make build        - Build Docker images"
	@echo "  make up           - Start services"
	@echo "  make down         - Stop services"
	@echo "  make logs         - View logs"
	@echo "  make restart      - Restart services"
	@echo "  make clean        - Remove containers and volumes"
	@echo "  make staging      - Start staging environment"
	@echo "  make production   - Start production environment"
	@echo "  make test         - Run tests"
	@echo ""

# Local Development
dev:
	@echo "Starting local development environment..."
	docker-compose up -d
	@echo "Frontend: http://localhost:3000"
	@echo "Redis: localhost:6379"

build:
	@echo "Building Docker images..."
	docker-compose build --no-cache

up:
	@echo "Starting services..."
	docker-compose up -d

down:
	@echo "Stopping services..."
	docker-compose down

logs:
	docker-compose logs -f

restart:
	@echo "Restarting services..."
	docker-compose restart

clean:
	@echo "Cleaning up containers and volumes..."
	docker-compose down -v
	docker system prune -f

# Staging Environment
staging:
	@echo "Starting staging environment..."
	docker-compose -f docker-compose.staging.yml --env-file .env.staging up -d

staging-down:
	@echo "Stopping staging environment..."
	docker-compose -f docker-compose.staging.yml down

staging-logs:
	docker-compose -f docker-compose.staging.yml logs -f

# Production Environment
production:
	@echo "Starting production environment..."
	@echo "WARNING: Make sure .env.production is configured!"
	docker-compose -f docker-compose.production.yml --env-file .env.production up -d

production-down:
	@echo "Stopping production environment..."
	docker-compose -f docker-compose.production.yml down

production-logs:
	docker-compose -f docker-compose.production.yml logs -f

# Testing
test:
	@echo "Running tests..."
	docker-compose exec frontend npm test

# Database Commands (when backend is ready)
migrate:
	@echo "Running database migrations..."
	docker-compose exec backend python manage.py migrate

migrate-staging:
	docker-compose -f docker-compose.staging.yml exec backend python manage.py migrate

migrate-production:
	docker-compose -f docker-compose.production.yml exec backend python manage.py migrate

# Utility Commands
shell:
	docker-compose exec frontend sh

shell-backend:
	docker-compose exec backend bash

redis-cli:
	docker-compose exec redis redis-cli

psql:
	docker-compose exec postgres psql -U ifarm -d ifarm

# Health Checks
health:
	@echo "Checking service health..."
	@docker-compose ps
	@echo ""
	@echo "Testing endpoints..."
	@curl -s http://localhost:3000/api/health || echo "Frontend not responding"
	@docker-compose exec redis redis-cli ping || echo "Redis not responding"

# Backup (when backend is ready)
backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U ifarm ifarm > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Install dependencies (local)
install:
	@echo "Installing dependencies..."
	npm install

# Lint
lint:
	@echo "Running linter..."
	docker-compose exec frontend npm run lint

# Format code
format:
	@echo "Formatting code..."
	docker-compose exec frontend npm run format || echo "Format script not found"

