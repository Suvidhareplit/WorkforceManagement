import { Request, Response } from "express";
import { storage } from "../storage";

const getHiringAnalytics = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const analytics = await storage.getHiringAnalytics(filters);
    res.json(analytics);
  } catch (error) {
    console.error('Get hiring analytics error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCandidatePipeline = async (req: Request, res: Response) => {
  try {
    const pipeline = await storage.getCandidatePipeline();
    res.json(pipeline);
  } catch (error) {
    console.error('Get pipeline analytics error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getVendorPerformance = async (req: Request, res: Response) => {
  try {
    const performance = await storage.getVendorPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Get vendor performance error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRecruiterPerformance = async (req: Request, res: Response) => {
  try {
    const performance = await storage.getRecruiterPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Get recruiter performance error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const analyticsController = {
  getHiringAnalytics,
  getCandidatePipeline,
  getVendorPerformance,
  getRecruiterPerformance
};
