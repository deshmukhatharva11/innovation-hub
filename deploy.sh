#!/bin/bash

# Innovation Hub Deployment Script with Database Fallback
echo "🚀 Starting Innovation Hub Deployment..."

# Function to deploy with PostgreSQL
deploy_with_postgres() {
    echo "📊 Attempting deployment with PostgreSQL..."
    
    # Set PostgreSQL environment variables
    export DB_TYPE=postgres
    export DB_PORT=5432
    
    # Deploy backend
    echo "🔧 Deploying backend with PostgreSQL..."
    cd backend
    npm install --production
    npm run build 2>/dev/null || echo "No build script found, continuing..."
    
    # Start server
    echo "🌐 Starting server with PostgreSQL..."
    node server.js &
    BACKEND_PID=$!
    
    # Wait and test
    sleep 10
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ PostgreSQL deployment successful!"
        return 0
    else
        echo "❌ PostgreSQL deployment failed"
        kill $BACKEND_PID 2>/dev/null
        return 1
    fi
}

# Function to deploy with MySQL
deploy_with_mysql() {
    echo "📊 Attempting deployment with MySQL..."
    
    # Set MySQL environment variables
    export DB_TYPE=mysql
    export DB_PORT=3306
    
    # Deploy backend
    echo "🔧 Deploying backend with MySQL..."
    cd backend
    npm install --production
    npm run build 2>/dev/null || echo "No build script found, continuing..."
    
    # Start server
    echo "🌐 Starting server with MySQL..."
    node server.js &
    BACKEND_PID=$!
    
    # Wait and test
    sleep 10
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo "✅ MySQL deployment successful!"
        return 0
    else
        echo "❌ MySQL deployment failed"
        kill $BACKEND_PID 2>/dev/null
        return 1
    fi
}

# Main deployment logic
echo "🎯 Starting deployment process..."

# Try PostgreSQL first
if deploy_with_postgres; then
    echo "🎉 Deployment completed successfully with PostgreSQL!"
    echo "🌐 Application is running at: http://localhost:3001"
    echo "📊 Database: PostgreSQL"
else
    echo "🔄 PostgreSQL failed, trying MySQL..."
    
    # Try MySQL as fallback
    if deploy_with_mysql; then
        echo "🎉 Deployment completed successfully with MySQL!"
        echo "🌐 Application is running at: http://localhost:3001"
        echo "📊 Database: MySQL"
    else
        echo "❌ Both PostgreSQL and MySQL deployments failed"
        echo "🔍 Please check your database configuration"
        exit 1
    fi
fi

echo "✅ Deployment process completed!"
echo "🔗 Health check: http://localhost:3001/health"
echo "📱 API endpoints: http://localhost:3001/api"
