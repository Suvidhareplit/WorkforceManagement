import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import * as bcrypt from 'bcrypt';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number;
    email: string;
    role: string;
  };
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  cityId?: number;
  clusterId?: number;
  vendorId?: number;
  recruiterId?: number;
  isActive?: boolean;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  cityId?: number;
  clusterId?: number;
  vendorId?: number;
  recruiterId?: number;
  isActive?: boolean;
  password?: string;
}

interface UpdateUserStatusRequest {
  isActive: boolean;
  changedBy?: number;
}

export class UserController extends BaseController {

  // Helper method to remove password from user object
  private sanitizeUser(user: any): Omit<any, 'passwordHash'> {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // Helper method to sanitize multiple users
  private sanitizeUsers(users: any[]): Omit<any, 'passwordHash'>[] {
    return users.map(user => this.sanitizeUser(user));
  }

  // Get all users
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const users = await this.storage.getUsers(filters);
      const safeUsers = this.sanitizeUsers(users);
      this.sendSuccess(res, safeUsers, 'Users retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve users');
    }
  }

  // Get user by ID
  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const user = await this.storage.getUser(id);
      
      if (!user) {
        this.sendNotFound(res, 'User');
        return;
      }
      
      const safeUser = this.sanitizeUser(user);
      this.sendSuccess(res, safeUser, 'User retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve user');
    }
  }

  // Create user
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { password, ...userData } = req.body;
      
      if (!password) {
        this.sendError(res, 'Password is required', 400);
        return;
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Create user with hashed password
      const userToCreate = {
        ...userData,
        passwordHash
      };
      
      const userId = this.getUserId(req);
      const user = await this.storage.createUser(userToCreate, { changedBy: userId });
      
      const safeUser = this.sanitizeUser(user);
      this.sendSuccess(res, safeUser, 'User created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create user');
    }
  }

  // Update user
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      let updateData = { ...req.body };
      
      // If password is being updated, hash it
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }
      
      const userId = this.getUserId(req);
      const user = await this.storage.updateUser(id, updateData, { changedBy: userId });
      
      if (!user) {
        this.sendNotFound(res, 'User');
        return;
      }
      
      const safeUser = this.sanitizeUser(user);
      this.sendSuccess(res, safeUser, 'User updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update user');
    }
  }

  // Update user status
  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      const userId = this.getUserId(req);
      const user = await this.storage.updateUserStatus(id, isActive, { changedBy: userId });
      
      if (!user) {
        this.sendNotFound(res, 'User');
        return;
      }
      
      const safeUser = this.sanitizeUser(user);
      this.sendSuccess(res, safeUser, 'User status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update user status');
    }
  }

  // Bulk create users
  async bulkCreateUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { users } = req.body;
      
      if (!Array.isArray(users)) {
        this.sendError(res, 'Users must be an array', 400);
        return;
      }
      
      const results = [];
      const errors = [];
      const userId = this.getUserId(req);
      
      for (let i = 0; i < users.length; i++) {
        try {
          const { password, ...userData } = users[i];
          
          if (!password) {
            throw new Error('Password is required');
          }
          
          // Hash password
          const passwordHash = await bcrypt.hash(password, 10);
          
          // Create user with hashed password
          const userToCreate = {
            ...userData,
            passwordHash
          };
          
          const user = await this.storage.createUser(userToCreate, { changedBy: userId });
          const safeUser = this.sanitizeUser(user);
          results.push(safeUser);
        } catch (error) {
          errors.push({
            index: i,
            user: users[i],
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      this.sendSuccess(res, {
        created: results,
        errors: errors,
        summary: `Created ${results.length} users successfully, ${errors.length} errors`
      }, 'Bulk user creation completed');
    } catch (error) {
      this.handleError(res, error, 'Failed to bulk create users');
    }
  }

  // Get user audit trail
  async getUserAuditTrail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const filters = this.buildFilterOptions(req);
      const auditTrail = await this.storage.getUserAuditTrail(id, filters);
      this.sendSuccess(res, auditTrail, 'User audit trail retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve user audit trail');
    }
  }

  // Delete user
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const success = await this.storage.deleteUser(id, { changedBy: userId });
      
      if (!success) {
        this.sendNotFound(res, 'User');
        return;
      }
      
      this.sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to delete user');
    }
  }
}

// Export instance for use in routes
export const userController = new UserController();

// Export individual methods for backward compatibility
export const getUsers = userController.getUsers.bind(userController);
export const getUserById = userController.getUserById.bind(userController);
export const createUser = userController.createUser.bind(userController);
export const updateUser = userController.updateUser.bind(userController);
export const updateUserStatus = userController.updateUserStatus.bind(userController);
export const bulkCreateUsers = userController.bulkCreateUsers.bind(userController);
export const getUserAuditTrail = userController.getUserAuditTrail.bind(userController);
export const deleteUser = userController.deleteUser.bind(userController);