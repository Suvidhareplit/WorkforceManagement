import { Router } from "express";
import { userController } from "../controllers/userController";
import { authenticate, authorize } from "../middlewares/auth";

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users - admin only
router.get('/', authorize(['admin']), userController.getUsers);

// Get user by ID - admin only
router.get('/:id', authorize(['admin']), userController.getUserById);

// Create single user - admin only
router.post('/', authorize(['admin']), userController.createUser);

// Bulk create users - admin only
router.post('/bulk', authorize(['admin']), userController.bulkCreateUsers);

// Update user - admin only
router.put('/:id', authorize(['admin']), userController.updateUser);

// Delete user (soft delete) - admin only
router.delete('/:id', authorize(['admin']), userController.deleteUser);

export { router as userRoutes };