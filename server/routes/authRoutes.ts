import { Router } from "express";
import { authController } from "../controllers/authController";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Login
router.post('/login', authController.login.bind(authController));

// Register (for initial setup)
router.post('/register', authController.register.bind(authController));

// Get current user
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

export { router as authRoutes };