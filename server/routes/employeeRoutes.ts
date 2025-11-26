import { Router } from 'express';
import { employeeController } from '../controllers/employeeController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create employee profile from onboarding
router.post('/profile', employeeController.createEmployeeProfile);

// Get all employees
router.get('/', employeeController.getEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee
router.patch('/:id', employeeController.updateEmployee);

// Initiate employee exit
router.post('/:employeeId/initiate-exit', employeeController.initiateExit);

// Revoke employee exit
router.delete('/:employeeId/revoke-exit', employeeController.revokeExit);

// Get exit audit trail for employee
router.get('/:employeeId/exit-audit-trail', employeeController.getExitAuditTrail);

export default router;
