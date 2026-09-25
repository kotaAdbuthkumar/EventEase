import express from 'express';
import {
  register,
  login,
  demoLogin,
  getMe,
  updateProfile,
  updatePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, updatePassword);

export default router;
