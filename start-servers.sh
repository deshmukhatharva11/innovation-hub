#!/bin/bash
echo "Starting Innovation Hub servers..."

echo ""
echo "Starting Backend Server (Port 3001)..."
cd backend && node server.js &
BACKEND_PID=$!

echo ""
echo "Waiting 3 seconds for backend to initialize..."
sleep 3

echo ""
echo "Starting Frontend Server (Port 3000)..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting up!"
echo "Backend:  http://localhost:3001 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
