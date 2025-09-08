import { Router } from "express";
import multer from "multer";
import path from "path";
import { masterDataController } from "../controllers/masterDataController";
import { authenticate } from "../middlewares/auth";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/job-descriptions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

const router = Router();

// Public endpoints for dropdowns - Simplified Centralized API
router.get('/city', masterDataController.getCities.bind(masterDataController));
router.get('/city/:cityId/clusters', masterDataController.getClustersByCity.bind(masterDataController));
router.get('/cluster', masterDataController.getClusters.bind(masterDataController));
router.get('/role', masterDataController.getRoles.bind(masterDataController));
router.get('/vendor', masterDataController.getVendors.bind(masterDataController));
router.get('/recruiter', masterDataController.getRecruiters.bind(masterDataController));

// File serving route
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'job-descriptions', filename);
  res.sendFile(filePath);
});

// Admin routes require authentication
router.use(authenticate);

// Create master data
router.post('/city', masterDataController.createCity.bind(masterDataController));
router.post('/cluster', masterDataController.createCluster.bind(masterDataController));
router.post('/role', upload.single('jobDescriptionFile'), masterDataController.createRole.bind(masterDataController));
router.post('/vendor', masterDataController.createVendor.bind(masterDataController));
router.post('/recruiter', masterDataController.createRecruiter.bind(masterDataController));

// Toggle status for master data (Active/Inactive)
router.patch('/city/:id/toggle-status', masterDataController.toggleCityStatus.bind(masterDataController));
router.patch('/cluster/:id/toggle-status', masterDataController.toggleClusterStatus.bind(masterDataController));
router.patch('/role/:id/toggle-status', masterDataController.toggleRoleStatus.bind(masterDataController));
router.patch('/vendor/:id/toggle-status', masterDataController.toggleVendorStatus.bind(masterDataController));
router.patch('/recruiter/:id/toggle-status', masterDataController.toggleRecruiterStatus.bind(masterDataController));

// Edit master data
router.patch('/city/:id', masterDataController.updateCity.bind(masterDataController));
router.patch('/cluster/:id', masterDataController.updateCluster.bind(masterDataController));
router.patch('/role/:id', upload.single('jobDescriptionFile'), masterDataController.updateRole.bind(masterDataController));
router.patch('/vendor/:id', masterDataController.updateVendor.bind(masterDataController));
router.patch('/recruiter/:id', masterDataController.updateRecruiter.bind(masterDataController));

export { router as masterDataRoutes };