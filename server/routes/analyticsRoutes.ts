import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/analytics/hiring - Get hiring analytics data
router.get('/hiring', analyticsController.getHiringAnalytics);

// GET /api/analytics/pipeline - Get candidate pipeline data
router.get('/pipeline', analyticsController.getCandidatePipeline);

// Email functionality moved to hiring controller

export default router;