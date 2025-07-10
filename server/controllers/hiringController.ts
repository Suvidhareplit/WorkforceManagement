import { Router } from "express";
import { storage } from "../storage";
import { insertHiringRequestSchema } from "@shared/schema";
import { validateRequest } from "../middlewares/validation";
import { authenticate } from "../middlewares/auth";
import { generateRequestId } from "../utils/helpers";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create hiring request
router.post('/', validateRequest(insertHiringRequestSchema), async (req, res) => {
  try {
    const requestData = req.body;
    const userId = (req as any).user.userId;

    // Generate unique request ID
    const city = await storage.getCities().then(cities => cities.find(c => c.id === requestData.cityId));
    const cluster = await storage.getClustersByCity(requestData.cityId).then(clusters => clusters.find(c => c.id === requestData.clusterId));
    const role = await storage.getRoles().then(roles => roles.find(r => r.id === requestData.roleId));

    if (!city || !cluster || !role) {
      return res.status(400).json({ message: "Invalid city, cluster, or role" });
    }

    // If multiple positions, create individual requests
    const requests = [];
    for (let i = 0; i < requestData.numberOfPositions; i++) {
      const requestId = generateRequestId(city.code, role.code, cluster.code, i + 1);
      
      const request = await storage.createHiringRequest({
        ...requestData,
        requestId,
        numberOfPositions: 1, // Individual request per position
        createdBy: userId
      });
      
      requests.push(request);
    }

    res.status(201).json(requests);
  } catch (error) {
    console.error('Create hiring request error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all hiring requests
router.get('/', async (req, res) => {
  try {
    const filters = req.query;
    const requests = await storage.getHiringRequests(filters);
    res.json(requests);
  } catch (error) {
    console.error('Get hiring requests error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get hiring request by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const request = await storage.getHiringRequest(id);
    
    if (!request) {
      return res.status(404).json({ message: "Hiring request not found" });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Get hiring request error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update hiring request status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['open', 'closed', 'called_off'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const request = await storage.updateHiringRequestStatus(id, status);
    
    if (!request) {
      return res.status(404).json({ message: "Hiring request not found" });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Update hiring request status error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as hiringRoutes };
