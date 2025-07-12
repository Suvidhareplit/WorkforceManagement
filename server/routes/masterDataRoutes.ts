import { Router } from "express";
import { masterDataController } from "../controllers/masterDataController";
import { validateRequest } from "../middlewares/validation";
import { 
  insertCitySchema, insertClusterSchema, insertRoleSchema, 
  insertVendorSchema, insertRecruiterSchema 
} from "@shared/schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public endpoints for dropdowns - Simplified Centralized API
router.get('/city', masterDataController.getCities);
router.get('/city/:cityId/clusters', masterDataController.getClustersByCity);
router.get('/cluster', masterDataController.getClusters);
router.get('/role', masterDataController.getRoles);
router.get('/vendor', masterDataController.getVendors);
router.get('/recruiter', masterDataController.getRecruiters);

// Admin routes require authentication
router.use(authenticate);

// Create master data
router.post('/city', validateRequest(insertCitySchema), masterDataController.createCity);
router.post('/cluster', validateRequest(insertClusterSchema), masterDataController.createCluster);
router.post('/role', validateRequest(insertRoleSchema), masterDataController.createRole);
router.post('/vendor', validateRequest(insertVendorSchema), masterDataController.createVendor);
router.post('/recruiter', validateRequest(insertRecruiterSchema), masterDataController.createRecruiter);

// Toggle status for master data (Active/Inactive)
router.patch('/city/:id/toggle-status', masterDataController.toggleCityStatus);
router.patch('/cluster/:id/toggle-status', masterDataController.toggleClusterStatus);
router.patch('/role/:id/toggle-status', masterDataController.toggleRoleStatus);
router.patch('/vendor/:id/toggle-status', masterDataController.toggleVendorStatus);
router.patch('/recruiter/:id/toggle-status', masterDataController.toggleRecruiterStatus);

// Edit master data
router.patch('/city/:id', validateRequest(insertCitySchema.partial()), masterDataController.updateCity);
router.patch('/cluster/:id', validateRequest(insertClusterSchema.partial()), masterDataController.updateCluster);
router.patch('/role/:id', validateRequest(insertRoleSchema.partial()), masterDataController.updateRole);
router.patch('/vendor/:id', validateRequest(insertVendorSchema.partial()), masterDataController.updateVendor);
router.patch('/recruiter/:id', validateRequest(insertRecruiterSchema.partial()), masterDataController.updateRecruiter);

export { router as masterDataRoutes };