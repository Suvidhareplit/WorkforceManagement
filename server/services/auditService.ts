// Simple audit service for logging user activities
export const auditService = {
  async logActivity(data: {
    userId: number;
    action: string;
    entity: string;
    entityId: string;
    details: string;
    ipAddress?: string;
  }) {
    // For now, just log to console
    // In production, this would write to an audit table
    console.log(`[AUDIT] User ${data.userId} performed ${data.action} on ${data.entity} ${data.entityId}: ${data.details}`);
  }
};