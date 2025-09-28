import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';


interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    userId: number;
    email: string;
    role: string;
  };
}

export class HiringController extends BaseController {
  
  constructor() {
    super();
  }

  // Helper method to generate unique request ID
  private generateRequestId(cityCode: string, roleCode: string, clusterCode: string, sequence: number): string {
    return `${cityCode}_${roleCode}_${clusterCode}_${sequence.toString().padStart(4, '0')}`;
  }

  // Create hiring request
  async createHiringRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const requestData = req.body;
      const userId = this.getUserId(req);
      
      // Validate required fields
      if (!requestData.cityId || !requestData.clusterId || !requestData.roleId || !requestData.numberOfPositions) {
        this.sendError(res, 'Missing required fields: cityId, clusterId, roleId, numberOfPositions', 400);
        return;
      }

      // Get reference data for validation and ID generation
      const [city, cluster, role] = await Promise.all([
        this.storage.getCity(requestData.cityId),
        this.storage.getCluster(requestData.clusterId),
        this.storage.getRole(requestData.roleId)
      ]);

      if (!city || !cluster || !role) {
        this.sendError(res, 'Invalid city, cluster, or role ID', 400);
        return;
      }

      // Get next sequence number for this role
      const nextSequence = await this.storage.getNextHiringRequestSequence(requestData.roleId);
      
      // Create individual requests for each position
      const requests = [];
      for (let i = 0; i < requestData.numberOfPositions; i++) {
        const requestId = this.generateRequestId(city.code, role.code, cluster.code, nextSequence + i);
        
        const request = await this.storage.createHiringRequest({
          ...requestData,
          requestId,
          numberOfPositions: 1, // Individual request per position
          status: 'open',
          createdBy: userId
        }, { changedBy: userId });
        
        requests.push(request);
      }

      this.sendSuccess(res, requests, `Created ${requests.length} hiring request(s) successfully`);
    } catch (error) {
      this.handleError(res, error, 'Failed to create hiring request');
    }
  }

  // Get all hiring requests
  async getHiringRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const requests = await this.storage.getHiringRequests(filters);
      this.sendSuccess(res, requests, 'Hiring requests retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve hiring requests');
    }
  }

  // Get hiring request by ID
  async getHiringRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const request = await this.storage.getHiringRequest(id);
      
      if (!request) {
        this.sendNotFound(res, 'Hiring request');
        return;
      }
      
      // Get associated candidates if requested
      const includeCandidates = req.query.includeCandidates === 'true';
      let responseData: any = request;
      
      if (includeCandidates) {
        const candidates = await this.storage.getCandidates({ hiringRequestId: id });
        responseData = { ...request, candidates };
      }
      
      this.sendSuccess(res, responseData, 'Hiring request retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve hiring request');
    }
  }

  // Update hiring request
  async updateHiringRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const request = await this.storage.updateHiringRequest(id, req.body, { changedBy: userId });
      
      if (!request) {
        this.sendNotFound(res, 'Hiring request');
        return;
      }
      
      this.sendSuccess(res, request, 'Hiring request updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update hiring request');
    }
  }

  // Update hiring request status
  async updateHiringRequestStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = this.getUserId(req);
      
      if (!status) {
        this.sendError(res, 'Status is required', 400);
        return;
      }
      
      const request = await this.storage.updateHiringRequestStatus(id, status, { changedBy: userId });
      
      if (!request) {
        this.sendNotFound(res, 'Hiring request');
        return;
      }
      
      this.sendSuccess(res, request, 'Hiring request status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update hiring request status');
    }
  }

  // Delete hiring request
  async deleteHiringRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const success = await this.storage.deleteHiringRequest(id, { changedBy: userId });
      
      if (!success) {
        this.sendNotFound(res, 'Hiring request');
        return;
      }
      
      this.sendSuccess(res, null, 'Hiring request deleted successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to delete hiring request');
    }
  }

  // Candidate management methods
  
  // Get candidates for a hiring request
  async getCandidatesForRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hiringRequestId = parseInt(req.params.requestId);
      const filters = this.buildFilterOptions(req);
      
      const candidates = await this.storage.getCandidates({ ...filters, hiringRequestId });
      this.sendSuccess(res, candidates, 'Candidates retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve candidates');
    }
  }

  // Create candidate
  async createCandidate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const candidate = await this.storage.createCandidate(req.body, { changedBy: userId });
      this.sendSuccess(res, candidate, 'Candidate created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create candidate');
    }
  }

  // Update candidate
  async updateCandidate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const candidate = await this.storage.updateCandidate(id, req.body, { changedBy: userId });
      
      if (!candidate) {
        this.sendNotFound(res, 'Candidate');
        return;
      }
      
      this.sendSuccess(res, candidate, 'Candidate updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update candidate');
    }
  }

  // Update candidate status
  async updateCandidateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = this.getUserId(req);
      
      if (!status) {
        this.sendError(res, 'Status is required', 400);
        return;
      }
      
      const candidate = await this.storage.updateCandidateStatus(id, status, { changedBy: userId });
      
      if (!candidate) {
        this.sendNotFound(res, 'Candidate');
        return;
      }
      
      this.sendSuccess(res, candidate, 'Candidate status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update candidate status');
    }
  }
}

// Export instance for use in routes
export const hiringController = new HiringController();

// Export individual methods for backward compatibility
export const createRequest = hiringController.createHiringRequest.bind(hiringController);
export const getRequests = hiringController.getHiringRequests.bind(hiringController);
export const getRequestById = hiringController.getHiringRequest.bind(hiringController);
export const updateRequestStatus = hiringController.updateHiringRequestStatus.bind(hiringController);
export const updateRequest = hiringController.updateHiringRequest.bind(hiringController);
export const deleteRequest = hiringController.deleteHiringRequest.bind(hiringController);
export const getCandidatesForRequest = hiringController.getCandidatesForRequest.bind(hiringController);
export const createCandidate = hiringController.createCandidate.bind(hiringController);
export const updateCandidate = hiringController.updateCandidate.bind(hiringController);
export const updateCandidateStatus = hiringController.updateCandidateStatus.bind(hiringController);
