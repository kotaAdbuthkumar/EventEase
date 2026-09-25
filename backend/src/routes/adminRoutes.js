import express from 'express';
import {
  getPlatformStats,
  getAdminCharts,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getAllEvents,
  updateEventStatus,
  createCategory,
  deleteCategory,
  getAllBookings,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireRole(['ADMIN']));

router.get('/stats', getPlatformStats);
router.get('/charts', getAdminCharts);
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);
router.get('/events', getAllEvents);
router.put('/events/:id/status', updateEventStatus);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/bookings', getAllBookings);

export default router;
