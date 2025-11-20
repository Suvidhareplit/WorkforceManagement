import { Router } from 'express';
import { employeeController } from '../controllers/employeeController';

const router = Router();

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

export default router;
