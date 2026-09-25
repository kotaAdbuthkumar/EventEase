import express from 'express';
import {
  getEvents,
  getFeaturedEvents,
  getEventByIdOrSlug,
  createEvent,
  updateEvent,
  deleteEvent,
  getCategories,
  addReview,
  toggleWishlist,
  getWishlist,
} from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/categories', getCategories);
router.get('/wishlist', requireAuth, getWishlist);
router.post('/wishlist', requireAuth, toggleWishlist);
router.get('/:id', getEventByIdOrSlug);

// Organizer & Admin event management
router.post('/', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), createEvent);
router.put('/:id', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), updateEvent);
router.delete('/:id', requireAuth, requireRole(['ORGANIZER', 'ADMIN']), deleteEvent);

// Reviews
router.post('/:id/reviews', requireAuth, addReview);

export default router;
