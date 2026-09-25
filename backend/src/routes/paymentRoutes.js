import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  simulateMockPayment,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/mock-checkout', simulateMockPayment);

export default router;
