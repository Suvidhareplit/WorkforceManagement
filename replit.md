# Blue Collar HRMS Platform

## Overview
This is a comprehensive Blue Collar HRMS (Human Resource Management System) platform built with a full-stack architecture using React, TypeScript, Express.js, and PostgreSQL. The application covers end-to-end workforce management including hiring, interviews, training, employee lifecycle management, and analytics.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **July 16, 2025**: MAJOR ARCHITECTURE CHANGE - Removed all Drizzle ORM dependencies and switched to raw SQL queries
- **July 16, 2025**: Created new SQL-based storage implementation (server/storage-sql.ts) with complete feature parity
- **July 16, 2025**: Migrated from @neondatabase/serverless to standard pg library for database connections
- **July 16, 2025**: Created raw SQL schema file (server/sql/schema.sql) for database structure
- **July 16, 2025**: Added database initialization script (server/scripts/init-db.ts) to set up tables and indexes
- **July 16, 2025**: Removed drizzle.config.ts, schema.ts, and all Drizzle-related configurations
- **July 16, 2025**: MAJOR REFACTORING - Completely separated frontend and backend with no shared code for independent deployment
- **July 16, 2025**: Created separate type definitions: server/types/models.ts for backend, client/src/types/api.ts for frontend
- **July 16, 2025**: Created independent package.json files for client/ and server/ directories
- **July 16, 2025**: Set up separate TypeScript configurations for frontend and backend
- **July 16, 2025**: Fixed database schema password field name from password_hash to password
- **July 16, 2025**: Created separate Vite config for frontend and removed Drizzle config from backend
- **July 16, 2025**: Added comprehensive README documentation for root, frontend, and backend
- **July 16, 2025**: Fixed all backend imports to use local schema references instead of @shared/schema
- **July 16, 2025**: Successfully removed shared folder - complete separation achieved
- **July 16, 2025**: Created comprehensive Hiring Analytics module with email functionality for vendor SPOCs
- **July 16, 2025**: Built city/role/cluster-wise hiring request analytics table with filtering and selection
- **July 16, 2025**: Added Gmail email service integration for sending hiring requests to vendor city recruitment SPOCs
- **July 16, 2025**: Updated analytics summary cards to show Total Hiring Requests, Open Positions, and Closed Positions
- **July 16, 2025**: Implemented comprehensive vendor details system with commercial terms and contact information
- **July 16, 2025**: Added new database fields for vendors: management fees, sourcing fee, replacement days, and SPOC contacts
- **July 16, 2025**: Created detailed vendor details dialog with commercial terms table and contact matrix
- **July 16, 2025**: Updated vendor table with "View Details" button using Eye icon for easy access
- **July 16, 2025**: Added support for multiple vendor contact points: Delivery Lead, City Recruitment SPOC, Business Head, Payroll SPOC
- **July 16, 2025**: Removed all mock data from dashboard cards, replaced with proper "No data available" indicators
- **July 16, 2025**: Updated recruiter management: added City field mapping and removed Incentive Structure field
- **July 16, 2025**: Modified database schema for recruiters (removed incentive_structure column, added city_id with foreign key)
- **July 16, 2025**: Decided to continue using Neon PostgreSQL database (stable and working with all data)
- **July 16, 2025**: Cleaned up all backup files, migration scripts, and old Drizzle configuration files
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

### Project Structure (SEPARATED ARCHITECTURE)
- **Complete Separation**: Frontend and backend are now completely independent with no shared code
- **Independent Deployment**: Can be deployed to separate repositories or servers
- **Separate Dependencies**: Each has its own package.json and node_modules
- **Type Safety**: Separate type definitions maintained in each codebase

### Frontend Architecture (client/)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds
- **Type Definitions**: client/src/types/api.ts for all API interfaces
- **Package Management**: Standalone package.json in client directory

### Backend Architecture (server/)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: Raw SQL queries with pg (PostgreSQL) client - NO ORM
- **Database Schema**: Defined in server/sql/schema.sql
- **Storage Layer**: SQL-based implementation in server/storage-sql.ts
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Uploads**: Multer for handling file uploads
- **Email Service**: Nodemailer for email notifications
- **HTTP Client**: Axios for all API requests
- **Project Structure**: Organized following MVC pattern with proper separation
- **Type Definitions**: server/types/models.ts for all backend models
- **Package Management**: Standalone package.json in server directory

### Database Architecture
- **Database**: PostgreSQL (standard PostgreSQL instance)
- **Schema Management**: Raw SQL migrations (server/sql/schema.sql)
- **Connection**: Connection pooling with standard pg library
- **Schema Location**: Raw SQL schema in server/sql/schema.sql

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

### Development Environment (SEPARATED)
- **Frontend**: Vite dev server on port 3000 (cd client && npm run dev)
- **Backend**: tsx on port 5000 (cd server && npm run dev)
- **Database**: PostgreSQL (Neon or local)
- **Proxy**: Frontend proxies /api requests to backend in development

### Production Build (INDEPENDENT)
- **Frontend**: Vite build creates static assets in client/dist
- **Backend**: esbuild creates server bundle in server/dist
- **Deployment**: Can be deployed to separate services/repositories

### Environment Configuration
- **Frontend Environment**: client/.env (VITE_API_URL for production)
- **Backend Environment**: server/.env (DATABASE_URL, JWT_SECRET, email configs)
- **Separation**: Each has its own .env.example file

### Deployment Options
1. **Separate Repositories**
   - Split client/ and server/ into independent Git repositories
   - Deploy backend to Railway/Render/Heroku
   - Deploy frontend to Vercel/Netlify/CloudFlare Pages
   
2. **Microservices Architecture**
   - Backend as API service with CORS enabled
   - Frontend as static site pointing to backend URL
   
3. **Monorepo with Independent Deployment**
   - Keep single repository but deploy independently
   - Use CI/CD to deploy based on changed directories