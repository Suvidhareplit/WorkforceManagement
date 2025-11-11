import { Router } from 'express';
import { leaveManagementController } from '../controllers/leaveManagementController';

const router = Router();

// Leave Configs
router.get('/config', leaveManagementController.getLeaveConfigs.bind(leaveManagementController));
router.patch('/config/:id', leaveManagementController.updateLeaveConfig.bind(leaveManagementController));

// Policies
router.get('/policy', leaveManagementController.getPolicies.bind(leaveManagementController));
router.get('/policy/:id', leaveManagementController.getPolicyDetails.bind(leaveManagementController));
router.post('/policy', leaveManagementController.createPolicy.bind(leaveManagementController));
router.patch('/policy/:id/toggle-status', leaveManagementController.togglePolicyStatus.bind(leaveManagementController));

// Holidays
router.get('/holiday', leaveManagementController.getHolidays.bind(leaveManagementController));
router.post('/holiday', leaveManagementController.createHoliday.bind(leaveManagementController));
router.delete('/holiday/:id', leaveManagementController.deleteHoliday.bind(leaveManagementController));

// Audit Trail
router.get('/audit', leaveManagementController.getAuditTrail.bind(leaveManagementController));

// RH Allocations
router.get('/rh-allocation', leaveManagementController.getRHAllocations.bind(leaveManagementController));

export default router;
