import { Router } from "express";
import { authRoutes } from "./authRoutes";
import { hiringRoutes } from "./hiringRoutes";
import { interviewRoutes } from "./interviewRoutes";
import { trainingRoutes } from "./trainingRoutes";
import { employeeRoutes } from "./employeeRoutes";
import { masterDataRoutes } from "./masterDataRoutes";
import analyticsRoutes from './analyticsRoutes';
import leaveManagementRoutes from './leaveManagementRoutes';

const router = Router();

// Register all route modules
router.use('/auth', authRoutes);
router.use('/hiring', hiringRoutes);
router.use('/interviews', interviewRoutes);
router.use('/training', trainingRoutes);
router.use('/employees', employeeRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/leave', leaveManagementRoutes);

export { router as apiRoutes };