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

// POST /api/analytics/send-email - Send hiring request email to vendor SPOC
router.post('/send-email', analyticsController.sendHiringRequestEmail);

export default router;