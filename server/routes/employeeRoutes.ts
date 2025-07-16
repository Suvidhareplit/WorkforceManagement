import { Router } from "express";
import { employeeController } from "../controllers/employeeController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create employee
router.post('/', employeeController.createEmployee);

// Get all employees
router.get('/', employeeController.getEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee
router.patch('/:id', employeeController.updateEmployee);

// Create employee action (PIP, warning, termination)
router.post('/:id/actions', employeeController.createEmployeeAction);

// Get employee actions
router.get('/:id/actions', employeeController.getEmployeeActions);

// Update employee action
router.patch('/actions/:actionId', employeeController.updateEmployeeAction);

export { router as employeeRoutes };