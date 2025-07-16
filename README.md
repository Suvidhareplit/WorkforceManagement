# HRMS Platform - Separated Frontend and Backend

This repository contains a comprehensive Blue Collar HRMS (Human Resource Management System) platform that has been architected with complete separation between frontend and backend, allowing for independent deployment to separate repositories.

## Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/               # Source code
│   ├── package.json       # Frontend dependencies
│   ├── tsconfig.json      # Frontend TypeScript config
│   ├── vite.config.ts     # Vite configuration
│   └── README.md          # Frontend documentation
│
├── server/                 # Backend Express application
│   ├── config/            # Configuration files
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── types/             # TypeScript type definitions
│   ├── schema.ts          # Database schema
│   ├── storage.ts         # Data access layer
│   ├── package.json       # Backend dependencies
│   ├── tsconfig.json      # Backend TypeScript config
│   ├── drizzle.config.ts  # Database configuration
│   └── README.md          # Backend documentation
│
└── README.md              # This file
```

## Architecture Highlights

### Complete Separation
- **No shared code**: Frontend and backend have their own type definitions
- **Independent package.json**: Each has its own dependencies and scripts
- **Separate TypeScript configs**: Optimized for their respective environments
- **Independent deployment**: Can be deployed to separate repositories/servers

### Frontend (client/)
- React 18 with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS with shadcn/ui components
- TanStack Query for efficient data fetching
- Comprehensive type safety with separate API types

### Backend (server/)
- Express.js with TypeScript
- PostgreSQL with Drizzle ORM
- JWT authentication
- RESTful API design
- Complete business logic implementation

## Deployment Options

### Option 1: Deploy to Separate Repositories

1. **Backend Deployment**
   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin <your-backend-repo-url>
   git push -u origin main
   ```

2. **Frontend Deployment**
   ```bash
   cd client
   git init
   git add .
   git commit -m "Initial frontend commit"
   git remote add origin <your-frontend-repo-url>
   git push -u origin main
   ```

### Option 2: Deploy as Microservices

- Deploy backend to services like Railway, Render, or Heroku
- Deploy frontend to Vercel, Netlify, or similar static hosting
- Configure frontend to point to backend API URL via environment variables

### Option 3: Monorepo Deployment

Keep both in the same repository but deploy them independently:
- Use GitHub Actions to deploy backend when `server/` changes
- Use separate workflow to deploy frontend when `client/` changes

## Development

### Running Both Together (Development)

1. Start the backend:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm install
   npm run dev
   ```

### Environment Variables

- Backend: Copy `server/.env.example` to `server/.env` and configure
- Frontend: Copy `client/.env.example` to `client/.env` and configure

## Features

- **Hiring Management**: End-to-end recruitment workflow
- **Training System**: Comprehensive training lifecycle management
- **Employee Management**: Complete employee data management
- **Analytics Dashboard**: Real-time insights and reporting
- **Vendor Management**: Detailed vendor and recruiter tracking
- **Email Integration**: Automated notifications to stakeholders
- **Audit Trail**: Complete tracking of all system changes

## Migration Guide

If you're splitting this into separate repositories:

1. **Backend Repository Setup**
   - Copy the entire `server/` directory
   - Initialize git in the new repository
   - Set up environment variables
   - Deploy to your preferred backend hosting

2. **Frontend Repository Setup**
   - Copy the entire `client/` directory
   - Initialize git in the new repository
   - Update `VITE_API_URL` to point to your deployed backend
   - Deploy to your preferred static hosting

3. **Database Migration**
   - Ensure your backend has access to PostgreSQL
   - Run `npm run db:push` from the backend to set up schema

## Support

For detailed information about each component:
- Backend documentation: `server/README.md`
- Frontend documentation: `client/README.md`