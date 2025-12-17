.PHONY: help install dev up down logs clean test

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development environment"
	@echo "  make up         - Start all services with Docker"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - View logs"
	@echo "  make clean      - Clean up containers and volumes"
	@echo "  make test       - Run tests"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

dev:
	docker-compose up

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	rm -rf backend/__pycache__
	rm -rf frontend/.next
	rm -rf frontend/node_modules

test:
	cd backend && pytest
	cd frontend && npm test
