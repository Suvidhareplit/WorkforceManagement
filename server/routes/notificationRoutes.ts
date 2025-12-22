import express from 'express';
import { query } from '../config/db';

const router = express.Router();

// Get notifications (optionally filter by unread)
router.get('/', async (req, res) => {
  try {
    const { unread } = req.query;
    
    let sql = `
      SELECT 
        id,
        user_id as userId,
        recipient_type as recipientType,
        recipient_name as recipientName,
        title,
        message,
        type,
        related_case_id as relatedCaseId,
        is_read as isRead,
        created_at as createdAt
      FROM notifications
    `;
    
    if (unread === 'true') {
      sql += ' WHERE is_read = 0';
    }
    
    sql += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await query(sql);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    await query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = 1 WHERE is_read = 0');
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
});

export default router;
