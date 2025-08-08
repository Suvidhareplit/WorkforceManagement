import { Router } from "express";
import { hiringController } from "../controllers/hiringController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create hiring request
router.post('/', hiringController.createHiringRequest);

// Get all hiring requests
router.get('/', hiringController.getHiringRequests);

// Get hiring request by ID
router.get('/:id', hiringController.getHiringRequest);

// Update hiring request status
router.patch('/:id/status', hiringController.updateHiringRequestStatus);

export { router as hiringRoutes };