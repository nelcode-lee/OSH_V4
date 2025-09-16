#!/bin/bash

# Start Operator Skills Hub in development mode
echo "🚀 Starting Operator Skills Hub Development Environment"

# Check if .env files exist
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please copy env.local.example to .env.local and configure it."
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found. Please copy backend/env.example to backend/.env and configure it."
    exit 1
fi

# Start backend
echo "🔧 Starting backend server..."
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for processes
wait
