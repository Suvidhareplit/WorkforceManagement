import type { Express } from "express";
import { createServer, type Server } from "http";
import { authRoutes } from "./controllers/authController";
import { hiringRoutes } from "./controllers/hiringController";
import { interviewRoutes } from "./controllers/interviewController";
import { trainingRoutes } from "./controllers/trainingController";
import { employeeRoutes } from "./controllers/employeeController";
import { masterDataRoutes } from "./controllers/masterDataController";
import { analyticsRoutes } from "./controllers/analyticsController";

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
