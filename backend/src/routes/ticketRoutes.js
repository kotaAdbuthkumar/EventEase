import express from 'express';
import {
  getTicketById,
  verifyAndCheckInTicket,
} from '../controllers/ticketController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get digital ticket view (requires auth)
router.get('/:id', requireAuth, getTicketById);

// Organizer / Admin ticket scanner & check-in verification
router.post(
  '/verify',
  requireAuth,
  requireRole(['ORGANIZER', 'ADMIN']),
  verifyAndCheckInTicket
);

export default router;
