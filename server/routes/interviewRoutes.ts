import { Router } from "express";
import { interviewController } from "../controllers/interviewController.js";
import { validateBulkUpload, processBulkUpload } from "../controllers/bulkUploadController.js";
import { authenticate } from "../middlewares/auth.js";
import multer from "multer";

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

// Bulk upload routes
router.post('/bulk-upload/validate', upload.single('file'), validateBulkUpload);
router.post('/bulk-upload/process', processBulkUpload);

// Update prescreening status
router.patch('/candidates/:id/prescreening', interviewController.updatePrescreening);

// Update screening scores
router.patch('/candidates/:id/screening', interviewController.updateScreening);

// Update technical round
router.patch('/candidates/:id/technical', interviewController.updateTechnical);

// Update offer status
router.patch('/candidates/:id/offer', interviewController.updateOffer);

export { router as interviewRoutes };