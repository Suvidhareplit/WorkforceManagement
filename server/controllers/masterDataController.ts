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
    const role = await storage.createRole(req.body);
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

export const masterDataController = {
  getCities,
  getClustersByCity,
  getRoles,
  getVendors,
  getRecruiters,
  createCity,
  createCluster,
  createRole,
  createVendor,
  createRecruiter
};
