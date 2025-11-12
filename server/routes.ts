import type { Express } from "express";
import { createServer, type Server } from "http";
import cors from 'cors';
import { authRoutes } from "./routes/authRoutes";
import { hiringRoutes } from "./routes/hiringRoutes";
import { interviewRoutes } from "./routes/interviewRoutes";
import { trainingRoutes } from "./routes/trainingRoutes";
import onboardingRoutes from "./routes/onboardingRoutes";
import { userRoutes } from "./routes/userRoutes";
import { masterDataRoutes } from "./routes/masterDataRoutes";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import leaveManagementRoutes from "./routes/leaveManagementRoutes";
import attachmentRoutes from "./routes/attachmentRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure CORS for authentication state persistence
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
  }));

  // Register all route modules
  app.use('/api/auth', authRoutes);
  app.use('/api/hiring', hiringRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/training', trainingRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/master-data', masterDataRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/leave', leaveManagementRoutes);
  app.use('/api/attachments', attachmentRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
