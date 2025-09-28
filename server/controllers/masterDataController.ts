import { Request, Response } from 'express';
import { BaseController } from './base/BaseController';

export class MasterDataController extends BaseController {

  // Cities CRUD
  async getCities(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const cities = await this.storage.getCities(filters);
      this.sendSuccess(res, cities, 'Cities retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve cities');
    }
  }

  async getClustersByCity(req: Request, res: Response): Promise<void> {
    try {
      const cityId = parseInt(req.params.cityId);
      const filters = this.buildFilterOptions(req);
      const clusters = await this.storage.getClustersByCity(cityId, filters);
      this.sendSuccess(res, clusters, 'Clusters retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve clusters');
    }
  }

  async getClusters(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const clusters = await this.storage.getClusters(filters);
      this.sendSuccess(res, clusters, 'All clusters retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve clusters');
    }
  }

  async getRoles(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const roles = await this.storage.getRoles(filters);
      this.sendSuccess(res, roles, 'Roles retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve roles');
    }
  }

  async getVendors(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const vendors = await this.storage.getVendors(filters);
      this.sendSuccess(res, vendors, 'Vendors retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve vendors');
    }
  }

  async getRecruiters(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const recruiters = await this.storage.getRecruiters(filters);
      this.sendSuccess(res, recruiters, 'Recruiters retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve recruiters');
    }
  }

  // Create operations
  async createCity(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const city = await this.storage.createCity(req.body, { changedBy: userId });
      this.sendSuccess(res, city, 'City created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create city');
    }
  }

  async createCluster(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const cluster = await this.storage.createCluster(req.body, { changedBy: userId });
      this.sendSuccess(res, cluster, 'Cluster created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create cluster');
    }
  }

  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const roleData = {
        ...req.body,
        jobDescriptionFile: (req as any).file ? (req as any).file.filename : null
      };
      
      console.log('Creating role with data:', roleData);
      
      const role = await this.storage.createRole(roleData, { changedBy: userId });
      this.sendSuccess(res, role, 'Role created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create role');
    }
  }

  async createVendor(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const vendor = await this.storage.createVendor(req.body, { changedBy: userId });
      this.sendSuccess(res, vendor, 'Vendor created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create vendor');
    }
  }

  async createRecruiter(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const recruiter = await this.storage.createRecruiter(req.body, { changedBy: userId });
      this.sendSuccess(res, recruiter, 'Recruiter created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create recruiter');
    }
  }

  // Status toggle operations
  async toggleCityStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const userId = this.getUserId(req);
      
      const city = await this.storage.updateCityStatus(id, isActive, { changedBy: userId });
      if (!city) {
        this.sendNotFound(res, 'City');
        return;
      }
      
      this.sendSuccess(res, city, 'City status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update city status');
    }
  }

  async toggleClusterStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const userId = this.getUserId(req);
      
      const cluster = await this.storage.updateClusterStatus(id, isActive, { changedBy: userId });
      if (!cluster) {
        this.sendNotFound(res, 'Cluster');
        return;
      }
      
      this.sendSuccess(res, cluster, 'Cluster status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update cluster status');
    }
  }

  async toggleRoleStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const userId = this.getUserId(req);
      
      const role = await this.storage.updateRoleStatus(id, isActive, { changedBy: userId });
      if (!role) {
        this.sendNotFound(res, 'Role');
        return;
      }
      
      this.sendSuccess(res, role, 'Role status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update role status');
    }
  }

  async toggleVendorStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const userId = this.getUserId(req);
      
      const vendor = await this.storage.updateVendorStatus(id, isActive, { changedBy: userId });
      if (!vendor) {
        this.sendNotFound(res, 'Vendor');
        return;
      }
      
      this.sendSuccess(res, vendor, 'Vendor status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update vendor status');
    }
  }

  async toggleRecruiterStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      const userId = this.getUserId(req);
      
      const recruiter = await this.storage.updateRecruiterStatus(id, isActive, { changedBy: userId });
      if (!recruiter) {
        this.sendNotFound(res, 'Recruiter');
        return;
      }
      
      this.sendSuccess(res, recruiter, 'Recruiter status updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update recruiter status');
    }
  }

  // Update operations
  async updateCity(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const city = await this.storage.updateCity(id, req.body, { changedBy: userId });
      if (!city) {
        this.sendNotFound(res, 'City');
        return;
      }
      
      this.sendSuccess(res, city, 'City updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update city');
    }
  }

  async updateCluster(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const cluster = await this.storage.updateCluster(id, req.body, { changedBy: userId });
      if (!cluster) {
        this.sendNotFound(res, 'Cluster');
        return;
      }
      
      this.sendSuccess(res, cluster, 'Cluster updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update cluster');
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const roleData = {
        ...req.body,
        jobDescriptionFile: (req as any).file ? (req as any).file.filename : undefined
      };
      
      const role = await this.storage.updateRole(id, roleData, { changedBy: userId });
      if (!role) {
        this.sendNotFound(res, 'Role');
        return;
      }
      
      this.sendSuccess(res, role, 'Role updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update role');
    }
  }

  async updateVendor(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const vendor = await this.storage.updateVendor(id, req.body, { changedBy: userId });
      if (!vendor) {
        this.sendNotFound(res, 'Vendor');
        return;
      }
      
      this.sendSuccess(res, vendor, 'Vendor updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update vendor');
    }
  }

  async updateRecruiter(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      
      const recruiter = await this.storage.updateRecruiter(id, req.body, { changedBy: userId });
      if (!recruiter) {
        this.sendNotFound(res, 'Recruiter');
        return;
      }
      
      this.sendSuccess(res, recruiter, 'Recruiter updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update recruiter');
    }
  }
}

// Export instance for use in routes
export const masterDataController = new MasterDataController();

// Export individual methods for backward compatibility
export const getCities = masterDataController.getCities.bind(masterDataController);
export const getClustersByCity = masterDataController.getClustersByCity.bind(masterDataController);
export const getClusters = masterDataController.getClusters.bind(masterDataController);
export const getRoles = masterDataController.getRoles.bind(masterDataController);
export const getVendors = masterDataController.getVendors.bind(masterDataController);
export const getRecruiters = masterDataController.getRecruiters.bind(masterDataController);
export const createCity = masterDataController.createCity.bind(masterDataController);
export const createCluster = masterDataController.createCluster.bind(masterDataController);
export const createRole = masterDataController.createRole.bind(masterDataController);
export const createVendor = masterDataController.createVendor.bind(masterDataController);
export const createRecruiter = masterDataController.createRecruiter.bind(masterDataController);
export const toggleCityStatus = masterDataController.toggleCityStatus.bind(masterDataController);
export const toggleClusterStatus = masterDataController.toggleClusterStatus.bind(masterDataController);
export const toggleRoleStatus = masterDataController.toggleRoleStatus.bind(masterDataController);
export const toggleVendorStatus = masterDataController.toggleVendorStatus.bind(masterDataController);
export const toggleRecruiterStatus = masterDataController.toggleRecruiterStatus.bind(masterDataController);
export const updateCity = masterDataController.updateCity.bind(masterDataController);
export const updateCluster = masterDataController.updateCluster.bind(masterDataController);
export const updateRole = masterDataController.updateRole.bind(masterDataController);
export const updateVendor = masterDataController.updateVendor.bind(masterDataController);
export const updateRecruiter = masterDataController.updateRecruiter.bind(masterDataController);
