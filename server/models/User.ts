import { db } from '../config/database';
import { users, userAuditTrail, type User, type InsertUser, type InsertUserAuditTrail } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class UserModel {
  static async findAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  static async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  static async findByUserId(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.userId, userId));
    return user || undefined;
  }

  static async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  static async create(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async update(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  static async delete(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  static async createAuditTrail(auditData: InsertUserAuditTrail): Promise<void> {
    await db.insert(userAuditTrail).values(auditData);
  }

  static async getAuditTrail(userId: number) {
    return await db.select().from(userAuditTrail).where(eq(userAuditTrail.userId, userId));
  }
}