# HRMS Frontend Application

This is the standalone frontend application for the HRMS (Human Resource Management System) platform. It runs independently and communicates with the backend API server.

## Technologies

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS with shadcn/ui components
- TanStack Query for server state management
- React Hook Form with Zod validation
- Wouter for client-side routing
- Recharts for data visualization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure the API URL in `.env` if needed

## Development

Run the development server:
```bash
npm run dev
```

The application will start on http://localhost:3000

## API Configuration

In development, the frontend proxies all `/api/*` requests to the backend server running on http://localhost:5000.

For production deployment, set the `VITE_API_URL` environment variable to your backend API URL.

## Features

### Dashboard
- Real-time metrics and analytics
- Hiring pipeline visualization
- Quick access to key functions

### Master Data Management
- Cities, Clusters, and Roles configuration
- Vendor and Recruiter management
- Active/Inactive status toggling

### Hiring Management
- Create and manage hiring requests
- Track candidates through the pipeline
- Interview scheduling and feedback

### Training Management
- Induction, classroom, and field training
- Attendance tracking
- Training outcomes recording

### Employee Management
- Employee onboarding
- Document management
- Exit management

### Analytics
- Hiring analytics by city/role/cluster
- Vendor performance metrics
- Recruiter performance tracking
- Email reports to vendor SPOCs

### User Management
- Multi-role user system
- Hierarchical management structure
- Audit trail for all changes

## Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and configurations
│   ├── types/         # TypeScript type definitions
│   └── assets/        # Static assets
├── public/            # Public static files
└── index.html         # Entry HTML file
```