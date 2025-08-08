import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number;
    email: string;
    role: string;
  };
}

export class AuthController extends BaseController {

  // Helper method to generate JWT token
  private generateToken(user: any): string {
    return jwt.sign(
      { 
        id: user.id,
        userId: user.userId || user.id,
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }

  // Helper method to sanitize user for response
  private sanitizeUserForAuth(user: any): any {
    return {
      id: user.id,
      userId: user.userId || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      cityId: user.cityId,
      clusterId: user.clusterId
    };
  }

  // Login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        this.sendError(res, 'Email and password are required', 400);
        return;
      }

      // Get user by email
      const user: any = await this.storage.getUserByEmail(email);
      if (!user) {
        this.sendError(res, 'Invalid credentials', 401);
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        this.sendError(res, 'Account is deactivated', 401);
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        this.sendError(res, 'Invalid credentials', 401);
        return;
      }

      // Generate token
      const token = this.generateToken(user);

      // Create audit trail
      await this.storage.createUserAudit({
        userId: user.id,
        changedBy: user.id,
        changeType: 'LOGIN',
        tableName: 'users',
        recordId: user.id,
        newValues: JSON.stringify({ loginTime: new Date().toISOString() })
      });

      this.sendSuccess(res, {
        token,
        user: this.sanitizeUserForAuth(user)
      }, 'Login successful');
    } catch (error) {
      this.handleError(res, error, 'Login failed');
    }
  }

  // Register (for initial setup or admin creation)
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role = 'user', ...userData } = req.body;
      
      if (!email || !password || !name) {
        this.sendError(res, 'Email, password, and name are required', 400);
        return;
      }

      // Check if user already exists
      const existingUser = await this.storage.getUserByEmail(email);
      if (existingUser) {
        this.sendError(res, 'User already exists with this email', 400);
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await this.storage.createUser({
        email,
        passwordHash,
        name,
        role,
        isActive: true,
        ...userData
      });

      // Generate token
      const token = this.generateToken(user);

      this.sendSuccess(res, {
        token,
        user: this.sanitizeUserForAuth(user)
      }, 'Registration successful');
    } catch (error) {
      this.handleError(res, error, 'Registration failed');
    }
  }

  // Get current user profile
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        this.sendError(res, 'Unauthorized', 401);
        return;
      }

      const user = await this.storage.getUser(userId);
      if (!user) {
        this.sendError(res, 'User not found', 404);
        return;
      }

      this.sendSuccess(res, this.sanitizeUserForAuth(user), 'User profile retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve user profile');
    }
  }

  // Change password
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        this.sendError(res, 'Unauthorized', 401);
        return;
      }

      if (!currentPassword || !newPassword) {
        this.sendError(res, 'Current password and new password are required', 400);
        return;
      }

      // Get current user
      const user = await this.storage.getUser(userId);
      if (!user) {
        this.sendError(res, 'User not found', 404);
        return;
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        this.sendError(res, 'Current password is incorrect', 400);
        return;
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.storage.updateUser(userId, { passwordHash }, { changedBy: userId });

      this.sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to change password');
    }
  }

  // Logout (mainly for audit trail)
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (userId) {
        // Create audit trail for logout
        await this.storage.createUserAudit({
          userId,
          changedBy: userId,
          changeType: 'LOGOUT',
          tableName: 'users',
          recordId: userId,
          newValues: JSON.stringify({ logoutTime: new Date().toISOString() })
        });
      }

      this.sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      this.handleError(res, error, 'Logout failed');
    }
  }
}

// Export instance for use in routes
export const authController = new AuthController();

// Export individual methods for backward compatibility
export const login = authController.login.bind(authController);
export const register = authController.register.bind(authController);
export const getCurrentUser = authController.getCurrentUser.bind(authController);
export const changePassword = authController.changePassword.bind(authController);
export const logout = authController.logout.bind(authController);
