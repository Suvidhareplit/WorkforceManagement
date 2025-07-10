import { Router } from "express";
import { storage } from "../storage";
import { insertEmployeeSchema, insertEmployeeActionSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create employee
router.post('/', validateRequest(insertEmployeeSchema), async (req, res) => {
  try {
    const employeeData = req.body;
    
    const employee = await storage.createEmployee(employeeData);
    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all employees
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const employees = await storage.getEmployees(filters);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const employee = await storage.getEmployee(id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update employee
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const employee = await storage.updateEmployee(id, updateData);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create employee action (PIP, warning, termination)
router.post('/:id/actions', validateRequest(insertEmployeeActionSchema), async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const actionData = req.body;
    const userId = (req as any).user.userId;
    
    const action = await storage.createEmployeeAction({
      ...actionData,
      employeeId,
      requestedBy: userId
    });
    
    res.status(201).json(action);
  } catch (error) {
    console.error('Create employee action error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get employee actions
router.get('/:id/actions', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const actions = await storage.getEmployeeActions(employeeId);
    res.json(actions);
  } catch (error) {
    console.error('Get employee actions error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Approve/reject employee action
router.patch('/actions/:actionId', async (req, res) => {
  try {
    const actionId = parseInt(req.params.actionId);
    const { status } = req.body;
    const userId = (req as any).user.userId;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const action = await storage.updateEmployeeAction(actionId, {
      status,
      approvedBy: userId
    });
    
    if (!action) {
      return res.status(404).json({ message: "Employee action not found" });
    }
    
    res.json(action);
  } catch (error) {
    console.error('Update employee action error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as employeeRoutes };
