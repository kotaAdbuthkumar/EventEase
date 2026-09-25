# EventEase - Modern Full-Stack Event Management & Ticketing Platform

> **Discover. Register. Experience.**
> EventEase is an enterprise-grade, modern, full-stack event management and digital ticketing application featuring multi-role access (Attendee, Event Organizer, Admin), QR code passes, live gate check-in scanning, Razorpay checkout simulation, and comprehensive analytics.

---

## 🌟 Key Highlights & Features

### 1. Multi-Role Architecture
* **Attendee**: Browse events with live filters, register for free events or purchase paid tickets, view boarding-pass digital tickets with scannable QR codes, print tickets, wishlist events, submit reviews, and manage notifications.
* **Organizer**: Complete dashboard with revenue/registration charts, host new events with tiered tickets and schedules, manage attendees, export CSV rosters, broadcast announcements, and verify attendee tickets with a camera/manual QR scanner.
* **Administrator**: Platform-wide moderation, approve/reject/delete events, toggle featured status, monitor users and suspend/unblock accounts, manage event categories, and review revenue trends.

### 2. Digital Ticketing & Gate Check-In
* **Unique Cryptographic QR Token**: Each issued ticket includes a verifiable QR code payload encoding attendee, event, and booking metadata.
* **Gate Check-In Scanner**: Built-in webcam QR scanner and manual token validator that marks attendees as `CHECKED_IN`, prevents duplicate entries, and checks event boundaries.
* **Printable Passes**: Boarding-pass styled ticket with barcode, perforated edge, venue directions, and print stylesheets.

### 3. Payment System
* **Razorpay Architecture**: Integrated with Razorpay order creation and HMAC-SHA256 signature verification.
* **Seamless Sandbox Simulator**: Built-in test simulator that operates automatically if live keys are not configured, enabling smooth 1-click test purchases across UPI, Cards, NetBanking, and Wallets.

### 4. Zero-Friction 1-Click Demo Accounts
The login screen includes 1-click demo buttons to switch instantly between all 3 personas:
| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Attendee** | `attendee@eventease.com` | `Password123!` | Bookings, Digital Tickets, Wishlist, Reviews |
| **Organizer** | `organizer@eventease.com` | `Password123!` | Event Creator, Attendees CSV, Announcements, QR Scanner |
| **Admin** | `admin@eventease.com` | `Password123!` | Platform Moderation, User Suspension, Event Approvals |

---

## 🛠️ Tech Stack

* **Frontend**:
  * React 19 + Vite
  * Tailwind CSS (with Dark Mode support)
  * React Router v7
  * Lucide React icons
  * Recharts (Metrics & Trends visualization)
  * Html5-Qrcode (Live camera QR scanning)
  * Canvas-Confetti (Celebration effects)
  * Axios API Client
* **Backend**:
  * Node.js + Express.js (ES Modules)
  * JWT (JSON Web Tokens) & bcryptjs
  * QR Code Generator (`qrcode`)
  * Express Rate Limit & Helmet
  * Razorpay SDK
* **Database & ORM**:
  * **Prisma ORM**
  * Configured with **SQLite** by default (`file:./dev.db`) for zero-installation, out-of-the-box local execution.
  * Fully compatible with **PostgreSQL** (migration SQL included in `database/migrations/001_initial_schema.sql`).

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18+ or v22+)
* **npm** (v9+)

### Step 1: Install Dependencies
From the project root:
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Database Setup & Seed
From the `backend/` directory:
```bash
# Push schema to SQLite database and generate Prisma Client
npx prisma db push

# Seed realistic events, categories, and test accounts
node prisma/seed.js
```

### Step 3: Run the Application

In Terminal 1 (Start Backend Server):
```bash
cd backend
npm start
# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

In Terminal 2 (Start Frontend Client):
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

Open **`http://localhost:5173`** in your browser!

---

## 🗄️ Switching to PostgreSQL (Optional)

If you have a PostgreSQL server running locally or on cloud providers (Supabase, Neon, AWS RDS):
1. In `backend/.env`, update:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/eventease?schema=public"
   ```
2. In `backend/prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npx prisma db push` and `node prisma/seed.js`.
4. Alternatively, execute the raw SQL migration in `database/migrations/001_initial_schema.sql`.

---

## 📡 API Endpoints Overview

### Authentication
* `POST /api/auth/register` - Create account (Attendee or Organizer)
* `POST /api/auth/login` - Authenticate user
* `POST /api/auth/demo-login` - Instant 1-click demo login
* `GET  /api/auth/me` - Current profile
* `PUT  /api/auth/profile` - Update profile info
* `PUT  /api/auth/password` - Change password

### Events
* `GET    /api/events` - Filtered & paginated event discovery
* `GET    /api/events/featured` - Handpicked featured events
* `GET    /api/events/categories` - Category list with event counts
* `GET    /api/events/:id` - Full event details, schedule & speakers
* `POST   /api/events` - Host new event (Organizer/Admin)
* `PUT    /api/events/:id` - Edit event details (Organizer/Admin)
* `DELETE /api/events/:id` - Delete event (Organizer/Admin)
* `POST   /api/events/:id/reviews` - Post attendee review
* `POST   /api/events/wishlist` - Toggle saved event

### Bookings & Tickets
* `POST   /api/bookings` - Reserve tickets & create booking
* `GET    /api/bookings` - User's booking history
* `GET    /api/bookings/:id` - Booking details
* `DELETE /api/bookings/:id` - Cancel booking & restore tickets
* `GET    /api/tickets/:id` - Fetch digital ticket & QR code image
* `POST   /api/tickets/verify` - Organizer gate check-in & verification

### Payments
* `POST /api/payments/create-order` - Create Razorpay order
* `POST /api/payments/verify` - Verify signature & confirm payment
* `POST /api/payments/mock-checkout` - Sandbox instant payment

### Organizer & Admin
* `GET  /api/organizer/stats` - Organizer KPI metrics
* `GET  /api/organizer/analytics` - Sales & registration charts
* `GET  /api/organizer/events` - Organizer's hosted events
* `GET  /api/organizer/events/:id/attendees` - Attendee roster
* `GET  /api/organizer/events/:id/export-csv` - Download attendee CSV
* `POST /api/organizer/events/:id/announcement` - Broadcast message
* `GET  /api/admin/stats` - Platform health stats
* `GET  /api/admin/users` - User management & status toggle
* `PUT  /api/admin/events/:id/status` - Event approval & featured toggle

---

## 📄 License & Author

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**Author & Copyright**:  
© 2026 **Kota Adbuth Kumar**. All rights reserved.
