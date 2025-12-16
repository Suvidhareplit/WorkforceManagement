import { Router } from "express";
import { hiringController } from "../controllers/hiringController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create hiring request
router.post('/', hiringController.createHiringRequest.bind(hiringController));

// Get all hiring requests
router.get('/', hiringController.getHiringRequests.bind(hiringController));

// Get hiring request by ID
router.get('/:id', hiringController.getHiringRequest.bind(hiringController));

// Update hiring request (edit designation, priority, etc.)
router.patch('/:id', hiringController.updateHiringRequest.bind(hiringController));

// Update hiring request status
router.patch('/:id/status', hiringController.updateHiringRequestStatus.bind(hiringController));

export { router as hiringRoutes };