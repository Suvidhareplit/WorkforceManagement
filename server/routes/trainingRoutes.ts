import { Router } from "express";
import { trainingController } from "../controllers/trainingController";
import { validateRequest } from "../middlewares/validation";
import { insertTrainingSessionSchema } from "@shared/schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create training session
router.post('/', validateRequest(insertTrainingSessionSchema), trainingController.createSession);

// Get training sessions
router.get('/', trainingController.getSessions);

// Update training session
router.patch('/:id', trainingController.updateSession);

// Mark attendance
router.post('/:id/attendance', trainingController.markAttendance);

// Mark candidate fit/not fit
router.patch('/:id/fitness', trainingController.markFitness);

// Confirm FTE
router.patch('/:id/fte', trainingController.confirmFTE);

export { router as trainingRoutes };