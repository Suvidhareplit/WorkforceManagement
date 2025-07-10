import { Router } from "express";
import { trainingController } from "../controllers/trainingController";
import { validateRequest } from "../middlewares/validation";
import { insertTrainingSessionSchema } from "@shared/schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create training session
router.post('/', validateRequest(insertTrainingSessionSchema), trainingController.createTrainingSession);

// Get training sessions
router.get('/', trainingController.getTrainingSessions);

// Update training session
router.patch('/:id', trainingController.updateTrainingSession);

// Mark attendance
router.post('/:id/attendance', trainingController.markAttendance);

// Mark candidate fit/not fit
router.patch('/:id/fitness', trainingController.updateFitness);

// Confirm FTE
router.patch('/:id/fte', trainingController.confirmFTE);

export { router as trainingRoutes };