import prisma from '../config/db.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrganizers,
      totalEvents,
      activeEvents,
      pendingEvents,
      totalBookings,
      totalAttendees,
      payments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'ATTENDEE' } }),
      prisma.user.count({ where: { role: 'ORGANIZER' } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: 'APPROVED' } }),
      prisma.event.count({ where: { status: 'PENDING' } }),
      prisma.booking.count(),
      prisma.eventAttendee.count(),
      prisma.payment.findMany({
        where: { paymentStatus: 'SUCCESS' },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      stats: {
        totalUsers,
        totalOrganizers,
        totalEvents,
        activeEvents,
        pendingEvents,
        totalBookings,
        totalAttendees,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminCharts = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    const categoryDistribution = categories.map((cat) => ({
      name: cat.name,
      events: cat._count.events,
    }));

    // Growth data simulation across quarters
    const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];
    const growthTrends = quarters.map((q, i) => ({
      quarter: q,
      users: 120 + i * 85 + Math.floor(Math.sin(i) * 20),
      events: 15 + i * 18 + Math.floor(Math.cos(i) * 5),
      revenue: (25000 + i * 38000) * 1.1,
    }));

    res.json({
      categoryDistribution,
      growthTrends,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    const where = {};
    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        profileImage: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be ACTIVE or BLOCKED.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, status: true },
    });

    res.json({ message: `User status updated to ${status}.`, user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ATTENDEE', 'ORGANIZER', 'ADMIN'].includes(role?.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ message: `User role updated to ${role}.`, user });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { organizer: { name: { contains: q } } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        organizer: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            attendees: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ events });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(status && { status: status.toUpperCase() }),
        ...(featured !== undefined && { featured: Boolean(featured) }),
      },
    });

    // Notify organizer of decision
    if (status) {
      await prisma.notification.create({
        data: {
          userId: event.organizerId,
          title: `Event ${status}`,
          message: `Your event "${event.title}" has been updated to status: ${status}.`,
          type: 'EVENT_UPDATE',
        },
      });
    }

    res.json({ message: 'Event status updated successfully!', event });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        icon,
      },
    });

    res.status(201).json({ message: 'Category created successfully!', category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, date: true } },
        ticket: { select: { name: true, price: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};
