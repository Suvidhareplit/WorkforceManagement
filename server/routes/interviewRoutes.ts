import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { interviewController } from '../controllers/interviewController';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Candidate application (public endpoint)
router.post('/candidates', interviewController.createCandidate);

// All other routes require authentication
router.use(authenticate);

// Get all candidates
router.get('/candidates', interviewController.getCandidates);

// Get candidate by ID
router.get('/candidates/:id', interviewController.getCandidateById);

// Update candidate (general update)
router.patch('/candidates/:id', interviewController.updateCandidate);

// Update prescreening status
router.patch('/candidates/:id/prescreening', interviewController.updatePrescreening);

// Update screening scores
router.patch('/candidates/:id/screening', interviewController.updateScreening);

// Update technical round
router.patch('/candidates/:id/technical', interviewController.updateTechnical);

// Update offer status
router.patch('/candidates/:id/offer', interviewController.updateOffer);

export { router as interviewRoutes };