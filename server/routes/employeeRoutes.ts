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

// Get exit summary for chart (must be before /:id to avoid conflict)
router.get('/exit-summary', employeeController.getExitSummary);

// Get exit process list
router.get('/exit-process-list', employeeController.getExitProcessList);

// Org Dashboard routes
router.get('/org-hierarchy', employeeController.getOrgHierarchy);
router.get('/filter-options', employeeController.getFilterOptions);

// Review exit (initiated -> in_progress)
router.post('/exit/:exitId/review', employeeController.reviewExit);

// Complete exit (in_progress -> completed)
router.post('/exit/:exitId/complete', employeeController.completeExit);

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
