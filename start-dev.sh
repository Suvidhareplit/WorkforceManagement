#!/bin/bash

# Development startup script for HRMS
# This script starts both frontend and backend on different ports

echo "🚀 Starting HRMS Development Environment..."
echo ""

# Function to check if port is in use and kill the process if needed
check_and_kill_port() {
    local port=$1
    local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo "⚠️  Port $port is in use by process $pid. Killing process..."
        kill -9 $pid 2>/dev/null
        sleep 1
        echo "✅ Port $port is now available"
    else
        echo "✅ Port $port is available"
    fi
}

# Kill any existing processes on ports 3000 and 5000
echo "📡 Checking and freeing ports..."
check_and_kill_port 3000
check_and_kill_port 5000
echo ""

# Start backend
echo "🔧 Starting Backend (API) on port 5000..."
cd server
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend on port 3000..."
cd client
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "🎉 Development environment started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
