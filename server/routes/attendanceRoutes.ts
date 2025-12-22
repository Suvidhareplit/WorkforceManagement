import express from 'express';
import {
  getWorkingEmployees,
  bulkUploadAttendance,
  getAttendance,
  getAbscondingCases,
  notifyManager,
  managerResponse,
  sendLetter,
  resolveCase
} from '../controllers/attendanceController';

const router = express.Router();

// Working employees
router.get('/working-employees', getWorkingEmployees);

// Attendance
router.post('/bulk-upload', bulkUploadAttendance);
router.get('/', getAttendance);

// Absconding cases
router.get('/absconding', getAbscondingCases);
router.post('/absconding/:id/notify', notifyManager);
router.post('/absconding/:id/manager-response', managerResponse);
router.post('/absconding/:id/send-letter', sendLetter);
router.post('/absconding/:id/resolve', resolveCase);

export default router;
