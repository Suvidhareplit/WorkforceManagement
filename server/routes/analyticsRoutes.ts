import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get hiring analytics
router.get('/hiring', analyticsController.getHiringAnalytics);

// Get candidate pipeline analytics
router.get('/pipeline', analyticsController.getPipelineAnalytics);

// Get vendor performance
router.get('/vendors', analyticsController.getVendorPerformance);

// Get recruiter performance
router.get('/recruiters', analyticsController.getRecruiterPerformance);

export { router as analyticsRoutes };