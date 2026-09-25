import crypto from 'crypto';
import prisma from '../config/db.js';
import { generateTicketToken } from '../utils/qrHelper.js';

export const createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketId, quantity = 1, attendees = [] } = req.body;
    const userId = req.user.id;

    if (!eventId || !ticketId) {
      return res.status(400).json({ message: 'Event ID and Ticket ID are required.' });
    }

    const qty = Math.max(1, parseInt(quantity, 10));

    // Verify ticket and availability
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Selected ticket type does not exist.' });
    }

    if (ticket.eventId !== eventId) {
      return res.status(400).json({ message: 'Ticket does not belong to this event.' });
    }

    if (ticket.availableQuantity < qty) {
      return res.status(400).json({
        message: `Only ${ticket.availableQuantity} tickets remaining for this tier.`,
      });
    }

    // Check event status
    if (ticket.event.status !== 'APPROVED') {
      return res.status(400).json({ message: 'This event is currently not open for bookings.' });
    }

    // Calculate total
    const totalAmount = ticket.price * qty;
    const isFree = totalAmount === 0;

    // Unique booking ID format: EE-YYYY-XXXX
    const bookingCode = `EE-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Perform transaction to ensure atomic stock decrement and booking creation
    const result = await prisma.$transaction(async (tx) => {
      // Decrement ticket quantity
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          availableQuantity: {
            decrement: qty,
          },
        },
      });

      // Create Booking
      const booking = await tx.booking.create({
        data: {
          bookingId: bookingCode,
          userId,
          eventId,
          ticketId,
          quantity: qty,
          totalAmount,
          paymentStatus: isFree ? 'PAID' : 'PENDING',
          bookingStatus: 'CONFIRMED',
        },
      });

      // Prepare attendee list (defaults to user if not specified)
      const attendeeRecords = [];
      for (let i = 0; i < qty; i++) {
        const attendeeInfo = attendees[i] || {};
        const attendeeName = attendeeInfo.name || req.user.name;
        const attendeeEmail = attendeeInfo.email || req.user.email;
        const attendeePhone = attendeeInfo.phone || req.user.phone || '';

        const attendeeId = crypto.randomUUID();
        const qrToken = generateTicketToken(attendeeId, eventId, booking.id);

        const attendee = await tx.eventAttendee.create({
          data: {
            id: attendeeId,
            bookingId: booking.id,
            userId,
            eventId,
            ticketId,
            attendeeName,
            attendeeEmail,
            attendeePhone,
            qrCode: qrToken,
            checkInStatus: 'PENDING',
          },
        });
        attendeeRecords.push(attendee);
      }

      // If free, create payment record automatically
      if (isFree) {
        await tx.payment.create({
          data: {
            bookingId: booking.id,
            transactionId: `TXN-FREE-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            amount: 0,
            paymentMethod: 'FREE_REGISTRATION',
            paymentStatus: 'SUCCESS',
          },
        });

        // Add confirmation notification
        await tx.notification.create({
          data: {
            userId,
            title: 'Registration Confirmed!',
            message: `Your registration for "${ticket.event.title}" is confirmed. Booking ID: ${bookingCode}`,
            type: 'BOOKING',
          },
        });
      }

      return { booking, attendeeRecords };
    });

    res.status(201).json({
      message: isFree ? 'Registration confirmed successfully!' : 'Booking created. Proceed to payment.',
      booking: result.booking,
      attendees: result.attendeeRecords,
      isFree,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            category: true,
          },
        },
        ticket: true,
        attendees: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ id }, { bookingId: id }],
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        ticket: true,
        attendees: true,
        payment: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Only owner, organizer of the event, or admin can view
    if (
      booking.userId !== req.user.id &&
      booking.event.organizerId !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({ message: 'Unauthorized to view this booking.' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { ticket: true, event: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ message: 'This booking is already cancelled.' });
    }

    // Restore ticket quantity and mark booking cancelled
    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: booking.ticketId },
        data: {
          availableQuantity: {
            increment: booking.quantity,
          },
        },
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          bookingStatus: 'CANCELLED',
          paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
        },
      }),
      prisma.notification.create({
        data: {
          userId: booking.userId,
          title: 'Booking Cancelled',
          message: `Your booking ${booking.bookingId} for "${booking.event.title}" has been cancelled.`,
          type: 'BOOKING',
        },
      }),
    ]);

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};
