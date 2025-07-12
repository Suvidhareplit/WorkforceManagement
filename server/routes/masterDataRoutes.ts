import { Router } from "express";
import { masterDataController } from "../controllers/masterDataController";
import { validateRequest } from "../middlewares/validation";
import { 
  insertCitySchema, insertClusterSchema, insertRoleSchema, 
  insertVendorSchema, insertRecruiterSchema 
} from "@shared/schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public endpoints for dropdowns
router.get('/cities', masterDataController.getCities);
router.get('/cities/:cityId/clusters', masterDataController.getClustersByCity);
router.get('/clusters', masterDataController.getClusters);
router.get('/roles', masterDataController.getRoles);
router.get('/vendors', masterDataController.getVendors);
router.get('/recruiters', masterDataController.getRecruiters);

// Admin routes require authentication
router.use(authenticate);

// Create master data
router.post('/cities', validateRequest(insertCitySchema), masterDataController.createCity);
router.post('/clusters', validateRequest(insertClusterSchema), masterDataController.createCluster);
router.post('/roles', validateRequest(insertRoleSchema), masterDataController.createRole);
router.post('/vendors', validateRequest(insertVendorSchema), masterDataController.createVendor);
router.post('/recruiters', validateRequest(insertRecruiterSchema), masterDataController.createRecruiter);

// Toggle status for master data (Active/Inactive)
router.patch('/cities/:id/toggle-status', masterDataController.toggleCityStatus);
router.patch('/clusters/:id/toggle-status', masterDataController.toggleClusterStatus);
router.patch('/roles/:id/toggle-status', masterDataController.toggleRoleStatus);
router.patch('/vendors/:id/toggle-status', masterDataController.toggleVendorStatus);
router.patch('/recruiters/:id/toggle-status', masterDataController.toggleRecruiterStatus);

// Edit master data
router.patch('/cities/:id', validateRequest(insertCitySchema.partial()), masterDataController.updateCity);
router.patch('/clusters/:id', validateRequest(insertClusterSchema.partial()), masterDataController.updateCluster);
router.patch('/roles/:id', validateRequest(insertRoleSchema.partial()), masterDataController.updateRole);
router.patch('/vendors/:id', validateRequest(insertVendorSchema.partial()), masterDataController.updateVendor);
router.patch('/recruiters/:id', validateRequest(insertRecruiterSchema.partial()), masterDataController.updateRecruiter);

export { router as masterDataRoutes };