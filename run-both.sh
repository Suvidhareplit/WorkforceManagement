#!/bin/bash
# This script runs both backend and frontend servers

# Kill any existing processes on ports 5000 and 3000
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend
cd server && NODE_ENV=development tsx index.ts &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
cd ../client && npm run dev &
FRONTEND_PID=$!

echo "Servers started:"
echo "Backend API: http://localhost:5000 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID