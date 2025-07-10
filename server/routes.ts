import type { Express } from "express";
import { createServer, type Server } from "http";
import { authRoutes } from "./routes/authRoutes";
import { hiringRoutes } from "./routes/hiringRoutes";
import { interviewRoutes } from "./routes/interviewRoutes";
import { trainingRoutes } from "./routes/trainingRoutes";
import { employeeRoutes } from "./routes/employeeRoutes";
import { masterDataRoutes } from "./routes/masterDataRoutes";
import { analyticsRoutes } from "./routes/analyticsRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all route modules
  app.use('/api/auth', authRoutes);
  app.use('/api/hiring', hiringRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/training', trainingRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/master-data', masterDataRoutes);
  app.use('/api/analytics', analyticsRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
