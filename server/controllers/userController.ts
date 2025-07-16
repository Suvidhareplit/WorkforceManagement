import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { UserModel } from "../models";
import { insertUserSchema } from "../schema";
import { ZodError } from "zod";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

// Get all users
const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await storage.getUsers();
    
    // Remove password from response
    const safeUsers = users.map(({ password, ...user }) => user);
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(parseInt(id));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create user
const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    // Check if user ID already exists
    const existingUser = await storage.getUserByUserId(userData.userId);
    if (existingUser) {
      return res.status(400).json({ message: "User ID already exists" });
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    }, req.user?.userId);
    
    // Remove password from response
    const { password, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error('Create user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user
const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // If userId is being updated, check for conflicts
    if (updateData.userId) {
      const existingUser = await storage.getUserByUserId(updateData.userId);
      if (existingUser && existingUser.id !== parseInt(id)) {
        return res.status(400).json({ message: "User ID already exists" });
      }
    }
    
    // If email is being updated, check for conflicts
    if (updateData.email) {
      const existingEmail = await storage.getUserByEmail(updateData.email);
      if (existingEmail && existingEmail.id !== parseInt(id)) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }
    
    const user = await storage.updateUser(parseInt(id), updateData, req.user?.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bulk create users
const bulkCreateUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" });
    }
    
    const results = [];
    const errors = [];
    
    for (let i = 0; i < users.length; i++) {
      try {
        const userData = insertUserSchema.parse(users[i]);
        
        // Check for duplicates
        const existingUser = await storage.getUserByUserId(userData.userId);
        if (existingUser) {
          errors.push({ index: i, error: `User ID ${userData.userId} already exists` });
          continue;
        }
        
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          errors.push({ index: i, error: `Email ${userData.email} already exists` });
          continue;
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = await storage.createUser({
          ...userData,
          password: hashedPassword
        }, req.user?.userId);
        
        const { password, ...safeUser } = user;
        results.push(safeUser);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push({ index: i, error: error.errors });
        } else {
          errors.push({ index: i, error: "Failed to create user" });
        }
      }
    }
    
    res.status(201).json({
      created: results.length,
      users: results,
      errors: errors
    });
  } catch (error) {
    console.error('Bulk create users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user audit trail
const getUserAuditTrail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const auditTrail = await storage.getUserAuditTrail(parseInt(id));
    res.json(auditTrail);
  } catch (error) {
    console.error('Get user audit trail error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userController = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  bulkCreateUsers,
  getUserAuditTrail
};