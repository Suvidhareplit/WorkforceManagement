import { Router } from "express";
import { authController } from "../controllers/authController";

const router = Router();

// Login
router.post('/login', authController.login);

// Register (for initial setup)
router.post('/register', authController.register);

// Get current user
router.get('/me', authController.getCurrentUser);

export { router as authRoutes };