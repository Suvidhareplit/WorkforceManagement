import express from 'express';
import { onboardingController } from '../controllers/onboardingController';

const router = express.Router();

// Onboarding routes
router.get('/onboarding', onboardingController.getOnboardingRecords);
router.post('/onboarding', onboardingController.createOnboarding);
router.patch('/onboarding/:id', onboardingController.updateOnboarding);
router.post('/onboarding/bulk-upload', onboardingController.bulkUploadOnboarding);
router.post('/onboarding/migration-upload', onboardingController.bulkUploadMigration);
router.post('/bulk-onboard', onboardingController.bulkOnboardSubmission);

export default router;
