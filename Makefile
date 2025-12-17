.PHONY: help install dev up down logs clean backend frontend pipeline

help:
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start both frontend and backend"
	@echo "  make backend    - Start backend only"
	@echo "  make frontend   - Start frontend only"
	@echo "  make pipeline   - Run data ingestion pipeline"
	@echo "  make up         - Start with Docker Compose"
	@echo "  make down       - Stop all services"
	@echo "  make logs       - View logs"
	@echo "  make clean      - Clean up everything"

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	cd data-pipeline && pip install -r requirements.txt

backend:
	cd backend && uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev

pipeline:
	cd data-pipeline && python ingest.py

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
	rm -rf data-pipeline/processed/*
