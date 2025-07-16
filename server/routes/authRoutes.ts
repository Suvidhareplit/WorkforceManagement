import { Router } from "express";
import { authController } from "../controllers/authController";
import { validateRequest } from "../middlewares/validation";
import { insertUserSchema } from "../schema";

const router = Router();

// Login
router.post('/login', authController.login);

// Register (for initial setup)
router.post('/register', validateRequest(insertUserSchema), authController.register);

// Get current user
router.get('/me', authController.getCurrentUser);

export { router as authRoutes };