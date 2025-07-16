import { storage } from '../storage';
import type { User, InsertUser } from '../types/models';

export class UserModel {
  static async findAll(): Promise<User[]> {
    return await storage.getUsers();
  }

  static async findById(id: number): Promise<User | undefined> {
    return await storage.getUser(id);
  }

  static async findByUserId(userId: number): Promise<User | undefined> {
    return await storage.getUserByUserId(userId);
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    return await storage.getUserByEmail(email);
  }

  static async create(userData: InsertUser): Promise<User> {
    return await storage.createUser(userData);
  }

  static async update(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    return await storage.updateUser(id, userData);
  }

  static async delete(id: number): Promise<void> {
    await storage.deleteUser(id);
  }

  static async createAuditTrail(auditData: any): Promise<void> {
    await storage.createUserAudit(auditData);
  }

  static async getAuditTrail(userId: number) {
    return await db.select().from(userAuditTrail).where(eq(userAuditTrail.userId, userId));
  }
}