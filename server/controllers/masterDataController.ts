import { Request, Response } from "express";
import { storage } from "../storage";

const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await storage.getCities();
    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getClustersByCity = async (req: Request, res: Response) => {
  try {
    const cityId = parseInt(req.params.cityId);
    const clusters = await storage.getClustersByCity(cityId);
    res.json(clusters);
  } catch (error) {
    console.error('Get clusters error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getClusters = async (req: Request, res: Response) => {
  try {
    const clusters = await storage.getClusters();
    res.json(clusters);
  } catch (error) {
    console.error('Get all clusters error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await storage.getVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRecruiters = async (req: Request, res: Response) => {
  try {
    const recruiters = await storage.getRecruiters();
    res.json(recruiters);
  } catch (error) {
    console.error('Get recruiters error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createCity = async (req: Request, res: Response) => {
  try {
    const city = await storage.createCity(req.body);
    res.status(201).json(city);
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createCluster = async (req: Request, res: Response) => {
  try {
    const cluster = await storage.createCluster(req.body);
    res.status(201).json(cluster);
  } catch (error) {
    console.error('Create cluster error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createRole = async (req: Request, res: Response) => {
  try {
    const { name, code, description } = req.body;
    const jobDescriptionFile = req.file ? req.file.filename : null;
    
    const roleData = {
      name,
      code,
      description,
      jobDescriptionFile,
    };
    
    const role = await storage.createRole(roleData);
    res.status(201).json(role);
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await storage.createVendor(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createRecruiter = async (req: Request, res: Response) => {
  try {
    const recruiter = await storage.createRecruiter(req.body);
    res.status(201).json(recruiter);
  } catch (error) {
    console.error('Create recruiter error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleCityStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.toggleCityStatus(id, userId);
    res.json({ message: "City status updated successfully", data: result });
  } catch (error) {
    console.error('Toggle city status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleClusterStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.toggleClusterStatus(id, userId);
    res.json({ message: "Cluster status updated successfully", data: result });
  } catch (error) {
    console.error('Toggle cluster status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleRoleStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.toggleRoleStatus(id, userId);
    res.json({ message: "Role status updated successfully", data: result });
  } catch (error) {
    console.error('Toggle role status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleVendorStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.toggleVendorStatus(id, userId);
    res.json({ message: "Vendor status updated successfully", data: result });
  } catch (error) {
    console.error('Toggle vendor status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const toggleRecruiterStatus = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.toggleRecruiterStatus(id, userId);
    res.json({ message: "Recruiter status updated successfully", data: result });
  } catch (error) {
    console.error('Toggle recruiter status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCity = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.updateCity(id, req.body, userId);
    if (!result) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json({ message: "City updated successfully", data: result });
  } catch (error) {
    console.error('Update city error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCluster = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.updateCluster(id, req.body, userId);
    if (!result) {
      return res.status(404).json({ message: "Cluster not found" });
    }
    res.json({ message: "Cluster updated successfully", data: result });
  } catch (error) {
    console.error('Update cluster error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const { name, code, description } = req.body;
    const jobDescriptionFile = req.file ? req.file.filename : null;
    
    const updateData = {
      name,
      code,
      description,
      ...(jobDescriptionFile && { jobDescriptionFile }),
    };
    
    const result = await storage.updateRole(id, updateData, userId);
    if (!result) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role updated successfully", data: result });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateVendor = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.updateVendor(id, req.body, userId);
    if (!result) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor updated successfully", data: result });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateRecruiter = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).user?.id || 1;
    const result = await storage.updateRecruiter(id, req.body, userId);
    if (!result) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    res.json({ message: "Recruiter updated successfully", data: result });
  } catch (error) {
    console.error('Update recruiter error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const masterDataController = {
  getCities,
  getClustersByCity,
  getClusters,
  getRoles,
  getVendors,
  getRecruiters,
  createCity,
  createCluster,
  createRole,
  createVendor,
  createRecruiter,
  toggleCityStatus,
  toggleClusterStatus,
  toggleRoleStatus,
  toggleVendorStatus,
  toggleRecruiterStatus,
  updateCity,
  updateCluster,
  updateRole,
  updateVendor,
  updateRecruiter
};
