#!/bin/bash
echo "🚀 Starting Innovation Hub Full-Stack Application..."

# Build the frontend
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Start the full-stack server
echo "🌐 Starting full-stack server..."
cd backend
node server-full-stack.js
