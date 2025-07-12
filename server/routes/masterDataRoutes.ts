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

// Delete master data
router.delete('/cities/:id', masterDataController.deleteCity);
router.delete('/clusters/:id', masterDataController.deleteCluster);
router.delete('/roles/:id', masterDataController.deleteRole);
router.delete('/vendors/:id', masterDataController.deleteVendor);
router.delete('/recruiters/:id', masterDataController.deleteRecruiter);

export { router as masterDataRoutes };