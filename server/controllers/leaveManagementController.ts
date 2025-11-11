import { Request, Response } from 'express';
import { query } from '../config/db';

export class LeaveManagementController {
  private getUserId(req: Request): number {
    return (req as any).user?.userId || (req as any).user?.id || 1;
  }

  private getUserInfo(req: Request) {
    const user = (req as any).user;
    return {
      user_id: user?.userId || user?.id || 1,
      user_name: user?.name || user?.username || 'System',
      user_role: user?.role || 'Unknown',
      ip_address: req.ip || req.socket.remoteAddress,
      user_agent: req.get('user-agent')
    };
  }

  private async createAuditTrail(
    entityType: string,
    entityId: number,
    entityName: string,
    actionType: string,
    oldValue: any,
    newValue: any,
    changeReason: string,
    userInfo: any
  ) {
    try {
      const summary = this.generateSummary(oldValue, newValue, actionType);
      
      await query(`
        INSERT INTO leave_audit_trail (
          entity_type, entity_id, entity_name, action_type,
          old_value, new_value, summary, change_reason,
          changed_by, changed_by_name, changed_by_role,
          ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        entityType, entityId, entityName, actionType,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        summary, changeReason,
        userInfo.user_id, userInfo.user_name, userInfo.user_role,
        userInfo.ip_address, userInfo.user_agent
      ]);
    } catch (error) {
      console.error('Error creating audit trail:', error);
    }
  }

  private generateSummary(oldValue: any, newValue: any, actionType: string): string {
    if (actionType === 'CREATE') return 'Created new record';
    if (actionType === 'DELETE') return 'Deleted record';
    if (actionType === 'ACTIVATE') return 'Activated record';
    if (actionType === 'DEACTIVATE') return 'Deactivated record';
    
    if (!oldValue || !newValue) return 'Modified record';
    
    const changes: string[] = [];
    for (const key in newValue) {
      if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
        changes.push(`${key}: ${JSON.stringify(oldValue[key])} → ${JSON.stringify(newValue[key])}`);
      }
    }
    
    return changes.length > 0 ? changes.join('; ') : 'Modified record';
  }

  // LEAVE CONFIGS
  async getLeaveConfigs(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM leave_config ORDER BY leave_type');
      res.json({ configs: result.rows });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch configs', error: error.message });
    }
  }

  async updateLeaveConfig(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      
      if (!data.change_reason || data.change_reason.length < 10) {
        return res.status(400).json({ message: 'Change reason required (min 10 chars)' });
      }
      
      const userInfo = this.getUserInfo(req);
      const oldResult = await query('SELECT * FROM leave_config WHERE id = ?', [id]);
      const oldValue = oldResult.rows[0];
      
      await query(`
        UPDATE leave_config SET
          display_name = ?, annual_quota = ?, monthly_accrual = ?,
          prorate_enabled = ?, eligibility_months = ?, is_active = ?, updated_by = ?
        WHERE id = ?
      `, [data.display_name, data.annual_quota, data.monthly_accrual,
          data.prorate_enabled, data.eligibility_months, data.is_active, userInfo.user_id, id]);
      
      await this.createAuditTrail('CONFIG', parseInt(id), data.leave_type, 'EDIT',
        oldValue, data, data.change_reason, userInfo);
      
      res.json({ message: 'Config updated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to update config', error: error.message });
    }
  }

  // POLICIES
  async getPolicies(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM leave_policy_master ORDER BY policy_name');
      res.json({ policies: result.rows });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch policies', error: error.message });
    }
  }

  async getPolicyDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const policyResult = await query('SELECT * FROM leave_policy_master WHERE id = ?', [id]);
      const mappingsResult = await query(`
        SELECT lpm.*, lc.display_name, lc.annual_quota, lc.monthly_accrual
        FROM leave_policy_mapping lpm
        LEFT JOIN leave_config lc ON lpm.leave_type = lc.leave_type
        WHERE lpm.policy_id = ?
      `, [id]);
      
      res.json({ policy: policyResult.rows[0], mappings: mappingsResult.rows });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch policy details', error: error.message });
    }
  }

  async createPolicy(req: Request, res: Response) {
    try {
      const data = req.body;
      
      if (!data.change_reason || data.change_reason.length < 10) {
        return res.status(400).json({ message: 'Change reason required (min 10 chars)' });
      }
      
      const userInfo = this.getUserInfo(req);
      
      const policyResult = await query(`
        INSERT INTO leave_policy_master (
          policy_name, policy_code, description, effective_from, is_default,
          city, employee_type, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [data.policy_name, data.policy_code, data.description, data.effective_from,
          data.is_default, data.city, data.employee_type, userInfo.user_id, userInfo.user_id]);
      
      const policyId = (policyResult.rows as any).insertId;
      
      if (data.leave_mappings) {
        for (const mapping of data.leave_mappings) {
          await query(`
            INSERT INTO leave_policy_mapping (
              policy_id, leave_type, allocation_override, is_enabled
            ) VALUES (?, ?, ?, ?)
          `, [policyId, mapping.leave_type, mapping.allocation_override, mapping.is_enabled]);
        }
      }
      
      await this.createAuditTrail('POLICY', policyId, data.policy_name, 'CREATE',
        null, data, data.change_reason, userInfo);
      
      res.status(201).json({ message: 'Policy created', id: policyId });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to create policy', error: error.message });
    }
  }

  async togglePolicyStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { change_reason } = req.body;
      
      if (!change_reason || change_reason.length < 10) {
        return res.status(400).json({ message: 'Change reason required (min 10 chars)' });
      }
      
      const userInfo = this.getUserInfo(req);
      const oldResult = await query('SELECT * FROM leave_policy_master WHERE id = ?', [id]);
      const oldValue = oldResult.rows[0];
      
      await query('UPDATE leave_policy_master SET is_active = NOT is_active WHERE id = ?', [id]);
      
      await this.createAuditTrail('POLICY', parseInt(id), oldValue.policy_name,
        oldValue.is_active ? 'DEACTIVATE' : 'ACTIVATE', oldValue, null, change_reason, userInfo);
      
      res.json({ message: 'Policy status toggled' });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to toggle policy', error: error.message });
    }
  }

  // HOLIDAYS
  async getHolidays(req: Request, res: Response) {
    try {
      const { year } = req.query;
      let sql = 'SELECT * FROM leave_holidays WHERE is_active = 1';
      const params: any[] = [];
      
      if (year) {
        sql += ' AND year = ?';
        params.push(year);
      }
      
      sql += ' ORDER BY holiday_date';
      const result = await query(sql, params);
      res.json({ holidays: result.rows });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch holidays', error: error.message });
    }
  }

  async createHoliday(req: Request, res: Response) {
    try {
      const data = req.body;
      
      if (!data.change_reason || data.change_reason.length < 10) {
        return res.status(400).json({ message: 'Change reason required (min 10 chars)' });
      }
      
      const userInfo = this.getUserInfo(req);
      
      const result = await query(`
        INSERT INTO leave_holidays (
          year, holiday_date, holiday_name, holiday_type, city, is_optional, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [data.year, data.holiday_date, data.holiday_name, data.holiday_type,
          data.city, data.is_optional, userInfo.user_id]);
      
      const insertId = (result.rows as any).insertId;
      
      await this.createAuditTrail('HOLIDAY', insertId, data.holiday_name, 'CREATE',
        null, data, data.change_reason, userInfo);
      
      res.status(201).json({ message: 'Holiday created', id: insertId });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to create holiday', error: error.message });
    }
  }

  async deleteHoliday(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { change_reason } = req.body;
      
      if (!change_reason || change_reason.length < 10) {
        return res.status(400).json({ message: 'Change reason required (min 10 chars)' });
      }
      
      const userInfo = this.getUserInfo(req);
      const oldResult = await query('SELECT * FROM leave_holidays WHERE id = ?', [id]);
      const oldValue = oldResult.rows[0];
      
      await query('DELETE FROM leave_holidays WHERE id = ?', [id]);
      
      await this.createAuditTrail('HOLIDAY', parseInt(id), oldValue.holiday_name, 'DELETE',
        oldValue, null, change_reason, userInfo);
      
      res.json({ message: 'Holiday deleted' });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to delete holiday', error: error.message });
    }
  }

  // AUDIT TRAIL
  async getAuditTrail(req: Request, res: Response) {
    try {
      const { entity_type, start_date, end_date, action_type, page = 1, limit = 50 } = req.query;
      
      let sql = 'SELECT * FROM leave_audit_trail WHERE 1=1';
      const params: any[] = [];
      
      if (entity_type) {
        sql += ' AND entity_type = ?';
        params.push(entity_type);
      }
      if (action_type) {
        sql += ' AND action_type = ?';
        params.push(action_type);
      }
      if (start_date) {
        sql += ' AND created_at >= ?';
        params.push(start_date);
      }
      if (end_date) {
        sql += ' AND created_at <= ?';
        params.push(end_date);
      }
      
      const countResult = await query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
      const total = countResult.rows[0].total;
      
      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const offset = (Number(page) - 1) * Number(limit);
      params.push(Number(limit), offset);
      
      const result = await query(sql, params);
      
      res.json({
        audit_trail: result.rows,
        pagination: { page: Number(page), limit: Number(limit), total, total_pages: Math.ceil(total / Number(limit)) }
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch audit trail', error: error.message });
    }
  }

  // RH ALLOCATIONS
  async getRHAllocations(req: Request, res: Response) {
    try {
      const result = await query('SELECT * FROM leave_rh_allocation ORDER BY city');
      res.json({ allocations: result.rows });
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch RH allocations', error: error.message });
    }
  }
}

export const leaveManagementController = new LeaveManagementController();
