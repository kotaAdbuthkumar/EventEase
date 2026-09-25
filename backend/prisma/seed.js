import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

const generateTicketToken = (attendeeId, eventId, bookingId) => {
  const payload = {
    aid: attendeeId,
    eid: eventId,
    bid: bookingId,
    t: Date.now(),
    r: crypto.randomBytes(4).toString('hex'),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
};

async function main() {
  console.log('🌱 Starting EventEase comprehensive database seed...');

  // Clear existing records in proper dependency order
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 1. Create Core Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Aditya Admin',
      email: 'admin@eventease.com',
      password: passwordHash,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: 'Priya Sharma (TechInnovate)',
      email: 'organizer@eventease.com',
      password: passwordHash,
      phone: '+91 98220 12345',
      role: 'ORGANIZER',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    },
  });

  const attendee = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'attendee@eventease.com',
      password: passwordHash,
      phone: '+91 99112 87654',
      role: 'ATTENDEE',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created 3 core demo users (Attendee, Organizer, Admin)');

  // 2. Create Categories
  const categoryDefs = [
    {
      name: 'Technology',
      slug: 'technology',
      description: 'AI, software development, cloud computing, and developer conferences.',
      icon: 'Cpu',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Music & Concerts',
      slug: 'music',
      description: 'Live concerts, acoustic nights, EDM festivals, and classical symphonies.',
      icon: 'Music',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Business & Startups',
      slug: 'business',
      description: 'Startup pitch nights, venture capital summits, and networking mix.',
      icon: 'Briefcase',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Workshops & Education',
      slug: 'workshops',
      description: 'Hands-on bootcamps, masterclasses, and certified skill workshops.',
      icon: 'GraduationCap',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Cultural & Arts',
      slug: 'cultural',
      description: 'Theatre, heritage walks, film screenings, and art exhibitions.',
      icon: 'Palette',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'College Events',
      slug: 'college-events',
      description: 'Inter-college cultural fests, esports arenas, and student hackathons.',
      icon: 'School',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sports & Fitness',
      slug: 'sports',
      description: 'Marathons, football leagues, yoga retreats, and fitness challenges.',
      icon: 'Trophy',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoryDefs) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log(`✅ Created ${Object.keys(categories).length} event categories`);

  // 3. Create 10 Comprehensive Events
  const eventsData = [
    {
      title: 'Global AI & Machine Learning Conference 2026',
      slug: 'global-ai-machine-learning-conference-2026',
      description: 'Join over 2,500 AI researchers, software engineers, and industry founders at India\'s premier Artificial Intelligence conference. Topics include Generative AI models, autonomous agents, neural architectures, ethical AI governance, and scalable model deployment in production systems.',
      categoryId: categories['technology'],
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-10-15T09:00:00Z'),
      startTime: '09:00 AM',
      endTime: '06:00 PM',
      venue: 'Bangalore International Exhibition Centre (BIEC)',
      address: '10th Mile, Tumkur Road, Madavara',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      isOnline: false,
      capacity: 1500,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Early Bird Pass', type: 'EARLY_BIRD', price: 999, quantity: 200, availableQuantity: 180 },
        { name: 'General Admission', type: 'GENERAL', price: 1999, quantity: 800, availableQuantity: 750 },
        { name: 'VIP All-Access + Dinner', type: 'VIP', price: 4999, quantity: 150, availableQuantity: 130 },
      ],
      schedule: [
        { title: 'Registration & Welcome Keynote', time: '09:00 AM - 10:15 AM', speaker: 'Dr. Vikram Seth', description: 'Opening remarks on the landscape of Agentic AI in 2026.' },
        { title: 'Scaling LLM Inference on Edge Hardware', time: '10:30 AM - 12:00 PM', speaker: 'Ananya Roy', description: 'Techniques for sub-10ms latency in mobile and local deployments.' },
        { title: 'Lunch & Networking Lounge', time: '12:00 PM - 01:30 PM', speaker: 'All Attendees', description: 'Buffet lunch and VIP exhibition walkthrough.' },
        { title: 'Panel: The Next Frontier in Multimodal AI', time: '02:00 PM - 03:45 PM', speaker: 'Panel Discussion', description: 'Frontier models, visual reasoning, and synthetic data generation.' },
        { title: 'Closing Networking Reception', time: '04:30 PM - 06:00 PM', speaker: 'Networking', description: 'Connect with speakers, founders, and VC partners.' },
      ],
      speakers: [
        { name: 'Dr. Vikram Seth', role: 'Chief AI Scientist', company: 'DeepScale Labs', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
        { name: 'Ananya Roy', role: 'Head of ML Platform', company: 'HyperCloud Technologies', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'IoT & Smart Hardware Innovation Summit',
      slug: 'iot-smart-hardware-innovation-summit',
      description: 'Explore the convergence of embedded robotics, industrial sensors, edge computing, and smart city architectures. Experience live demonstrations of smart energy grids, automotive telemetry, and next-gen RISC-V development boards.',
      categoryId: categories['technology'],
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-10-24T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '05:30 PM',
      venue: 'Hyderabad International Convention Centre (HICC)',
      address: 'Novotel & HICC Complex, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      isOnline: false,
      capacity: 800,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Standard Pass', type: 'GENERAL', price: 1499, quantity: 400, availableQuantity: 380 },
        { name: 'Student Innovator Pass', type: 'STUDENT', price: 499, quantity: 150, availableQuantity: 120 },
      ],
      schedule: [
        { title: 'Smart Cities & Industrial IoT', time: '10:00 AM', speaker: 'Rajesh Kulkarni', description: 'Deploying sensor mesh networks in modern megacities.' },
        { title: 'Hardware Hacking & Firmware Security', time: '02:00 PM', speaker: 'Sneha Patel', description: 'Zero-trust architecture for IoT device endpoints.' },
      ],
      speakers: [
        { name: 'Rajesh Kulkarni', role: 'VP of Hardware Systems', company: 'SenseTech Global', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'Full-Stack Modern Web Development Bootcamp',
      slug: 'full-stack-modern-web-development-bootcamp',
      description: 'A 2-day hands-on workshop taking you through Next.js 15, React Server Components, Tailwind CSS, GraphQL, PostgreSQL with Prisma ORM, and high-performance serverless deployment patterns on Vercel and AWS.',
      categoryId: categories['workshops'],
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-11-05T09:30:00Z'),
      startTime: '09:30 AM',
      endTime: '05:00 PM',
      venue: 'WeWork Galaxy, Residency Road',
      address: '43, Residency Rd, Shanthala Nagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      isOnline: true,
      streamUrl: 'https://eventease.live/bootcamp-stream',
      capacity: 250,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Virtual Workshop Pass', type: 'GENERAL', price: 799, quantity: 150, availableQuantity: 110 },
        { name: 'In-Person VIP Cohort Pass', type: 'VIP', price: 2499, quantity: 50, availableQuantity: 35 },
      ],
      schedule: [
        { title: 'React 19 & Next.js Architecture', time: '09:30 AM', speaker: 'Kavita Joshi', description: 'Modern declarative state, Server Actions, and Suspense.' },
        { title: 'Building Relational Schemas with Prisma', time: '01:30 PM', speaker: 'Kavita Joshi', description: 'Optimizing SQL queries, relations, and transactional integrity.' },
      ],
      speakers: [
        { name: 'Kavita Joshi', role: 'Principal Architect', company: 'CloudCraft Software', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'National Startup Pitch Competition & Demo Day',
      slug: 'national-startup-pitch-competition-demo-day',
      description: '30 pre-vetted early-stage startups pitch in front of 50+ leading venture capital funds and angel syndicates for up to ₹5 Crore in on-the-spot seed funding commitments. Enjoy open networking, founder roundtables, and keynote speeches.',
      categoryId: categories['business'],
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-11-12T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '07:00 PM',
      venue: 'JW Marriott Hotel, Senapati Bapat Marg',
      address: 'Senapati Bapat Marg, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      isOnline: false,
      capacity: 500,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Founder Entry (Pitching + Booth)', type: 'PREMIUM', price: 3499, quantity: 30, availableQuantity: 22 },
        { name: 'Investor & General Attendee', type: 'GENERAL', price: 1299, quantity: 300, availableQuantity: 240 },
        { name: 'Student Observer', type: 'STUDENT', price: 499, quantity: 100, availableQuantity: 85 },
      ],
      schedule: [
        { title: 'Founder Pitches: FinTech & SaaS', time: '10:30 AM', speaker: 'VC Panel', description: 'Round 1 of 5-minute live pitches.' },
        { title: 'Keynote: Scaling From 0 to 100M ARR', time: '02:30 PM', speaker: 'Aakash Singhal', description: 'Lessons from building India\'s fastest unicorn.' },
      ],
      speakers: [
        { name: 'Aakash Singhal', role: 'Founding Partner', company: 'Apex Ventures', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'Sanskriti: Inter-College Cultural Carnival 2026',
      slug: 'sanskriti-inter-college-cultural-carnival-2026',
      description: 'The largest student celebration of dance, music, battle of the bands, fashion pageants, food trucks, and street theatre spanning three energetic days on a massive campus lawn.',
      categoryId: categories['college-events'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-11-20T11:00:00Z'),
      startTime: '11:00 AM',
      endTime: '10:00 PM',
      venue: 'St. Xavier\'s College Grounds',
      address: '5, Mahapalika Marg, Dhobi Talao',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      isOnline: false,
      capacity: 3000,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Day Pass (Free Student Pass)', type: 'FREE', price: 0, quantity: 1000, availableQuantity: 820 },
        { name: 'VIP Concert Access', type: 'VIP', price: 499, quantity: 500, availableQuantity: 360 },
      ],
      schedule: [
        { title: 'Battle of the Bands', time: '01:00 PM', speaker: 'Judge Panel', description: 'Top 10 collegiate rock & fusion bands.' },
        { title: 'Headline Celebrity Concert', time: '07:30 PM', speaker: 'The Urban Vibes', description: 'High-energy 2-hour musical extravaganza.' },
      ],
      speakers: [],
    },
    {
      title: 'DevPulse National Hackathon 2026',
      slug: 'devpulse-national-hackathon-2026',
      description: 'A 36-hour non-stop in-person hackathon bringing together 800+ builders to create innovative solutions across Web3, AI, Climate Tech, and Healthcare. Mentors from Google, Microsoft, and top startups available 24/7.',
      categoryId: categories['technology'],
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-12-05T08:00:00Z'),
      startTime: '08:00 AM',
      endTime: '08:00 PM',
      venue: 'IIT Delhi Campus, Bharti Building',
      address: 'Hauz Khas',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      isOnline: false,
      capacity: 800,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Hacker Team Pass (Free Entry)', type: 'FREE', price: 0, quantity: 500, availableQuantity: 410 },
      ],
      schedule: [
        { title: 'Opening Ceremony & Problem Statements Release', time: '09:00 AM', speaker: 'Organizing Committee', description: 'Tracks unveiled and hacking begins!' },
        { title: 'Midnight Snack & Gaming Break', time: '12:00 AM', speaker: 'Community', description: 'Trivia, pizza, and Mario Kart tournaments.' },
        { title: 'Project Demos & Grand Finale', time: '04:00 PM', speaker: 'Judges', description: 'Top 10 finalists present on main stage.' },
      ],
      speakers: [
        { name: 'Kunal Nayyar', role: 'DevRel Lead', company: 'GitCore Ecosystem', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'Cloud Native & Kubernetes Masterclass',
      slug: 'cloud-native-kubernetes-masterclass',
      description: 'Deep-dive into microservices architecture, Helm charts, service meshes (Istio), CI/CD gitops workflows with ArgoCD, and automated multi-region disaster recovery on AWS EKS and GCP GKE.',
      categoryId: categories['workshops'],
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-12-12T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'Cyber City Hub, Tower 8',
      address: 'DLF Cyber City, Sector 24',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      isOnline: true,
      streamUrl: 'https://eventease.live/cloud-stream',
      capacity: 300,
      featured: false,
      status: 'APPROVED',
      tickets: [
        { name: 'Workshop Access', type: 'GENERAL', price: 999, quantity: 200, availableQuantity: 185 },
      ],
      schedule: [
        { title: 'Kubernetes in Production Best Practices', time: '10:00 AM', speaker: 'Amitabh Sen', description: 'Zero-downtime rolling updates and pod autoscaling.' },
      ],
      speakers: [
        { name: 'Amitabh Sen', role: 'Staff SRE', company: 'InfraCloud Systems', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'Cybersecurity & Ethical Hacking Symposium',
      slug: 'cybersecurity-ethical-hacking-symposium',
      description: 'Uncover real-world zero-day exploit analysis, defensive blue-teaming tactics, cloud breach forensics, and API penetration testing guided by certified security researchers.',
      categoryId: categories['technology'],
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-12-18T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      venue: 'Chennai Trade Centre',
      address: 'Nandambakkam, Mount Poonamallee Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      isOnline: false,
      capacity: 600,
      featured: false,
      status: 'APPROVED',
      tickets: [
        { name: 'Symposium Pass', type: 'GENERAL', price: 1199, quantity: 400, availableQuantity: 370 },
        { name: 'VIP Pass with CTF Arena Entry', type: 'VIP', price: 2999, quantity: 80, availableQuantity: 65 },
      ],
      schedule: [
        { title: 'Anatomy of Modern Ransomware Attacks', time: '10:30 AM', speaker: 'Deepak Mohan', description: 'Reverse-engineering evasion mechanisms.' },
      ],
      speakers: [
        { name: 'Deepak Mohan', role: 'Lead Threat Researcher', company: 'SecGuard Cyber', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
      ],
    },
    {
      title: 'Echoes of Sunset: Indie Music & Arts Festival',
      slug: 'echoes-of-sunset-indie-music-arts-festival',
      description: 'An open-air evening celebrating acoustic indie folk, soulful fusion, handcrafted cocktail bars, artisanal craft markets, and ambient light installations beside the scenic lake.',
      categoryId: categories['music'],
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-12-25T16:00:00Z'),
      startTime: '04:00 PM',
      endTime: '11:00 PM',
      venue: 'Jayabheri Silicon County Lawns',
      address: 'Financial District, Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      isOnline: false,
      capacity: 2000,
      featured: true,
      status: 'APPROVED',
      tickets: [
        { name: 'Sunset Pass', type: 'GENERAL', price: 699, quantity: 1000, availableQuantity: 890 },
        { name: 'VIP Lounge & Beverage Pass', type: 'VIP', price: 1899, quantity: 200, availableQuantity: 175 },
      ],
      schedule: [
        { title: 'Acoustic Sunset Set', time: '04:30 PM', speaker: 'Saanvi & The Strings', description: 'Original indie ballads and indie-rock covers.' },
        { title: 'DJ Groove Session & Light Show', time: '08:30 PM', speaker: 'DJ Zest', description: 'Electric dance and ambient visual beats.' },
      ],
      speakers: [],
    },
    {
      title: 'NextGen Founders & Angels Meetup',
      slug: 'nextgen-founders-angels-meetup',
      description: 'An exclusive curated mixer for tech entrepreneurs, active angel investors, and product creators. Discuss fundraising milestones, hiring core leadership, and GTM strategies over curated appetizers.',
      categoryId: categories['business'],
      image: 'https://images.unsplash.com/photo-1528605248659-1440014075b0?w=1200&auto=format&fit=crop&q=80',
      date: new Date('2026-12-30T18:00:00Z'),
      startTime: '06:00 PM',
      endTime: '09:30 PM',
      venue: 'The Social, Koregaon Park',
      address: 'North Main Road, Koregaon Park',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      isOnline: false,
      capacity: 120,
      featured: false,
      status: 'APPROVED',
      tickets: [
        { name: 'Founder Entry', type: 'GENERAL', price: 499, quantity: 100, availableQuantity: 85 },
      ],
      schedule: [
        { title: 'Fireside Chat: Product-Market Fit in 2026', time: '06:30 PM', speaker: 'Nikhil Mehta', description: 'Navigating rapid growth cycles.' },
        { title: 'Speed Networking & Drinks', time: '07:45 PM', speaker: 'All Attendees', description: 'Connect directly with angel investors.' },
      ],
      speakers: [
        { name: 'Nikhil Mehta', role: 'Angel Investor & Ex-VP', company: 'GrowthFund Global', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
      ],
    },
  ];

  const createdEvents = [];
  for (const edata of eventsData) {
    const { tickets, schedule, speakers, ...eventInfo } = edata;

    const ev = await prisma.event.create({
      data: {
        ...eventInfo,
        organizerId: organizer.id,
        tickets: {
          create: tickets,
        },
        schedule: {
          create: schedule,
        },
        speakers: {
          create: speakers,
        },
      },
      include: {
        tickets: true,
      },
    });

    createdEvents.push(ev);
  }

  console.log(`✅ Created ${createdEvents.length} events with tickets, schedules, and speakers`);

  // 4. Create sample bookings and generated tickets for the Attendee
  const firstEvent = createdEvents[0];
  const firstTicket = firstEvent.tickets[0];

  const bookingCode1 = `EE-2026-A1B2C3`;
  const booking1 = await prisma.booking.create({
    data: {
      bookingId: bookingCode1,
      userId: attendee.id,
      eventId: firstEvent.id,
      ticketId: firstTicket.id,
      quantity: 1,
      totalAmount: firstTicket.price,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
    },
  });

  const attendeeRecordId1 = crypto.randomUUID();
  const qrToken1 = generateTicketToken(attendeeRecordId1, firstEvent.id, booking1.id);

  const testAttendee1 = await prisma.eventAttendee.create({
    data: {
      id: attendeeRecordId1,
      bookingId: booking1.id,
      userId: attendee.id,
      eventId: firstEvent.id,
      ticketId: firstTicket.id,
      attendeeName: attendee.name,
      attendeeEmail: attendee.email,
      attendeePhone: attendee.phone,
      qrCode: qrToken1,
      checkInStatus: 'PENDING',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      transactionId: `TXN-DEMO-${Date.now()}`,
      amount: firstTicket.price,
      paymentMethod: 'UPI',
      paymentStatus: 'SUCCESS',
      razorpayOrderId: 'order_demo_101',
      razorpayPaymentId: 'pay_demo_101',
    },
  });

  // Second booking for free event (College cultural fest)
  const freeEvent = createdEvents[4];
  const freeTicket = freeEvent.tickets[0];
  const bookingCode2 = `EE-2026-F9X4Z1`;

  const booking2 = await prisma.booking.create({
    data: {
      bookingId: bookingCode2,
      userId: attendee.id,
      eventId: freeEvent.id,
      ticketId: freeTicket.id,
      quantity: 2,
      totalAmount: 0,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
    },
  });

  const attendeeRecordId2 = crypto.randomUUID();
  const qrToken2 = generateTicketToken(attendeeRecordId2, freeEvent.id, booking2.id);

  await prisma.eventAttendee.create({
    data: {
      id: attendeeRecordId2,
      bookingId: booking2.id,
      userId: attendee.id,
      eventId: freeEvent.id,
      ticketId: freeTicket.id,
      attendeeName: 'Rahul Verma',
      attendeeEmail: 'attendee@eventease.com',
      attendeePhone: '+91 99112 87654',
      qrCode: qrToken2,
      checkInStatus: 'CHECKED_IN',
      checkedInAt: new Date(Date.now() - 3600000), // checked in 1 hour ago
    },
  });

  const attendeeRecordId3 = crypto.randomUUID();
  const qrToken3 = generateTicketToken(attendeeRecordId3, freeEvent.id, booking2.id);

  await prisma.eventAttendee.create({
    data: {
      id: attendeeRecordId3,
      bookingId: booking2.id,
      userId: attendee.id,
      eventId: freeEvent.id,
      ticketId: freeTicket.id,
      attendeeName: 'Sneha Sharma',
      attendeeEmail: 'sneha@example.com',
      attendeePhone: '+91 98765 00000',
      qrCode: qrToken3,
      checkInStatus: 'PENDING',
    },
  });

  // 5. Create Reviews
  await prisma.review.create({
    data: {
      userId: attendee.id,
      eventId: firstEvent.id,
      rating: 5,
      comment: 'Super organized conference with world-class speakers! Networking sessions were invaluable.',
    },
  });

  // 6. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: attendee.id,
        title: 'Booking Confirmed!',
        message: `Your booking for "${firstEvent.title}" is confirmed! View and download your QR ticket in My Tickets.`,
        type: 'BOOKING',
      },
      {
        userId: attendee.id,
        title: 'Event Reminder',
        message: `"${firstEvent.title}" is happening next month. Review venue directions and bring your QR ticket.`,
        type: 'REMINDER',
      },
      {
        userId: organizer.id,
        title: 'New Registration Received',
        message: 'A new attendee registered for Global AI & Machine Learning Conference 2026.',
        type: 'BOOKING',
      },
    ],
  });

  console.log('✅ Created sample bookings, tickets, QR tokens, payments, reviews, and notifications');
  console.log('\n🎉 Database seed finished successfully!');
  console.log('--------------------------------------------------');
  console.log('Demo Login Credentials:');
  console.log('👤 Attendee:  attendee@eventease.com  / Password123!');
  console.log('👔 Organizer: organizer@eventease.com / Password123!');
  console.log('🛡️ Admin:     admin@eventease.com     / Password123!');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
