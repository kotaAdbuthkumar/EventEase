-- EventEase Relational PostgreSQL Schema
-- Migration 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ATTENDEE',
    "profileImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT PRIMARY KEY,
    "organizerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL REFERENCES "Category"("id"),
    "image" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "streamUrl" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 100,
    "registrationDeadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ScheduleItem" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "speaker" TEXT,
    "time" TEXT NOT NULL,
    "description" TEXT
);

CREATE TABLE IF NOT EXISTS "Speaker" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT,
    "bio" TEXT,
    "avatar" TEXT
);

CREATE TABLE IF NOT EXISTS "Ticket" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "quantity" INTEGER NOT NULL DEFAULT 50,
    "availableQuantity" INTEGER NOT NULL DEFAULT 50,
    "saleStart" TIMESTAMP(3),
    "saleEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT PRIMARY KEY,
    "bookingId" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "ticketId" TEXT NOT NULL REFERENCES "Ticket"("id"),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PAID',
    "bookingStatus" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "EventAttendee" (
    "id" TEXT PRIMARY KEY,
    "bookingId" TEXT NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "ticketId" TEXT NOT NULL REFERENCES "Ticket"("id"),
    "attendeeName" TEXT NOT NULL,
    "attendeeEmail" TEXT NOT NULL,
    "attendeePhone" TEXT,
    "qrCode" TEXT UNIQUE NOT NULL,
    "checkInStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT PRIMARY KEY,
    "bookingId" TEXT UNIQUE NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
    "transactionId" TEXT UNIQUE NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'UPI',
    "paymentStatus" TEXT NOT NULL DEFAULT 'SUCCESS',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "eventId" TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_event_wishlist" UNIQUE ("userId", "eventId")
);
