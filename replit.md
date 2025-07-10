# Blue Collar HRMS Platform

## Overview
This is a comprehensive Blue Collar HRMS (Human Resource Management System) platform built with a full-stack architecture using React, TypeScript, Express.js, and PostgreSQL. The application covers end-to-end workforce management including hiring, interviews, training, employee lifecycle management, and analytics.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Uploads**: Multer for handling file uploads
- **Email Service**: Nodemailer for email notifications
- **HTTP Client**: Axios for all API requests (frontend and backend)
- **Project Structure**: Organized following MVC pattern with proper separation

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Core Modules
1. **Hiring Management (ATS)**
   - Create hiring requests with automatic position splitting
   - Dynamic city/cluster filtering
   - Request tracking and status management

2. **Interview Management**
   - Candidate application portal
   - Multi-stage interview process (prescreening, technical rounds)
   - Offer management system

3. **Training System**
   - Induction training management
   - Classroom and field training modules
   - Training progress tracking

4. **Employee Lifecycle**
   - Employee onboarding and management
   - Action tracking and performance monitoring
   - Exit management with different exit types

5. **Master Data Management**
   - Cities, clusters, and roles configuration
   - Vendor and recruiter management
   - Dynamic dropdown relationships

6. **Analytics Dashboard**
   - Hiring pipeline analytics
   - Performance metrics and KPIs
   - Real-time reporting

### UI Components
- **Design System**: shadcn/ui with consistent styling
- **Responsive Layout**: Mobile-first design with sidebar navigation
- **Interactive Elements**: Forms, modals, tables, and charts
- **Theme Support**: CSS variables for light/dark mode compatibility

## Data Flow

### Request Flow
1. User creates hiring request through the frontend form
2. Frontend validates data using Zod schemas
3. Request sent to Express.js API endpoints
4. Backend validates with middleware and processes business logic
5. Data persisted to PostgreSQL via Drizzle ORM
6. Response sent back to frontend with updated state
7. TanStack Query invalidates and refetches relevant data

### Authentication Flow
1. User submits login credentials
2. Backend verifies credentials against database
3. JWT token generated and returned to client
4. Token stored and included in subsequent API requests
5. Middleware validates token on protected routes

### File Upload Flow
1. Files uploaded through Multer middleware
2. File validation and storage to local filesystem
3. File metadata stored in database
4. Cleanup utilities for file management

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript support
- **Styling**: Tailwind CSS, Radix UI primitives
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Hookform resolvers
- **Validation**: Zod for schema validation
- **Icons**: Lucide React for consistent iconography
- **HTTP Client**: Axios for all API communications with interceptors

### Backend Dependencies
- **Server**: Express.js with TypeScript following MVC architecture
- **Database**: Drizzle ORM with PostgreSQL driver
- **Authentication**: JWT and bcrypt
- **File Handling**: Multer for uploads
- **Email**: Nodemailer for notifications
- **Validation**: Zod for request validation
- **Project Structure**: 
  - `routes/`: Express route definitions only
  - `controllers/`: Request/response logic and business operations
  - `models/`: Database schema and query functions
  - `middlewares/`: Reusable middleware (auth, validation, error handling)
  - `config/`: Environment and database configurations
  - `services/`: Business logic and reusable operations
  - `utils/`: Helper utilities, validators, formatters, constants

### Development Tools
- **Build**: Vite for frontend, esbuild for backend
- **Database**: Drizzle Kit for schema management
- **TypeScript**: Strict configuration with path mapping
- **Linting**: Configured for consistent code style

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with nodemon-like functionality
- **Database**: Local PostgreSQL or Neon development database
- **Environment**: NODE_ENV=development with debug logging

### Production Build
- **Frontend**: Vite build to static assets in dist/public
- **Backend**: esbuild bundle to dist/index.js
- **Assets**: Static file serving from Express
- **Database**: Production PostgreSQL with connection pooling

### Environment Configuration
- **Database**: DATABASE_URL for connection string
- **JWT**: JWT_SECRET for token signing
- **Email**: SMTP configuration for notifications
- **File Storage**: Local filesystem with configurable upload directory

### Deployment Architecture
- **Monorepo**: Single repository with frontend and backend
- **Build Process**: Sequential build of frontend then backend
- **Static Assets**: Frontend builds to backend's public directory
- **API Routes**: All backend routes prefixed with /api
- **Fallback**: SPA fallback for client-side routing