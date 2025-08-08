import { Request, Response } from 'express';
import { getStorage } from '../../storage/index';
import { IStorage, FilterOptions } from '../../interfaces/IStorage';
import { ZodSchema, ZodError } from 'zod';

// Base controller with common patterns for all controllers
export abstract class BaseController {
  protected storage: IStorage;

  constructor() {
    this.storage = getStorage();
  }

  // Helper method for consistent error handling
  protected handleError(res: Response, error: any, message: string = 'Internal server error'): void {
    console.error(`${this.constructor.name} error:`, error);
    
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors
      });
      return;
    }

    res.status(500).json({ message });
  }

  // Helper method for validation
  protected validateInput<T>(schema: ZodSchema<T>, data: any): T {
    return schema.parse(data);
  }

  // Helper method for building filter options from query params
  protected buildFilterOptions(req: Request): FilterOptions {
    const { limit, offset, sortBy, sortOrder } = req.query;
    
    return {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'ASC' | 'DESC') || 'ASC'
    };
  }

  // Helper method for extracting user ID from request (assuming JWT middleware sets req.user)
  protected getUserId(req: Request): number | undefined {
    return (req as any).user?.id;
  }

  // Standard success response format
  protected sendSuccess(res: Response, data: any, message?: string): void {
    res.json({
      success: true,
      data,
      message
    });
  }

  // Standard error response format
  protected sendError(res: Response, message: string, statusCode: number = 500): void {
    res.status(statusCode).json({
      success: false,
      message
    });
  }

  // Standard not found response
  protected sendNotFound(res: Response, resource: string = 'Resource'): void {
    res.status(404).json({
      success: false,
      message: `${resource} not found`
    });
  }
}
