import { Router } from 'express';
import { centreController } from '../controllers/centreController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all centres with filtering
router.get('/', centreController.getCentres);

// Get centre by ID
router.get('/:id', centreController.getCentreById);

// Create new centre
router.post('/', centreController.createCentre);

// Update centre
router.put('/:id', centreController.updateCentre);

// Delete centre
router.delete('/:id', centreController.deleteCentre);

// Get centres by cluster
router.get('/cluster/:clusterId', centreController.getCentresByCluster);

// Toggle centre status
router.patch('/:id/toggle-status', centreController.toggleCentreStatus);

export default router;
