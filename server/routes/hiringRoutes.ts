import { Router } from "express";
import { hiringController } from "../controllers/hiringController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create hiring request
router.post('/', hiringController.createRequest);

// Get all hiring requests
router.get('/', hiringController.getRequests);

// Get hiring request by ID
router.get('/:id', hiringController.getRequestById);

// Update hiring request status
router.patch('/:id/status', hiringController.updateRequestStatus);

export { router as hiringRoutes };