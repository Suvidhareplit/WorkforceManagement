import { Router } from "express";
import { storage } from "../storage";
import { 
  insertCitySchema, insertClusterSchema, insertRoleSchema, 
  insertVendorSchema, insertRecruiterSchema 
} from "@shared/schema";
import { validateRequest } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";

const router = Router();

// Public endpoints for dropdowns
router.get('/cities', async (req, res) => {
  try {
    const cities = await storage.getCities();
    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/cities/:cityId/clusters', async (req, res) => {
  try {
    const cityId = parseInt(req.params.cityId);
    const clusters = await storage.getClustersByCity(cityId);
    res.json(clusters);
  } catch (error) {
    console.error('Get clusters error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/roles', async (req, res) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/vendors', async (req, res) => {
  try {
    const vendors = await storage.getVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/recruiters', async (req, res) => {
  try {
    const recruiters = await storage.getRecruiters();
    res.json(recruiters);
  } catch (error) {
    console.error('Get recruiters error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin routes require authentication
router.use(authenticate);

// Create master data
router.post('/cities', validateRequest(insertCitySchema), async (req, res) => {
  try {
    const city = await storage.createCity(req.body);
    res.status(201).json(city);
  } catch (error) {
    console.error('Create city error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/clusters', validateRequest(insertClusterSchema), async (req, res) => {
  try {
    const cluster = await storage.createCluster(req.body);
    res.status(201).json(cluster);
  } catch (error) {
    console.error('Create cluster error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/roles', validateRequest(insertRoleSchema), async (req, res) => {
  try {
    const role = await storage.createRole(req.body);
    res.status(201).json(role);
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/vendors', validateRequest(insertVendorSchema), async (req, res) => {
  try {
    const vendor = await storage.createVendor(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/recruiters', validateRequest(insertRecruiterSchema), async (req, res) => {
  try {
    const recruiter = await storage.createRecruiter(req.body);
    res.status(201).json(recruiter);
  } catch (error) {
    console.error('Create recruiter error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as masterDataRoutes };
