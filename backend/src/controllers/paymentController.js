import crypto from 'crypto';
import prisma from '../config/db.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../config/razorpay.js';

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to pay for this booking.' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'This booking is already paid.' });
    }

    const orderData = await createRazorpayOrder(
      booking.totalAmount,
      booking.bookingId,
      {
        bookingId: booking.id,
        eventTitle: booking.event.title,
        userEmail: req.user.email,
      }
    );

    res.json({
      orderId: orderData.orderId,
      amount: orderData.amount,
      currency: orderData.currency,
      bookingId: booking.id,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_eventease123',
      isMock: orderData.isMock,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = 'UPI',
    } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    const txnId = razorpayPaymentId || `TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Update booking and insert payment
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'PAID',
        },
      }),
      prisma.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          transactionId: txnId,
          amount: booking.totalAmount,
          paymentMethod,
          paymentStatus: 'SUCCESS',
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
        },
        update: {
          transactionId: txnId,
          paymentStatus: 'SUCCESS',
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: booking.userId,
          title: 'Payment Successful!',
          message: `Payment of ₹${booking.totalAmount} for "${booking.event.title}" was successful! Your tickets are ready.`,
          type: 'BOOKING',
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      transactionId: txnId,
    });
  } catch (error) {
    next(error);
  }
};

export const simulateMockPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod = 'UPI' } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const txnId = `MOCK-TXN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'PAID',
        },
      }),
      prisma.payment.create({
        data: {
          bookingId: booking.id,
          transactionId: txnId,
          amount: booking.totalAmount,
          paymentMethod,
          paymentStatus: 'SUCCESS',
          razorpayOrderId: `sim_order_${Date.now()}`,
          razorpayPaymentId: `sim_pay_${Date.now()}`,
        },
      }),
      prisma.notification.create({
        data: {
          userId: booking.userId,
          title: 'Payment Successful!',
          message: `Payment of ₹${booking.totalAmount} for "${booking.event.title}" was completed! Your tickets are ready.`,
          type: 'BOOKING',
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Sandbox payment processed successfully!',
      transactionId: txnId,
    });
  } catch (error) {
    next(error);
  }
};
