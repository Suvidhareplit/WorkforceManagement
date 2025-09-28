import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all users - admin and hr can view
router.get("/", authorize(["admin", "hr"]), userController.getUsers.bind(userController));

// Get user by ID - admin and hr can view
router.get("/:id", authorize(["admin", "hr"]), userController.getUserById.bind(userController));

// Create user - only admin can create
router.post("/", authorize(["admin"]), userController.createUser.bind(userController));

// Update user - only admin can update
router.put("/:id", authorize(["admin"]), userController.updateUser.bind(userController));

// Bulk create users - only admin can bulk create
router.post("/bulk", authorize(["admin"]), userController.bulkCreateUsers.bind(userController));

// Get user audit trail - admin and hr can view
router.get("/:id/audit", authorize(["admin", "hr"]), userController.getUserAuditTrail.bind(userController));

export { router as userRoutes };