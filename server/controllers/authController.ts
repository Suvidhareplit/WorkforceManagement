import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { auditService } from "../services/auditService";

// Login
const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await storage.getUserByUserId(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.userId, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: '24h' }
    );

    // Log successful login
    await auditService.logActivity({
      userId: user.id,
      action: 'LOGIN',
      entity: 'user',
      entityId: user.id.toString(),
      details: `User ${user.userId} logged in successfully`,
      ipAddress: req.ip
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.userId,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Register (for initial setup)
const register = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByUserId(userData.userId);
    if (existingUser) {
      return res.status(400).json({ message: "User ID already exists" });
    }

    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });

    // Log user registration
    await auditService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entity: 'user',
      entityId: user.id.toString(),
      details: `New user registered: ${user.userId}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      id: user.id,
      username: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      username: user.userId,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authController = {
  login,
  register,
  getCurrentUser
};
