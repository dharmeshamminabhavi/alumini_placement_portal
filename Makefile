# Makefile for Alumni Placement Portal Docker Management

.PHONY: help dev prod build clean logs shell backup restore test

# Default target
help:
	@echo "Alumni Placement Portal - Docker Management"
	@echo "=========================================="
	@echo ""
	@echo "Available commands:"
	@echo "  dev         - Start development environment with hot reload"
	@echo "  prod        - Start production environment"
	@echo "  build       - Build all Docker images"
	@echo "  clean       - Clean up containers, images, and volumes"
	@echo "  logs        - View logs for all services"
	@echo "  logs-backend - View backend logs"
	@echo "  logs-frontend - View frontend logs"
	@echo "  logs-mongo  - View MongoDB logs"
	@echo "  shell-backend - Access backend container shell"
	@echo "  shell-frontend - Access frontend container shell"
	@echo "  shell-mongo - Access MongoDB shell"
	@echo "  backup      - Backup MongoDB database"
	@echo "  restore     - Restore MongoDB database"
	@echo "  test        - Run tests"
	@echo "  stop        - Stop all services"
	@echo "  restart     - Restart all services"
	@echo "  status      - Show service status"
	@echo ""

# Development environment
dev:
	@echo "Starting development environment with hot reload..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"
	@echo "MongoDB: localhost:27017"

# Production environment
prod:
	@echo "Starting production environment..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "Frontend: http://localhost:80"
	@echo "Backend: http://localhost:5000"

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build
	@echo "Build completed!"

# Clean up
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f
	@echo "Cleanup completed!"

# View logs
logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-mongo:
	docker-compose logs -f mongodb

# Access container shells
shell-backend:
	docker-compose exec backend sh

shell-frontend:
	docker-compose exec frontend sh

shell-mongo:
	docker-compose exec mongodb mongosh

# Database operations
backup:
	@echo "Creating MongoDB backup..."
	docker-compose exec mongodb mongodump --out /data/backup
	@echo "Backup completed! Check ./mongo-backup/"

restore:
	@echo "Restoring MongoDB from backup..."
	docker-compose exec mongodb mongorestore /data/backup
	@echo "Restore completed!"

# Testing
test:
	@echo "Running tests..."
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

# Service management
stop:
	@echo "Stopping all services..."
	docker-compose down

restart:
	@echo "Restarting all services..."
	docker-compose restart

status:
	@echo "Service status:"
	docker-compose ps

# Quick development setup
setup:
	@echo "Setting up development environment..."
	@if [ ! -f .env ]; then cp env.example .env; echo "Created .env file from template"; fi
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Setup completed!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"

# Production deployment
deploy:
	@echo "Deploying to production..."
	docker-compose -f docker-compose.prod.yml up -d --build
	@echo "Production deployment completed!"

# Health check
health:
	@echo "Checking service health..."
	@curl -f http://localhost:5000/api/health || echo "Backend health check failed"
	@curl -f http://localhost:3000 || echo "Frontend health check failed"
