# HRMS Backend

This is the backend server for the HRMS (Human Resource Management System) platform.

## Technologies

- Node.js with Express.js
- TypeScript
- PostgreSQL with Drizzle ORM
- JWT Authentication
- Multer for file uploads
- Nodemailer for email notifications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your database URL and other environment variables in `.env`

4. Push database schema:
```bash
npm run db:push
```

## Development

Run the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- GET `/api/auth/me` - Get current user

### Master Data
- `/api/master-data/city` - Cities management
- `/api/master-data/cluster` - Clusters management
- `/api/master-data/role` - Roles management
- `/api/master-data/vendor` - Vendors management
- `/api/master-data/recruiter` - Recruiters management

### User Management
- `/api/users` - User CRUD operations
- `/api/users/bulk` - Bulk user creation

### Hiring
- `/api/hiring/requests` - Hiring requests management
- `/api/hiring/candidates` - Candidates management

### Training
- `/api/training/sessions` - Training sessions management

### Analytics
- `/api/analytics/hiring` - Hiring analytics
- `/api/analytics/pipeline` - Candidate pipeline analytics

## Build

Build for production:
```bash
npm run build
```

Run production build:
```bash
npm start
```

## Database Migrations

Push schema changes to database:
```bash
npm run db:push
```