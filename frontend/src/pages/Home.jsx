import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Compass,
  LayoutDashboard,
  Bell,
  Cpu,
  Music,
  Briefcase,
  GraduationCap,
  Palette,
  School,
  Trophy,
  CheckCircle2,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, isOrganizer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, upcRes, catRes] = await Promise.all([
          api.get('/events/featured'),
          api.get('/events?sort=upcoming&limit=6'),
          api.get('/events/categories'),
        ]);

        setFeaturedEvents(featRes.data.events || []);
        setUpcomingEvents(upcRes.data.events || []);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/events');
    }
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'technology': return Cpu;
      case 'music': return Music;
      case 'business': return Briefcase;
      case 'workshops': return GraduationCap;
      case 'cultural': return Palette;
      case 'college-events': return School;
      case 'sports': return Trophy;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-primary-500/20 via-indigo-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/80 text-primary-700 dark:text-primary-300 text-xs font-semibold mb-6 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>Next-Gen Event Management & Digital Ticketing</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Discover.{' '}
            <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
              Register.
            </span>{' '}
            Experience.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for unforgettable experiences. Discover tech summits, cultural fests, music concerts, and workshops with instant QR tickets and seamless booking.
          </p>

          {/* Search Bar Widget */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 sm:mt-10 max-w-2xl mx-auto p-2 rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2"
          >
            <div className="flex-1 flex items-center px-4 py-2">
              <Search className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by event title, speaker, city, or category..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl font-bold text-sm bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/events"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 shadow-md transition-all hover:scale-[1.02]"
            >
              Explore All Events
            </Link>
            <Link
              to={isOrganizer ? '/organizer?action=create' : '/register?role=ORGANIZER'}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all hover:scale-[1.02]"
            >
              Create an Event
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100K+</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Tickets Issued</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">1,500+</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Events Hosted</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">99.9%</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Check-in Reliability</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">4.9 ★</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Attendee Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Featured Events
            </h2>
          </div>
          <Link
            to="/events?sort=popular"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>View all featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Explore Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Browse by Passion & Interest
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            From tech hackathons to soulful music festivals, find events tailored to what you love.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            return (
              <Link
                key={cat.id}
                to={`/events?category=${cat.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary-500 transition-all flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {cat.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Mark Your Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Upcoming Events
            </h2>
          </div>
          <Link
            to="/events?sort=upcoming"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>See calendar schedule</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* Why Choose EventEase? */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 py-16 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              Why Organizers & Attendees Love EventEase
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Compass,
                title: 'Seamless Event Discovery',
                desc: 'Smart filtering by price, date, category, and online vs. in-person venue with real-time seat availability.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure Payments & UPI',
                desc: 'Integrated with Razorpay for instant UPI QR, debit/credit cards, net banking, and instant digital receipts.',
              },
              {
                icon: QrCode,
                title: 'Instant Digital QR Tickets',
                desc: 'Printable and mobile-ready passes with scannable QR tokens for swift, duplicate-proof gate check-ins.',
              },
              {
                icon: LayoutDashboard,
                title: 'Organizer Dashboard',
                desc: 'Real-time sales tracking, attendee rosters with CSV export, revenue charts, and event announcements.',
              },
              {
                icon: Bell,
                title: 'Live In-App Notifications',
                desc: 'Timely reminders for upcoming dates, booking confirmations, and direct organizer broadcast updates.',
              },
              {
                icon: Trophy,
                title: 'Role-Based Access Control',
                desc: 'Specialized portals for Attendees, Event Organizers, and Platform Admins with dedicated moderation tools.',
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/80 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action (Host an event) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-950 text-white p-8 sm:p-14 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-primary-200 backdrop-blur-md">
              Host With EventEase
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Have an event to organize?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Launch ticket sales in minutes. Leverage our verified QR check-in scanner, automated reminders, and detailed revenue analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <Link
              to={isOrganizer ? '/organizer?action=create' : '/register?role=ORGANIZER'}
              className="px-8 py-4 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 shadow-lg transition-all hover:scale-105 text-center"
            >
              Create Your Event Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-all text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
