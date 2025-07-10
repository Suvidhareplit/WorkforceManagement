import { Router } from "express";
import { interviewController } from "../controllers/interviewController";
import { validateRequest } from "../middlewares/validation";
import { insertCandidateSchema } from "@shared/schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Candidate application (public endpoint)
router.post('/candidates', validateRequest(insertCandidateSchema), interviewController.createCandidate);

// All other routes require authentication
router.use(authenticate);

// Get all candidates
router.get('/candidates', interviewController.getCandidates);

// Get candidate by ID
router.get('/candidates/:id', interviewController.getCandidateById);

// Update prescreening status
router.patch('/candidates/:id/prescreening', interviewController.updatePrescreening);

// Update screening scores
router.patch('/candidates/:id/screening', interviewController.updateScreening);

// Update technical round
router.patch('/candidates/:id/technical', interviewController.updateTechnical);

// Update offer status
router.patch('/candidates/:id/offer', interviewController.updateOffer);

export { router as interviewRoutes };