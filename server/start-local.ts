import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';

// Load environment variables
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session setup (simplified from main server)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Manually configure routes (bypass import issues)
const routeFiles = [
  './routes/auth',
  './routes/cities',
  './routes/clusters',
  './routes/roles',
  './routes/vendors',
  './routes/recruiters',
  './routes/hiringRequests',
  './routes/candidates',
  './routes/users',
  './routes/employees',
  './routes/dashboard'
];

routeFiles.forEach(routePath => {
  try {
    console.log(`Loading route: ${routePath}`);
    const route = require(routePath);
    if (route && typeof route.default === 'function') {
      route.default(app);
    } else if (typeof route === 'function') {
      route(app);
    } else {
      console.error(`Invalid route module: ${routePath}`);
    }
  } catch (err) {
    console.error(`Failed to load route ${routePath}:`, err);
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('HRMS API Server Running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database connected to ${process.env.DATABASE_URL?.split('@')[1] || 'local PostgreSQL'}`);
});
