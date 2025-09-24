---
description: Repository Information Overview
alwaysApply: true
---

# Innovation Hub Management System

## Summary
A full-stack web application for managing innovative ideas, connecting students, college admins, and incubator managers. The system facilitates idea submission, review, endorsement, and incubation processes with comprehensive analytics and collaboration features.

## Structure
- **frontend/**: React-based web client with Redux state management
- **backend/**: Node.js Express API server with Sequelize ORM
- **testsprite_tests/**: Testing utilities and configuration

## Projects

### Backend (Node.js API)
**Configuration File**: package.json

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js v14+ (recommended)
**Framework**: Express.js
**Database**: SQLite (configured), MySQL (supported)
**ORM**: Sequelize

#### Dependencies
**Main Dependencies**:
- express: ^4.18.2 (Web framework)
- sequelize: ^6.35.2 (ORM)
- jsonwebtoken: ^9.0.2 (Authentication)
- bcryptjs: ^2.4.3 (Password hashing)
- multer: ^1.4.5-lts.1 (File uploads)
- sqlite3: ^5.1.7 (Database)
- nodemailer: ^6.9.7 (Email notifications)

#### Build & Installation
```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
```

#### Testing
**Framework**: Jest
**Test Location**: Not explicitly defined, likely in a /tests directory
**Run Command**:
```bash
npm test
npm run test:watch
```

### Frontend (React Application)
**Configuration File**: package.json

#### Language & Runtime
**Language**: JavaScript (React)
**Version**: React 19.1.0
**Build System**: Create React App
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react: ^19.1.0
- react-dom: ^19.1.0
- @reduxjs/toolkit: ^2.0.1
- react-redux: ^9.0.4
- react-router-dom: ^6.20.1
- axios: ^1.6.2
- formik: ^2.4.5
- yup: ^1.4.0
- react-hot-toast: ^2.4.1

**Development Dependencies**:
- tailwindcss: ^3.3.6
- json-server: ^0.17.4 (Mock API)

#### Build & Installation
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

#### Testing
**Framework**: Jest with React Testing Library
**Test Files**: src/**/*.test.js
**Run Command**:
```bash
npm test
```

**targetFramework**: Jest

## Database Schema
The application uses Sequelize ORM with SQLite (default) or MySQL:

**Core Tables**:
- Users: Authentication and profile information
- Colleges: Educational institution information
- Incubators: Innovation center information
- Ideas: Core idea information and status tracking
- TeamMembers: Team collaboration data
- IdeaFiles: File upload management
- Comments: Interactive feedback system
- Likes: Engagement tracking

## API Endpoints
The backend provides RESTful API endpoints for:
- Authentication (/api/auth)
- Users management (/api/users)
- Ideas management (/api/ideas)
- Colleges management (/api/colleges)
- Incubators management (/api/incubators)
- Analytics (/api/analytics)
- Notifications (/api/notifications)