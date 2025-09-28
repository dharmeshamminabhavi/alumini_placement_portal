# 🐳 Simple Docker Guide - Alumni Placement Portal

## Quick Start

1. **Start the application:**
   ```bash
   docker-compose up -d
   ```

2. **Access your application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Basic Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up --build -d
```

## Services

- **mongodb**: Database
- **backend**: Node.js API server  
- **frontend**: React application

## Troubleshooting

```bash
# Check if services are running
docker-compose ps

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Clean up everything
docker-compose down -v
```
