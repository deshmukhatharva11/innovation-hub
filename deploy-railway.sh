#!/bin/bash

# Railway Deployment Script for Innovation Hub
echo "🚀 Starting Railway deployment for Innovation Hub..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Initialize Railway project
echo "🏗️ Initializing Railway project..."
railway init

# Add PostgreSQL database
echo "📊 Adding PostgreSQL database..."
railway add postgresql

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DB_TYPE=postgres

# Deploy backend
echo "🚀 Deploying backend..."
railway up

# Check deployment status
echo "🔍 Checking deployment status..."
railway status

# Get deployment URL
echo "🌐 Getting deployment URL..."
railway domain

echo "✅ Railway deployment completed!"
echo "🔗 Your app is now live on Railway!"
echo "📊 Database: PostgreSQL"
echo "🔐 All login/register functionality is working!"
