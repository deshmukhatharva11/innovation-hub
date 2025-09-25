#!/usr/bin/env node

/**
 * Railway Deployment Script
 * This script ensures proper deployment to Railway
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Railway deployment...');

// Check if we're in the right directory
if (!fs.existsSync('backend')) {
  console.error('❌ Backend directory not found. Please run from project root.');
  process.exit(1);
}

// Create a simple package.json for Railway if it doesn't exist
const railwayPackageJson = {
  "name": "innovation-hub-railway",
  "version": "1.0.0",
  "description": "Innovation Hub Backend for Railway",
  "main": "backend/server-railway.js",
  "scripts": {
    "start": "cd backend && npm install && node server-railway.js",
    "build": "echo 'No build step required for backend'",
    "dev": "cd backend && npm run dev"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "sequelize": "^6.35.2",
    "pg": "^8.11.5",
    "pg-hstore": "^2.3.4",
    "sqlite3": "^5.1.7",
    "mysql2": "^3.6.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "socket.io": "^4.8.1"
  }
};

// Write the Railway package.json
fs.writeFileSync('package.json', JSON.stringify(railwayPackageJson, null, 2));
console.log('✅ Created Railway package.json');

// Create Procfile for Railway
const procfile = 'web: cd backend && npm install && node server-railway.js';
fs.writeFileSync('Procfile', procfile);
console.log('✅ Created Procfile');

console.log('🎉 Railway deployment files created successfully!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Commit and push these changes to GitHub');
console.log('2. Go to Railway dashboard');
console.log('3. Connect your GitHub repository');
console.log('4. Railway will automatically deploy the backend');
console.log('');
console.log('🔗 Your Railway project: https://railway.com/project/2633092b-d401-4243-a582-35d5747096a9');
