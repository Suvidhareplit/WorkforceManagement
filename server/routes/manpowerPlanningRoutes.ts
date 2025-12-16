import { Router } from 'express';
import { manpowerPlanningController } from '../controllers/manpowerPlanningController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get manpower planning for a specific centre
router.get('/centre/:centreId', manpowerPlanningController.getCentrePlanning);

// Save manpower planning for a centre
router.post('/centre', manpowerPlanningController.saveCentrePlanning);

// Get all manpower planning data
router.get('/all', manpowerPlanningController.getAllPlanning);

// Get cluster summary with shrinkage
router.get('/cluster/:clusterId/summary', manpowerPlanningController.getClusterSummary);

// Workshop Technician Planning routes
router.get('/workshop-technician', manpowerPlanningController.getWorkshopTechnicianPlanning);
router.post('/workshop-technician', manpowerPlanningController.saveWorkshopTechnicianPlanning);
router.delete('/workshop-technician/:cityId', manpowerPlanningController.deleteWorkshopTechnicianPlanning);

// Bikes per employee analysis
router.get('/bikes-per-employee', manpowerPlanningController.getBikesPerEmployeeAnalysis);

// City-wise manpower analysis
router.get('/city-analysis', manpowerPlanningController.getCityManpowerAnalysis);

export default router;
