import express from 'express';
import {
  getDashboardStats,
  getAnalyticsCharts,
  getOrganizerEvents,
  getEventAttendees,
  exportAttendeesCSV,
  sendAnnouncement,
} from '../controllers/organizerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireRole(['ORGANIZER', 'ADMIN']));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalyticsCharts);
router.get('/events', getOrganizerEvents);
router.get('/events/:eventId/attendees', getEventAttendees);
router.get('/events/:eventId/export-csv', exportAttendeesCSV);
router.post('/events/:eventId/announcement', sendAnnouncement);

export default router;
