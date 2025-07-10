import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { auditService } from "../services/auditService";

// Get all users
const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(parseInt(id));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create single user
const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
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

    // Log user creation
    await auditService.logActivity({
      userId: user.id,
      action: 'CREATE',
      entity: 'user',
      entityId: user.id.toString(),
      details: `New user created: ${user.username}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      managerId: user.managerId,
      cityId: user.cityId,
      clusterId: user.clusterId,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bulk create users
const bulkCreateUsers = async (req: Request, res: Response) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData) {
      return res.status(400).json({ message: "CSV data is required" });
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    // Validate headers
    const requiredHeaders = ['username', 'email', 'firstName', 'lastName', 'phone', 'password', 'role'];
    const optionalHeaders = ['managerId', 'cityId', 'clusterId'];
    
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        return res.status(400).json({ 
          message: `Missing required header: ${header}` 
        });
      }
    }

    const createdUsers = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((v: string) => v.trim());
        const userData: any = {};

        headers.forEach((header, index) => {
          if (values[index] && values[index] !== '') {
            if (header === 'managerId' || header === 'cityId' || header === 'clusterId') {
              userData[header] = parseInt(values[index]);
            } else {
              userData[header] = values[index];
            }
          }
        });

        // Validate required fields
        for (const field of requiredHeaders) {
          if (!userData[field]) {
            throw new Error(`Missing required field: ${field}`);
          }
        }

        // Check if user already exists
        const existingUser = await storage.getUserByUsername(userData.username);
        if (existingUser) {
          throw new Error(`Username already exists: ${userData.username}`);
        }

        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          throw new Error(`Email already exists: ${userData.email}`);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = await storage.createUser({
          ...userData,
          password: hashedPassword
        });

        createdUsers.push(user);

        // Log user creation
        await auditService.logActivity({
          userId: user.id,
          action: 'BULK_CREATE',
          entity: 'user',
          entityId: user.id.toString(),
          details: `User created via bulk upload: ${user.username}`,
          ipAddress: req.ip
        });
      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      created: createdUsers.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Bulk create users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update user
const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    
    const user = await storage.getUser(parseInt(id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const updatedUser = await storage.updateUser(parseInt(id), userData);

    // Log user update
    await auditService.logActivity({
      userId: parseInt(id),
      action: 'UPDATE',
      entity: 'user',
      entityId: id,
      details: `User updated: ${user.username}`,
      ipAddress: req.ip
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete user (soft delete - set isActive to false)
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await storage.getUser(parseInt(id));
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await storage.updateUser(parseInt(id), { isActive: false });

    // Log user deletion
    await auditService.logActivity({
      userId: parseInt(id),
      action: 'DELETE',
      entity: 'user',
      entityId: id,
      details: `User deactivated: ${user.username}`,
      ipAddress: req.ip
    });

    res.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userController = {
  getUsers,
  getUserById,
  createUser,
  bulkCreateUsers,
  updateUser,
  deleteUser,
};