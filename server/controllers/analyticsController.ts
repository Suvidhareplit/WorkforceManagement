import { Router } from "express";
import { storage } from "../storage";
import { authenticate } from "../middlewares/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get hiring analytics
router.get('/hiring', async (req, res) => {
  try {
    const filters = req.query;
    const analytics = await storage.getHiringAnalytics(filters);
    res.json(analytics);
  } catch (error) {
    console.error('Get hiring analytics error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get candidate pipeline analytics
router.get('/pipeline', async (req, res) => {
  try {
    const pipeline = await storage.getCandidatePipeline();
    res.json(pipeline);
  } catch (error) {
    console.error('Get pipeline analytics error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get vendor performance
router.get('/vendors', async (req, res) => {
  try {
    const performance = await storage.getVendorPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Get vendor performance error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get recruiter performance
router.get('/recruiters', async (req, res) => {
  try {
    const performance = await storage.getRecruiterPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Get recruiter performance error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as analyticsRoutes };
