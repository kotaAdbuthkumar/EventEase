import prisma from '../config/db.js';
import { generateQRCodeDataURL, parseTicketToken } from '../utils/qrHelper.js';

export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const attendee = await prisma.eventAttendee.findFirst({
      where: {
        OR: [{ id }, { qrCode: id }],
      },
      include: {
        event: {
          include: {
            category: true,
            organizer: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
        ticket: true,
        booking: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!attendee) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Generate high-res QR code image data URL
    const qrCodeDataUrl = await generateQRCodeDataURL(attendee.qrCode);

    res.json({
      ticket: {
        ...attendee,
        qrCodeImage: qrCodeDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAndCheckInTicket = async (req, res, next) => {
  try {
    const { token, eventId } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Ticket QR code / token is required.' });
    }

    // Attempt token parse or direct qrCode match
    let attendee = await prisma.eventAttendee.findUnique({
      where: { qrCode: token },
      include: {
        event: true,
        ticket: true,
        booking: true,
      },
    });

    if (!attendee) {
      // Try searching by ID
      attendee = await prisma.eventAttendee.findUnique({
        where: { id: token },
        include: {
          event: true,
          ticket: true,
          booking: true,
        },
      });
    }

    if (!attendee) {
      // Try parsing base64 token
      const parsed = parseTicketToken(token);
      if (parsed && parsed.aid) {
        attendee = await prisma.eventAttendee.findUnique({
          where: { id: parsed.aid },
          include: {
            event: true,
            ticket: true,
            booking: true,
          },
        });
      }
    }

    if (!attendee) {
      return res.status(404).json({
        valid: false,
        status: 'INVALID',
        message: 'Invalid Ticket! This QR code does not exist in the system.',
      });
    }

    // If organizer is scanning, verify organizer owns the event or is admin
    if (req.user.role !== 'ADMIN' && attendee.event.organizerId !== req.user.id) {
      return res.status(403).json({
        valid: false,
        status: 'UNAUTHORIZED_EVENT',
        message: 'This ticket belongs to an event hosted by another organizer.',
      });
    }

    // Optional eventId matching filter
    if (eventId && attendee.eventId !== eventId) {
      return res.status(400).json({
        valid: false,
        status: 'WRONG_EVENT',
        message: `This ticket is for "${attendee.event.title}", not the selected event.`,
        attendee: {
          name: attendee.attendeeName,
          eventTitle: attendee.event.title,
        },
      });
    }

    // Check booking status
    if (attendee.booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({
        valid: false,
        status: 'CANCELLED',
        message: 'Ticket is VOID because the booking was cancelled.',
        attendee: {
          name: attendee.attendeeName,
          email: attendee.attendeeEmail,
          ticketType: attendee.ticket.name,
        },
      });
    }

    // Check payment status
    if (attendee.booking.paymentStatus !== 'PAID') {
      return res.status(400).json({
        valid: false,
        status: 'UNPAID',
        message: 'Ticket cannot be validated because payment has not been completed.',
        attendee: {
          name: attendee.attendeeName,
          ticketType: attendee.ticket.name,
        },
      });
    }

    // Check if already checked in
    if (attendee.checkInStatus === 'CHECKED_IN') {
      return res.status(400).json({
        valid: false,
        status: 'ALREADY_CHECKED_IN',
        message: `Already checked in at ${new Date(attendee.checkedInAt).toLocaleTimeString()}! Duplicate entry forbidden.`,
        attendee: {
          name: attendee.attendeeName,
          email: attendee.attendeeEmail,
          ticketType: attendee.ticket.name,
          checkedInAt: attendee.checkedInAt,
        },
      });
    }

    // Mark as checked-in
    const updated = await prisma.eventAttendee.update({
      where: { id: attendee.id },
      data: {
        checkInStatus: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
    });

    res.json({
      valid: true,
      status: 'SUCCESS',
      message: `Verified! Welcome, ${attendee.attendeeName}.`,
      attendee: {
        id: updated.id,
        name: updated.attendeeName,
        email: updated.attendeeEmail,
        ticketType: attendee.ticket.name,
        tier: attendee.ticket.type,
        bookingCode: attendee.booking.bookingId,
        eventTitle: attendee.event.title,
        checkedInAt: updated.checkedInAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
