import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';

export class AnalyticsController extends BaseController {
  
  async getHiringAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const analytics = await this.storage.getHiringAnalytics(filters);
      this.sendSuccess(res, analytics, 'Hiring analytics retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve hiring analytics');
    }
  }

  async getCandidatePipeline(req: Request, res: Response): Promise<void> {
    try {
      const pipeline = await this.storage.getCandidatePipeline();
      this.sendSuccess(res, pipeline, 'Candidate pipeline retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve candidate pipeline');
    }
  }

  async getVendorPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await this.storage.getVendorPerformance();
      this.sendSuccess(res, performance, 'Vendor performance retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve vendor performance');
    }
  }

  async getRecruiterPerformance(req: Request, res: Response): Promise<void> {
    try {
      const performance = await this.storage.getRecruiterPerformance();
      this.sendSuccess(res, performance, 'Recruiter performance retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve recruiter performance');
    }
  }
}

// Export instance for use in routes
export const analyticsController = new AnalyticsController();

// Export individual methods for backward compatibility
export const getHiringAnalytics = analyticsController.getHiringAnalytics.bind(analyticsController);
export const getCandidatePipeline = analyticsController.getCandidatePipeline.bind(analyticsController);
export const getVendorPerformance = analyticsController.getVendorPerformance.bind(analyticsController);
export const getRecruiterPerformance = analyticsController.getRecruiterPerformance.bind(analyticsController);