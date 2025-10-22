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

  // Paygroups
  async getPaygroups(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const paygroups = await this.storage.getPaygroups(filters);
      this.sendSuccess(res, paygroups, 'Paygroups retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve paygroups');
    }
  }

  async createPaygroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const paygroup = await this.storage.createPaygroup(req.body, { changedBy: userId });
      this.sendSuccess(res, paygroup, 'Paygroup created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create paygroup');
    }
  }

  async updatePaygroup(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      const paygroup = await this.storage.updatePaygroup(id, req.body, { changedBy: userId });
      if (!paygroup) {
        this.sendNotFound(res, 'Paygroup');
        return;
      }
      this.sendSuccess(res, paygroup, 'Paygroup updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update paygroup');
    }
  }

  // Business Units
  async getBusinessUnits(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const businessUnits = await this.storage.getBusinessUnits(filters);
      this.sendSuccess(res, businessUnits, 'Business units retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve business units');
    }
  }

  async createBusinessUnit(req: Request, res: Response): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const businessUnit = await this.storage.createBusinessUnit(req.body, { changedBy: userId });
      this.sendSuccess(res, businessUnit, 'Business unit created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create business unit');
    }
  }

  async updateBusinessUnit(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      const businessUnit = await this.storage.updateBusinessUnit(id, req.body, { changedBy: userId });
      if (!businessUnit) {
        this.sendNotFound(res, 'Business unit');
        return;
      }
      this.sendSuccess(res, businessUnit, 'Business unit updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update business unit');
    }
  }

  // Departments
  async getDepartments(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const departments = await this.storage.getDepartments(filters);
      this.sendSuccess(res, departments, 'Departments retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve departments');
    }
  }

  async createDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, businessUnitId } = req.body;
      
      console.log('createDepartment received:', { name, code, businessUnitId });
      
      // Backend validation
      if (!name || !code) {
        this.sendError(res, 'Name and Code are required', 400);
        return;
      }
      
      const parsedBusinessUnitId = parseInt(businessUnitId);
      if (businessUnitId === undefined || businessUnitId === null || isNaN(parsedBusinessUnitId)) {
        console.log('Business Unit validation failed:', { businessUnitId, parsedBusinessUnitId });
        this.sendError(res, 'Valid Business Unit selection is required', 400);
        return;
      }
      
      const userId = this.getUserId(req);
      const department = await this.storage.createDepartment(req.body, { changedBy: userId });
      this.sendSuccess(res, department, 'Department created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create department');
    }
  }

  async updateDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      const department = await this.storage.updateDepartment(id, req.body, { changedBy: userId });
      if (!department) {
        this.sendNotFound(res, 'Department');
        return;
      }
      this.sendSuccess(res, department, 'Department updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update department');
    }
  }

  // Sub Departments
  async getSubDepartments(req: Request, res: Response): Promise<void> {
    try {
      const filters = this.buildFilterOptions(req);
      const subDepartments = await this.storage.getSubDepartments(filters);
      this.sendSuccess(res, subDepartments, 'Sub departments retrieved successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve sub departments');
    }
  }

  async createSubDepartment(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, departmentId } = req.body;
      
      console.log('createSubDepartment received:', { name, code, departmentId });
      
      // Backend validation
      if (!name || !code) {
        this.sendError(res, 'Name and Code are required', 400);
        return;
      }
      
      const parsedDepartmentId = parseInt(departmentId);
      if (departmentId === undefined || departmentId === null || isNaN(parsedDepartmentId)) {
        console.log('Department validation failed:', { departmentId, parsedDepartmentId });
        this.sendError(res, 'Valid Department selection is required', 400);
        return;
      }
      
      const userId = this.getUserId(req);
      const subDepartment = await this.storage.createSubDepartment(req.body, { changedBy: userId });
      this.sendSuccess(res, subDepartment, 'Sub department created successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to create sub department');
    }
  }

  async updateSubDepartment(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = this.getUserId(req);
      const subDepartment = await this.storage.updateSubDepartment(id, req.body, { changedBy: userId });
      if (!subDepartment) {
        this.sendNotFound(res, 'Sub department');
        return;
      }
      this.sendSuccess(res, subDepartment, 'Sub department updated successfully');
    } catch (error) {
      this.handleError(res, error, 'Failed to update sub department');
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
