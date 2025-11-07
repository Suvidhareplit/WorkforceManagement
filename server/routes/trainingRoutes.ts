import { Router } from "express";
import { trainingController } from "../controllers/trainingController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== INDUCTION ROUTES ====================
// Create induction record
router.post('/induction', trainingController.createInduction);

// Get all induction records
router.get('/induction', trainingController.getInductions);

// Update induction record
router.patch('/induction/:id', trainingController.updateInduction);

// ==================== CLASSROOM TRAINING ROUTES ====================
// Get all classroom training records
router.get('/classroom', trainingController.getClassroomTrainings);

// Update classroom training record
router.patch('/classroom/:id', trainingController.updateClassroomTraining);

// ==================== FIELD TRAINING ROUTES ====================
// Get all field training records
router.get('/field', trainingController.getFieldTrainings);

// Update field training record
router.patch('/field/:id', trainingController.updateFieldTraining);

export { router as trainingRoutes };