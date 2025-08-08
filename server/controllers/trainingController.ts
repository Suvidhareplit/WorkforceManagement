import { Request, Response } from "express";
import { getStorage } from '../storage';
const storage = getStorage();
import { sendEmail } from "../services/emailService";

const createTrainingSession = async (req: Request, res: Response) => {
  try {
    const sessionData = req.body;
    
    const session = await storage.createTrainingSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    console.error('Create training session error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTrainingSessions = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const sessions = await storage.getTrainingSessions(filters);
    res.json(sessions);
  } catch (error) {
    console.error('Get training sessions error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTrainingSession = async (req: Request, res: Response) => {
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
};

const markAttendance = async (req: Request, res: Response) => {
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
};

const updateFitness = async (req: Request, res: Response) => {
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
            html: `<p>Candidate has completed classroom training and is ready for field training.</p>`
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
};

const confirmFTE = async (req: Request, res: Response) => {
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
};

export const trainingController = {
  createTrainingSession,
  getTrainingSessions,
  updateTrainingSession,
  markAttendance,
  updateFitness,
  confirmFTE
};
