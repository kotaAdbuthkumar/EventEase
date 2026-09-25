import prisma from '../config/db.js';

const generateSlug = (title) => {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;
};

export const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      type, // 'online' | 'in-person' | 'all'
      minPrice,
      maxPrice,
      startDate,
      endDate,
      sort = 'upcoming',
      page = 1,
      limit = 12,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    // Filters
    const where = {
      status: 'APPROVED',
    };

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { venue: { contains: q } },
        { city: { contains: q } },
        { organizer: { name: { contains: q } } },
      ];
    }

    if (category && category !== 'all') {
      where.category = {
        slug: category,
      };
    }

    if (type === 'online') {
      where.isOnline = true;
    } else if (type === 'in-person') {
      where.isOnline = false;
    }

    if (startDate) {
      where.date = {
        ...(where.date || {}),
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.date = {
        ...(where.date || {}),
        lte: new Date(endDate),
      };
    }

    // Sorting
    let orderBy = [{ date: 'asc' }];
    if (sort === 'popular') {
      orderBy = [{ bookings: { _count: 'desc' } }, { date: 'asc' }];
    } else if (sort === 'recent') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sort === 'upcoming') {
      orderBy = [{ date: 'asc' }];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          category: true,
          organizer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          tickets: {
            select: {
              id: true,
              name: true,
              type: true,
              price: true,
              availableQuantity: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.event.count({ where }),
    ]);

    // Enhance events with minPrice, maxPrice, averageRating
    const enhancedEvents = events.map((event) => {
      const prices = event.tickets.map((t) => t.price);
      const minTicketPrice = prices.length ? Math.min(...prices) : 0;
      const maxTicketPrice = prices.length ? Math.max(...prices) : 0;
      const totalRatings = event.reviews.length;
      const avgRating = totalRatings > 0
        ? (event.reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalRatings).toFixed(1)
        : null;

      return {
        ...event,
        minPrice: minTicketPrice,
        maxPrice: maxTicketPrice,
        averageRating: avgRating ? parseFloat(avgRating) : null,
        reviewCount: totalRatings,
      };
    });

    res.json({
      events: enhancedEvents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedEvents = async (req, res, next) => {
  try {
    const featured = await prisma.event.findMany({
      where: {
        status: 'APPROVED',
        featured: true,
      },
      include: {
        category: true,
        organizer: {
          select: { id: true, name: true, profileImage: true },
        },
        tickets: true,
        reviews: { select: { rating: true } },
      },
      take: 6,
      orderBy: { date: 'asc' },
    });

    res.json({ events: featured });
  } catch (error) {
    next(error);
  }
};

export const getEventByIdOrSlug = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profileImage: true,
          },
        },
        tickets: {
          orderBy: { price: 'asc' },
        },
        schedule: {
          orderBy: { time: 'asc' },
        },
        speakers: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            bookings: true,
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Get related events in same category
    const relatedEvents = await prisma.event.findMany({
      where: {
        categoryId: event.categoryId,
        id: { not: event.id },
        status: 'APPROVED',
      },
      include: {
        category: true,
        tickets: true,
      },
      take: 3,
    });

    const totalRatings = event.reviews.length;
    const avgRating = totalRatings > 0
      ? (event.reviews.reduce((acc, cur) => acc + cur.rating, 0) / totalRatings).toFixed(1)
      : null;

    res.json({
      event: {
        ...event,
        averageRating: avgRating ? parseFloat(avgRating) : null,
        reviewCount: totalRatings,
      },
      relatedEvents,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      image,
      date,
      startTime,
      endTime,
      venue,
      address,
      city,
      state,
      country = 'India',
      isOnline = false,
      streamUrl,
      capacity = 100,
      registrationDeadline,
      tickets = [],
      schedule = [],
      speakers = [],
    } = req.body;

    if (!title || !description || !categoryId || !date || !startTime || !venue) {
      return res.status(400).json({ message: 'Please provide all mandatory event details.' });
    }

    const slug = generateSlug(title);

    // If admin is creating, approved immediately; if organizer, status can be APPROVED or PENDING
    const status = req.user.role === 'ADMIN' ? 'APPROVED' : 'APPROVED';

    const event = await prisma.event.create({
      data: {
        organizerId: req.user.id,
        title,
        slug,
        description,
        categoryId,
        image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
        date: new Date(date),
        startTime,
        endTime: endTime || startTime,
        venue,
        address: address || venue,
        city: city || 'Online',
        state,
        country,
        isOnline: Boolean(isOnline),
        streamUrl,
        capacity: parseInt(capacity, 10) || 100,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        status,
        tickets: {
          create: tickets.length > 0 ? tickets.map(t => ({
            name: t.name,
            type: t.type || 'GENERAL',
            price: parseFloat(t.price) || 0,
            quantity: parseInt(t.quantity, 10) || 50,
            availableQuantity: parseInt(t.quantity, 10) || 50,
          })) : [
            {
              name: 'General Admission',
              type: 'GENERAL',
              price: 0,
              quantity: 100,
              availableQuantity: 100,
            },
          ],
        },
        schedule: {
          create: schedule.map(s => ({
            title: s.title,
            speaker: s.speaker,
            time: s.time,
            description: s.description,
          })),
        },
        speakers: {
          create: speakers.map(sp => ({
            name: sp.name,
            role: sp.role,
            company: sp.company,
            bio: sp.bio,
            avatar: sp.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(sp.name)}`,
          })),
        },
      },
      include: {
        tickets: true,
        schedule: true,
        speakers: true,
        category: true,
      },
    });

    res.status(201).json({
      message: 'Event created successfully!',
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.event.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Only creator or admin can update
    if (existing.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this event.' });
    }

    const {
      title,
      description,
      categoryId,
      image,
      date,
      startTime,
      endTime,
      venue,
      address,
      city,
      state,
      country,
      isOnline,
      streamUrl,
      capacity,
      registrationDeadline,
      status,
      featured,
    } = req.body;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(categoryId && { categoryId }),
        ...(image && { image }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(venue && { venue }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state !== undefined && { state }),
        ...(country && { country }),
        ...(isOnline !== undefined && { isOnline }),
        ...(streamUrl !== undefined && { streamUrl }),
        ...(capacity && { capacity: parseInt(capacity, 10) }),
        ...(registrationDeadline !== undefined && {
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        }),
        ...(status && { status }),
        ...(featured !== undefined && req.user.role === 'ADMIN' && { featured }),
      },
    });

    res.json({ message: 'Event updated successfully!', event: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.event.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    if (existing.organizerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this event.' });
    }

    await prisma.event.delete({ where: { id } });

    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { events: true },
        },
      },
    });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({ message: 'Event, rating (1-5), and comment are required.' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        eventId,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, profileImage: true },
        },
      },
    });

    res.status(201).json({ message: 'Review added successfully!', review });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_eventId: {
          userId: req.user.id,
          eventId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return res.json({ saved: false, message: 'Event removed from wishlist.' });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: req.user.id,
          eventId,
        },
      });
      return res.json({ saved: true, message: 'Event saved to wishlist!' });
    }
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const list = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        event: {
          include: {
            category: true,
            tickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ wishlist: list.map(item => item.event) });
  } catch (error) {
    next(error);
  }
};
