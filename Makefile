# Makefile for E-Commerce CDC Lakehouse Platform
.PHONY: help install build test run docker-build docker-run clean

help:
	@echo "Available commands:"
	@echo "  install      - Install application dependencies"
	@echo "  build        - Build production assets"
	@echo "  test         - Run domain test suite"
	@echo "  run          - Run live server on port 3000"
	@echo "  docker-build - Build Docker container"
	@echo "  docker-run   - Run Docker container"

install:
	npm install

build:
	npm run build || true

test:
	node -e "require('./server.js')" || true
	python tests/test_cdc_lakehouse_suite.py

run:
	node server.js

docker-build:
	docker build -t ecommerce-cdc-lakehouse:latest .

docker-run:
	docker run -p 3000:3000 ecommerce-cdc-lakehouse:latest

clean:
	rm -rf dist build coverage
