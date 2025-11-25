import { Request } from 'express';
import { query } from '../config/db';

export interface AuditLogData {
  employeeId: string;
  actionType: 'EXIT_INITIATED' | 'EXIT_REVOKED' | 'EXIT_UPDATED' | 'LWD_CHANGED' | 'STATUS_CHANGED';
  actionDescription: string;
  previousData?: {
    exitType?: string | null;
    exitReason?: string | null;
    lwd?: string | null;
    exitInitiatedDate?: string | null;
    workingStatus?: string | null;
  };
  newData?: {
    exitType?: string | null;
    exitReason?: string | null;
    lwd?: string | null;
    exitInitiatedDate?: string | null;
    workingStatus?: string | null;
  };
  exitDataSnapshot?: any;
  performedBy?: string;
  performedByName?: string;
  performedByRole?: string;
  req?: Request;
}

export class ExitAuditLogger {
  /**
   * Log an exit-related action to the audit trail
   */
  static async logAction(data: AuditLogData): Promise<void> {
    try {
      const {
        employeeId,
        actionType,
        actionDescription,
        previousData = {},
        newData = {},
        exitDataSnapshot,
        performedBy = 'system',
        performedByName = 'System',
        performedByRole = 'system',
        req
      } = data;

      // Extract request metadata if available
      const ipAddress = req ? this.getClientIP(req) : null;
      const userAgent = req ? req.get('User-Agent') : null;

      const insertQuery = `
        INSERT INTO exit_audit_trail (
          employee_id,
          action_type,
          action_description,
          previous_exit_type,
          previous_exit_reason,
          previous_lwd,
          previous_exit_initiated_date,
          previous_working_status,
          new_exit_type,
          new_exit_reason,
          new_lwd,
          new_exit_initiated_date,
          new_working_status,
          exit_data_snapshot,
          performed_by,
          performed_by_name,
          performed_by_role,
          ip_address,
          user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        employeeId,
        actionType,
        actionDescription,
        previousData.exitType || null,
        previousData.exitReason || null,
        previousData.lwd || null,
        previousData.exitInitiatedDate || null,
        previousData.workingStatus || null,
        newData.exitType || null,
        newData.exitReason || null,
        newData.lwd || null,
        newData.exitInitiatedDate || null,
        newData.workingStatus || null,
        exitDataSnapshot ? JSON.stringify(exitDataSnapshot) : null,
        performedBy,
        performedByName,
        performedByRole,
        ipAddress,
        userAgent
      ];

      await query(insertQuery, params);

      console.log(`✅ Audit logged: ${actionType} for employee ${employeeId}`);
    } catch (error) {
      console.error('❌ Failed to log audit trail:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log exit initiation
   */
  static async logExitInitiation(
    employeeId: string,
    exitData: any,
    req?: Request,
    performedBy?: string,
    performedByName?: string
  ): Promise<void> {
    const actionDescription = `Exit initiated for employee ${employeeId}. Type: ${exitData.exitType}, Reason: ${exitData.exitReason || 'N/A'}, LWD: ${exitData.lastWorkingDay}`;

    await this.logAction({
      employeeId,
      actionType: 'EXIT_INITIATED',
      actionDescription,
      previousData: {
        exitType: null,
        exitReason: null,
        lwd: null,
        exitInitiatedDate: null,
        workingStatus: 'working'
      },
      newData: {
        exitType: exitData.exitType,
        exitReason: exitData.exitReason,
        lwd: exitData.lastWorkingDay,
        exitInitiatedDate: new Date().toISOString().split('T')[0],
        workingStatus: 'working'
      },
      exitDataSnapshot: exitData,
      performedBy: performedBy || 'system',
      performedByName: performedByName || 'System User',
      performedByRole: 'admin',
      req
    });
  }

  /**
   * Log exit revocation
   */
  static async logExitRevocation(
    employeeId: string,
    previousExitData: any,
    req?: Request,
    performedBy?: string,
    performedByName?: string
  ): Promise<void> {
    const actionDescription = `Exit revoked for employee ${employeeId}. Previous type: ${previousExitData.exit_type || 'N/A'}, Previous LWD: ${previousExitData.lwd || 'N/A'}`;

    await this.logAction({
      employeeId,
      actionType: 'EXIT_REVOKED',
      actionDescription,
      previousData: {
        exitType: previousExitData.exit_type,
        exitReason: previousExitData.exit_reason,
        lwd: previousExitData.lwd,
        exitInitiatedDate: previousExitData.exit_initiated_date,
        workingStatus: previousExitData.working_status
      },
      newData: {
        exitType: null,
        exitReason: null,
        lwd: null,
        exitInitiatedDate: null,
        workingStatus: 'working'
      },
      exitDataSnapshot: previousExitData,
      performedBy: performedBy || 'system',
      performedByName: performedByName || 'System User',
      performedByRole: 'admin',
      req
    });
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Get audit trail for an employee
   */
  static async getEmployeeAuditTrail(employeeId: string, limit: number = 50): Promise<any[]> {
    try {
      const selectQuery = `
        SELECT 
          id,
          action_type,
          action_description,
          previous_exit_type,
          previous_lwd,
          new_exit_type,
          new_lwd,
          performed_by,
          performed_by_name,
          performed_by_role,
          ip_address,
          created_at
        FROM exit_audit_trail 
        WHERE employee_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;

      const result = await query(selectQuery, [employeeId, limit]);
      return result.rows || [];
    } catch (error) {
      console.error('❌ Failed to fetch audit trail:', error);
      return [];
    }
  }

  /**
   * Get recent audit activities
   */
  static async getRecentAuditActivities(limit: number = 100): Promise<any[]> {
    try {
      const selectQuery = `
        SELECT 
          eat.id,
          eat.employee_id,
          eat.action_type,
          eat.action_description,
          eat.performed_by_name,
          eat.created_at,
          e.name as employee_name,
          e.role as employee_role,
          e.department_name
        FROM exit_audit_trail eat
        LEFT JOIN employees e ON eat.employee_id = e.employee_id
        ORDER BY eat.created_at DESC 
        LIMIT ?
      `;

      const result = await query(selectQuery, [limit]);
      return result.rows || [];
    } catch (error) {
      console.error('❌ Failed to fetch recent audit activities:', error);
      return [];
    }
  }
}
