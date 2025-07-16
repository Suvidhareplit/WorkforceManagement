#!/bin/bash

# HRMS Development Script
# This script runs both frontend and backend in development mode

echo "Starting HRMS Development Environment (Separated Servers)..."
echo "==========================================================="

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n\nShutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up trap to catch interrupts
trap cleanup INT TERM

# Start backend API server
echo "Starting backend API server on port 5000..."
cd server && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend dev server
echo "Starting frontend dev server on port 3000..."
cd ../client && npm run dev &
FRONTEND_PID=$!

echo -e "\n==========================================================="
echo "Development servers running independently:"
echo "- Backend API: http://localhost:5000 (CORS enabled)"
echo "- Frontend: http://localhost:3000 (with API proxy)"
echo ""
echo "API endpoints accessible at http://localhost:5000/api/*"
echo "Frontend will proxy /api/* requests to backend"
echo ""
echo "Press Ctrl+C to stop all services"
echo "==========================================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID