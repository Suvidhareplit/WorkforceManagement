# Blue Collar HRMS Platform

## Overview
This is a comprehensive Blue Collar HRMS (Human Resource Management System) platform built with a full-stack architecture using React, TypeScript, Express.js, and PostgreSQL. The application covers end-to-end workforce management including hiring, interviews, training, employee lifecycle management, and analytics.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **July 16, 2025**: Implemented comprehensive vendor details system with commercial terms and contact information
- **July 16, 2025**: Added new database fields for vendors: management fees, sourcing fee, replacement days, and SPOC contacts
- **July 16, 2025**: Created detailed vendor details dialog with commercial terms table and contact matrix
- **July 16, 2025**: Updated vendor table with "View Details" button using Eye icon for easy access
- **July 16, 2025**: Added support for multiple vendor contact points: Delivery Lead, City Recruitment SPOC, Business Head, Payroll SPOC
- **July 16, 2025**: Removed all mock data from dashboard cards, replaced with proper "No data available" indicators
- **July 16, 2025**: Updated recruiter management: added City field mapping and removed Incentive Structure field
- **July 16, 2025**: Modified database schema for recruiters (removed incentive_structure column, added city_id with foreign key)
- **July 14, 2025**: Replaced role description text field with file upload functionality for Job Description (JD) attachments
- **July 14, 2025**: CRITICAL FIX - Removed backend filtering of inactive items so deactivated items can be reactivated
- **July 14, 2025**: Fixed toggle functionality - inactive items now remain visible with proper status indicators  
- **July 13, 2025**: Simplified and centralized API structure from plural to singular endpoints (cities → city, roles → role, etc.)
- **July 13, 2025**: Fixed "roles?.filter is not a function" errors by adding proper array validation with fallback empty arrays
- **July 13, 2025**: Resolved SelectItem empty value prop issues by using "all" instead of empty strings for filter dropdowns
- **July 13, 2025**: Added database ID parsing validation to prevent "NaN" errors in hiring request controllers
- **July 13, 2025**: Updated hiring pages to use simplified API endpoints and safe array handling
- **July 12, 2025**: Replaced delete functionality with Active/Inactive toggle switches for all master data
- **July 12, 2025**: Implemented comprehensive audit trail system for status changes and edits
- **July 12, 2025**: Fixed browser dialog issues by removing confirm() calls and using toggle switches
- **July 12, 2025**: Added backend routes for toggle status and edit operations with complete code linking
- **July 12, 2025**: Fixed SelectItem validation errors and improved form initialization
- **July 12, 2025**: Fixed authentication system with consistent JWT secret keys
- **July 12, 2025**: Updated user management table to display all required fields: Name, Phone, Email, User ID, Role, Manager, City, Cluster, Password
- **July 12, 2025**: Added complete user creation form with Manager, City, and Cluster selection dropdowns
- **July 12, 2025**: Resolved Select component value prop errors and token expiration handling

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
1. User submits login credentials via email and password
2. Backend verifies credentials against database using bcrypt
3. JWT token generated with consistent secret key and returned to client
4. Token stored in localStorage and included in subsequent API requests via Axios interceptors
5. Authentication middleware validates token on protected routes using same secret key
6. Automatic token expiration handling with cleanup and redirect to login

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