import { Router } from 'express';
import { designationController } from '../controllers/designationController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all designations with filtering
router.get('/', designationController.getDesignations);

// Get designation by ID
router.get('/:id', designationController.getDesignationById);

// Create new designation
router.post('/', designationController.createDesignation);

// Update designation
router.put('/:id', designationController.updateDesignation);

// Delete designation
router.delete('/:id', designationController.deleteDesignation);

// Get designations by role
router.get('/role/:roleId', designationController.getDesignationsByRole);

// Get designations by sub-department
router.get('/sub-department/:subDeptId', designationController.getDesignationsBySubDepartment);

export default router;
