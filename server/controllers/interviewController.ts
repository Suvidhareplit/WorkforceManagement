import { Request, Response } from "express";
import { getStorage } from '../storage';
const storage = getStorage();
import { sendEmail } from "../services/emailService";

const createCandidate = async (req: Request, res: Response) => {
  try {
    const candidateData = req.body;
    console.log('Received candidate data:', JSON.stringify(candidateData, null, 2));
    
    // Map frontend camelCase fields to backend expected format
    const mappedData = {
      ...candidateData,
      aadharNumber: candidateData.aadharNumber || candidateData.aadhar_number,
      resumeSource: candidateData.resumeSource || candidateData.resume_source,
      referralName: candidateData.referralName || candidateData.referral_name,
      currentCompany: candidateData.currentCompany || candidateData.current_company,
      experienceYears: candidateData.experienceYears || candidateData.experience_years,
      currentCtc: candidateData.currentCtc || candidateData.current_ctc,
      expectedCtc: candidateData.expectedCtc || candidateData.expected_ctc
    };
    
    console.log('Mapped candidate data:', JSON.stringify(mappedData, null, 2));
    
    // VALIDATION: Check if there's an open position for this city-cluster-role combination
    // Get city, cluster, and role IDs from the candidate data
    const cities = await storage.getCities();
    const clusters = await storage.getClusters();
    const roles = await storage.getRoles();
    
    const city = cities.find((c: any) => c.name.toLowerCase() === mappedData.city?.toLowerCase());
    const cluster = clusters.find((cl: any) => cl.name.toLowerCase() === mappedData.cluster?.toLowerCase());
    const role = roles.find((r: any) => r.name.toLowerCase() === mappedData.role?.toLowerCase());
    
    if (!city || !cluster || !role) {
      return res.status(400).json({ 
        message: "Invalid city, cluster, or role. Please check your selection." 
      });
    }
    
    // Check for open hiring request
    const openRequests = await storage.getHiringRequests({ 
      status: 'open',
      cityId: city.id,
      clusterId: cluster.id,
      roleId: role.id
    });
    
    if (!openRequests || openRequests.length === 0) {
      return res.status(400).json({ 
        message: `No open position found for ${role.name} in ${city.name} - ${cluster.name}. Please contact HR to create a hiring request first.` 
      });
    }
    
    const candidate = await storage.createCandidate(mappedData);
    
    // Return the complete candidate data
    res.status(201).json({
      data: candidate,
      message: candidate.message || `Application submitted successfully. Your Application ID is: ${candidate?.applicationId || 'N/A'}`
    });
  } catch (error: any) {
    console.error('Create candidate error:', error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

const getCandidates = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const candidates = await storage.getCandidates(filters);
    res.json({ data: candidates });
  } catch (error: any) {
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
    const { score, notes } = req.body;
    
    // Prescreening pass criteria: score >= 7
    const passingScore = 7;
    const result = score >= passingScore ? 'pass' : 'fail';
    
    const updateData: any = {
      prescreeningScore: score,
      prescreeningResult: result,
      prescreeningNotes: notes,
      prescreeningDate: new Date(),
      status: result === 'pass' ? 'prescreening' : 'rejected'
    };
    
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
    // Frontend sends snake_case, so we need to handle both
    const { score, benchmark_met, benchmarkMet, notes } = req.body;
    const actualBenchmarkMet = benchmark_met !== undefined ? benchmark_met : benchmarkMet;
    
    const updateData: any = {
      screeningScore: score,
      benchmarkMet: actualBenchmarkMet,
      prescreeningNotes: notes,
      status: actualBenchmarkMet ? 'technical' : 'rejected'
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
    const { status, notes, score } = req.body;
    
    console.log('🔍 updateTechnical called with:', {
      id,
      body: req.body
    });
    
    if (!['selected', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'selected' or 'rejected'" });
    }
    
    const updateData: any = {
      technicalScore: score,
      technicalResult: status,
      technicalNotes: notes,
      technicalDate: new Date(),
      status: status === 'selected' ? 'selected' : 'rejected'
    };
    
    console.log('📝 Calling updateCandidate with:', updateData);
    const candidate = await storage.updateCandidate(id, updateData);
    console.log('✅ Updated candidate:', candidate);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    res.json({ data: candidate });
  } catch (error) {
    console.error('Update technical round error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateOffer = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { dateOfJoining, grossSalary, date_of_joining, gross_salary } = req.body;
    
    console.log('🔍 updateOffer called with:', {
      id,
      body: req.body,
      dateOfJoining,
      grossSalary,
      date_of_joining,
      gross_salary
    });
    
    // Build update object with only provided fields
    // Handle both camelCase and snake_case (from axios conversion)
    const updateData: any = {};
    
    const doj = dateOfJoining || date_of_joining;
    const salary = grossSalary || gross_salary;
    
    if (doj) {
      updateData.dateOfJoining = new Date(doj);
      console.log('✅ Setting DOJ:', updateData.dateOfJoining);
    }
    
    if (salary) {
      updateData.grossSalary = salary.toString();
      console.log('✅ Setting Gross:', updateData.grossSalary);
    }
    
    // Only change status to 'offered' if both DOJ and Gross are provided
    if (doj && salary) {
      updateData.status = 'offered';
      console.log('✅ Setting status to offered');
    }
    
    console.log('📝 Calling updateCandidate with:', updateData);
    const candidate = await storage.updateCandidate(id, updateData);
    console.log('✅ Updated candidate:', candidate);
    
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    
    // Send offer email only when both DOJ and Gross are set (status changes to 'offered')
    if (doj && salary) {
      try {
        if (candidate.resumeSource === 'vendor' && candidate.vendorId) {
          const vendor = await storage.getVendors().then(vendors => vendors.find(v => v.id === candidate.vendorId));
          if (vendor) {
            await sendEmail({
              to: vendor.email,
              subject: 'Candidate Selection Notification',
              html: `<p>Candidate ${candidate.name} has been selected with DOJ: ${doj} and gross salary: ${salary}</p>`
            });
          }
        } else {
          await sendEmail({
            to: candidate.email || '',
            subject: 'Job Offer',
            html: `<p>Congratulations! You have been selected. Your DOJ is ${doj} with gross salary: ${salary}</p>`
          });
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({ data: candidate });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
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
