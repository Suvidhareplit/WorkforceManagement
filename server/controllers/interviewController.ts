import { Request, Response } from "express";
import { storage } from "../storage";
import { sendEmail } from "../services/emailService";

const createCandidate = async (req: Request, res: Response) => {
  try {
    const candidateData = req.body;
    
    // Map resumeSource to sourcingChannel for backward compatibility
    const mappedData = {
      ...candidateData,
      sourcingChannel: candidateData.resumeSource,
      status: 'applied'
    };
    
    const candidate = await storage.createCandidate(mappedData);
    
    // Return the complete candidate data including application ID
    res.status(201).json({
      ...candidate,
      message: `Application submitted successfully. Your Application ID is: ${candidate.application_id}`
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCandidates = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const candidates = await storage.getCandidates(filters);
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCandidateById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const candidate = await storage.getCandidate(id);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCandidate = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    
    const candidate = await storage.updateCandidate(id, updateData);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePrescreening = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { approved, notes, prescreeningScore, status } = req.body;
    
    const updateData: any = {
      prescreeningApproved: approved,
      prescreeningNotes: notes,
    };
    
    if (prescreeningScore !== undefined) {
      updateData.prescreeningScore = prescreeningScore;
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    const candidate = await storage.updateCandidate(id, updateData);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Update prescreening error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateScreening = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { score, benchmarkMet } = req.body;
    
    const updateData: any = {
      screeningScore: score.toString(),
      benchmarkMet,
      status: benchmarkMet ? 'technical' : 'rejected'
    };
    
    const candidate = await storage.updateCandidate(id, updateData);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Update screening error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTechnical = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status, notes } = req.body;
    
    if (!['selected', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updateData: any = {
      technicalStatus: status,
      technicalNotes: notes,
      status: status === 'selected' ? 'selected' : 'rejected'
    };
    
    const candidate = await storage.updateCandidate(id, updateData);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Update technical round error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateOffer = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { dateOfJoining, grossSalary } = req.body;
    
    const candidate = await storage.updateCandidate(id, {
      dateOfJoining: new Date(dateOfJoining),
      grossSalary: grossSalary.toString(),
      status: 'offered'
    });
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    // Send offer email based on source
    try {
      if (candidate.resumeSource === 'vendor' && candidate.vendorId) {
        const vendor = await storage.getVendors().then(vendors => vendors.find(v => v.id === candidate.vendorId));
        if (vendor) {
          await sendEmail({
            to: vendor.email,
            subject: 'Candidate Selection Notification',
            text: `Candidate ${candidate.name} has been selected with DOJ: ${dateOfJoining} and gross salary: ${grossSalary}`
          });
        }
      } else {
        await sendEmail({
          to: candidate.email || '',
          subject: 'Job Offer',
          text: `Congratulations! You have been selected. Your DOJ is ${dateOfJoining} with gross salary: ${grossSalary}`
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json(candidate);
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const interviewController = {
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  updatePrescreening,
  updateScreening,
  updateTechnical,
  updateOffer
};
