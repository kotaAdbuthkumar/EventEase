import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket as TicketIcon,
  ShieldCheck,
  User,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import PaymentModal from '../components/PaymentModal';

export default function Checkout() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const ticketIdParam = searchParams.get('ticketId');
  const qtyParam = parseInt(searchParams.get('qty') || '1', 10);

  const { user, isAuthenticated } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(qtyParam);
  const [loading, setLoading] = useState(true);

  // Attendees list
  const [attendees, setAttendees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/checkout/${eventId}?ticketId=${ticketIdParam}&qty=${qtyParam}`);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/events/${eventId}`);
        const ev = res.data.event;
        setEvent(ev);

        const targetTicket = ev.tickets?.find((t) => t.id === ticketIdParam) || ev.tickets?.[0];
        setSelectedTicket(targetTicket);

        // Initialize attendee inputs
        const initialAttendees = Array.from({ length: quantity }, (_, idx) => ({
          name: idx === 0 ? user?.name || '' : '',
          email: idx === 0 ? user?.email || '' : '',
          phone: idx === 0 ? user?.phone || '' : '',
        }));
        setAttendees(initialAttendees);
      } catch (err) {
        console.error(err);
        addToast('Failed to load event for checkout', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, ticketIdParam, quantity, isAuthenticated, user, navigate, addToast]);

  const handleAttendeeChange = (index, field, value) => {
    setAttendees((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    // Validate that attendee names and emails are supplied
    for (let i = 0; i < attendees.length; i++) {
      if (!attendees[i].name?.trim() || !attendees[i].email?.trim()) {
        addToast(`Please fill in name and email for Attendee #${i + 1}`, 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bookings', {
        eventId: event.id,
        ticketId: selectedTicket.id,
        quantity,
        attendees,
      });

      const booking = res.data.booking;
      setCreatedBooking(booking);

      if (res.data.isFree) {
        // Free event registration is instantly confirmed!
        addToast('Registration confirmed successfully!', 'success');
        navigate(`/tickets/${res.data.attendees[0]?.id || booking.id}`);
      } else {
        // Open payment modal
        setShowPaymentModal(true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to initialize booking', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    setShowPaymentModal(false);
    addToast('Booking and payment confirmed!', 'success');
    navigate(`/dashboard?tab=tickets`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!event || !selectedTicket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p>Selected event or ticket tier is unavailable.</p>
        <Link to="/events" className="text-primary-600 font-bold mt-2 inline-block">
          Return to Events
        </Link>
      </div>
    );
  }

  const subtotal = selectedTicket.price * quantity;
  const isFree = subtotal === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/events/${event.slug || event.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Event Details</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
          {isFree ? 'Free Event Registration' : 'Complete Your Booking'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Attendee Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            {attendees.map((att, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <User className="w-4 h-4 text-primary-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Attendee #{idx + 1} ({selectedTicket.name})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={att.name}
                      onChange={(e) => handleAttendeeChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={att.email}
                      onChange={(e) => handleAttendeeChange(idx, 'email', e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Mobile / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={att.phone}
                      onChange={(e) => handleAttendeeChange(idx, 'phone', e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-xl shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Reserving Tickets...</span>
                </>
              ) : (
                <>
                  <span>{isFree ? 'Confirm Free Registration' : `Proceed to Payment (₹${subtotal.toLocaleString()})`}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Summary
            </h3>

            {/* Event snapshot */}
            <div className="flex gap-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                  {event.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {new Date(event.date).toLocaleDateString()} • {event.startTime}
                </p>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{selectedTicket.name} (x{quantity})</span>
                <span>{isFree ? 'FREE' : `₹${subtotal.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Convenience Fee</span>
                <span className="text-emerald-500 font-semibold">FREE (₹0)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span>{isFree ? 'FREE' : `₹${subtotal.toLocaleString()}`}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Free cancellation up to 24h before event</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {createdBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={createdBooking}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
