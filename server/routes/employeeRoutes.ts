import { Router } from "express";
import { employeeController } from "../controllers/employeeController";
import { validateRequest } from "../middlewares/validation";
import { insertEmployeeSchema, insertEmployeeActionSchema } from "../schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create employee
router.post('/', validateRequest(insertEmployeeSchema), employeeController.createEmployee);

// Get all employees
router.get('/', employeeController.getEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee
router.patch('/:id', employeeController.updateEmployee);

// Create employee action (PIP, warning, termination)
router.post('/:id/actions', validateRequest(insertEmployeeActionSchema), employeeController.createEmployeeAction);

// Get employee actions
router.get('/:id/actions', employeeController.getEmployeeActions);

// Update employee action
router.patch('/actions/:actionId', employeeController.updateEmployeeAction);

export { router as employeeRoutes };