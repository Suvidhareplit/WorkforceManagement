import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all users - admin and hr can view
router.get("/", authorize(["admin", "hr"]), userController.getUsers);

// Get user by ID - admin and hr can view
router.get("/:id", authorize(["admin", "hr"]), userController.getUserById);

// Create user - only admin can create
router.post("/", authorize(["admin"]), userController.createUser);

// Update user - only admin can update
router.put("/:id", authorize(["admin"]), userController.updateUser);

// Bulk create users - only admin can bulk create
router.post("/bulk", authorize(["admin"]), userController.bulkCreateUsers);

// Get user audit trail - admin and hr can view
router.get("/:id/audit", authorize(["admin", "hr"]), userController.getUserAuditTrail);

export { router as userRoutes };