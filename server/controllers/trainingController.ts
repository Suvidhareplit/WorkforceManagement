import { Router } from "express";
import { storage } from "../storage";
import { insertTrainingSessionSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";
import { sendEmail } from "../services/emailService";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create training session
router.post('/', validateRequest(insertTrainingSessionSchema), async (req, res) => {
  try {
    const sessionData = req.body;
    
    const session = await storage.createTrainingSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error('Create training session error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get training sessions
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const sessions = await storage.getTrainingSessions(filters);
    res.json(sessions);
  } catch (error) {
    console.error('Get training sessions error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update training session
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const session = await storage.updateTrainingSession(id, updateData);
    
    if (!session) {
      return res.status(404).json({ message: "Training session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Update training session error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark attendance
router.post('/:id/attendance', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const { date, present, notes } = req.body;
    const userId = (req as any).user.userId;
    
    // In a real implementation, you'd have a separate attendance table
    // For now, just update the session with attendance marked
    const session = await storage.updateTrainingSession(sessionId, {
      attendanceMarked: true
    });
    
    if (!session) {
      return res.status(404).json({ message: "Training session not found" });
    }
    
    res.json({ message: "Attendance marked successfully" });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Mark candidate fit/not fit
router.patch('/:id/fitness', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { fitStatus, comments } = req.body;
    
    if (!['fit', 'not_fit'].includes(fitStatus)) {
      return res.status(400).json({ message: "Invalid fit status" });
    }
    
    const session = await storage.updateTrainingSession(id, {
      fitStatus,
      comments,
      status: fitStatus === 'fit' ? 'completed' : 'dropped_out'
    });
    
    if (!session) {
      return res.status(404).json({ message: "Training session not found" });
    }
    
    // If marked fit and it's classroom training, notify manager for field training
    if (fitStatus === 'fit' && session.trainingType === 'classroom' && session.managerId) {
      try {
        const manager = await storage.getUser(session.managerId);
        if (manager) {
          await sendEmail({
            to: manager.email || '',
            subject: 'Candidate Ready for Field Training',
            text: `Candidate has completed classroom training and is ready for field training.`
          });
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }
    
    res.json(session);
  } catch (error) {
    console.error('Update fitness error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Confirm FTE
router.patch('/:id/fte', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { confirmed } = req.body;
    
    const session = await storage.updateTrainingSession(id, {
      fteConfirmed: confirmed,
      status: confirmed ? 'completed' : 'dropped_out'
    });
    
    if (!session) {
      return res.status(404).json({ message: "Training session not found" });
    }
    
    // Update candidate status to joined if FTE confirmed
    if (confirmed && session.candidateId) {
      await storage.updateCandidate(session.candidateId, {
        status: 'joined'
      });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Update FTE error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as trainingRoutes };
