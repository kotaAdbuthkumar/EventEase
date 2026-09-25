import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket as TicketIcon,
  Heart,
  Share2,
  Star,
  CheckCircle,
  ExternalLink,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import TicketSelector from '../components/TicketSelector';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotification();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ticket selection state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
        setRelatedEvents(res.data.relatedEvents || []);
        if (res.data.event?.tickets?.length > 0) {
          setSelectedTicket(res.data.event.tickets[0]);
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        addToast('Event not found or failed to load', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, addToast]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      addToast('Please sign in or register to complete your booking', 'info');
      navigate(`/login?redirect=/checkout/${event.id}?ticketId=${selectedTicket.id}&qty=${quantity}`);
      return;
    }

    navigate(`/checkout/${event.id}?ticketId=${selectedTicket.id}&qty=${quantity}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out ${event.title} on EventEase!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Event link copied to clipboard!', 'success');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please log in to submit a review', 'info');
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await api.post(`/events/${event.id}/reviews`, {
        eventId: event.id,
        rating: newRating,
        comment: newComment.trim(),
      });

      setEvent((prev) => ({
        ...prev,
        reviews: [res.data.review, ...(prev.reviews || [])],
        reviewCount: (prev.reviewCount || 0) + 1,
      }));
      setNewComment('');
      addToast('Review posted successfully!', 'success');
    } catch (err) {
      addToast('Failed to post review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <Link to="/events" className="mt-4 inline-block text-primary-600 font-semibold">
          Return to Events Discovery →
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-12 pb-20">
      {/* Top Banner & Breadcrumb */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        {/* Banner image with overlay */}
        <div className="absolute inset-0">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover opacity-30 blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pb-24">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/events" className="hover:text-white transition-colors">Events</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white truncate max-w-xs">{event.title}</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-600 text-white">
                {event.category?.name}
              </span>
              {event.isOnline ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Virtual Live Stream
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 backdrop-blur-md">
                  In-Person Venue
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Quick Meta */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-400" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                <span>{event.startTime} - {event.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>{event.isOnline ? 'Online' : `${event.venue}, ${event.city}`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Cols: Details, Schedule, Speakers, Venue */}
          <div className="lg:col-span-2 space-y-10">
            {/* High-res Banner display */}
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-[16/9] bg-slate-100 dark:bg-slate-800">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Event Description */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                About This Event
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </section>

            {/* Schedule Timeline */}
            {event.schedule?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Event Schedule
                </h2>
                <div className="space-y-3">
                  {event.schedule.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4"
                    >
                      <div className="px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-xs font-bold whitespace-nowrap">
                        {item.time}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        {item.speaker && (
                          <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-0.5">
                            Speaker: {item.speaker}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Speakers List */}
            {event.speakers?.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Keynote Speakers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((sp) => (
                    <div
                      key={sp.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
                    >
                      <img
                        src={sp.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sp.name}`}
                        alt={sp.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary-500/20"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {sp.name}
                        </h4>
                        <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                          {sp.role}
                        </p>
                        {sp.company && (
                          <p className="text-[11px] text-slate-400">{sp.company}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Venue & Location Map Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Location & Venue
              </h2>
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {event.venue}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {event.address}, {event.city}, {event.state || ''} {event.country}
                    </p>
                  </div>
                </div>

                {/* Simulated Interactive Map Card */}
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border flex items-center justify-center text-center p-4">
                  <div className="space-y-2">
                    <MapPin className="w-8 h-8 text-rose-500 mx-auto animate-bounce" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {event.venue}, {event.city}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue}, ${event.city}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Organizer Info */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Hosted by
              </h2>
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <img
                  src={event.organizer?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${event.organizer?.name}`}
                  alt={event.organizer?.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/20"
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {event.organizer?.name}
                  </h4>
                  <p className="text-xs text-slate-500">Verified Event Organizer</p>
                  {event.organizer?.email && (
                    <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{event.organizer.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Attendee Reviews
                  </h2>
                  <p className="text-xs text-slate-500">
                    {event.reviewCount || 0} reviews • {event.averageRating ? `${event.averageRating} out of 5 stars` : 'No ratings yet'}
                  </p>
                </div>
              </div>

              {/* Review submit form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Leave your review
                  </h4>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your experience or expectation about this event..."
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview || !newComment.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-500">
                  <Link to="/login" className="text-primary-600 font-semibold underline">
                    Log in
                  </Link>{' '}
                  to leave a review for this event.
                </p>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {event.reviews?.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {r.user?.name || 'Verified Attendee'}
                      </span>
                      <div className="flex items-center text-amber-400 text-xs">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {r.comment}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Col: Ticket Booking Sidebar Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Select Admission Tier
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Book Your Passes
                </h3>
              </div>

              {/* Interactive Ticket Selector */}
              <TicketSelector
                tickets={event.tickets}
                selectedTicket={selectedTicket}
                onSelectTicket={setSelectedTicket}
                quantity={quantity}
                onQuantityChange={setQuantity}
                onProceed={handleProceedToCheckout}
              />

              {/* Secondary Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Event</span>
                </button>

                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Safe Pass</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Events Carousel / Grid */}
        {relatedEvents.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((re) => (
                <EventCard key={re.id} event={re} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
