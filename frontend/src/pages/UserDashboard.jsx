import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket as TicketIcon,
  Heart,
  Bell,
  User as UserIcon,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  ExternalLink,
  Lock,
  Camera,
  Download,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import EventCard from '../components/EventCard';

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const { user, updateUser } = useAuth();
  const { addToast } = useNotification();

  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, wishlistRes, notifsRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/events/wishlist'),
          api.get('/notifications'),
        ]);

        setBookings(bookingsRes.data.bookings || []);
        setWishlist(wishlistRes.data.wishlist || []);
        setNotifications(notifsRes.data.notifications || []);
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This will restore tickets.')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' }
            : b
        )
      );
      addToast('Booking cancelled successfully', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.put('/auth/profile', profileForm);
      updateUser(res.data.user);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmNewPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    try {
      setSavingPass(true);
      await api.put('/auth/password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      setPassForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      addToast('Password changed successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPass(false);
    }
  };

  // Stats computation
  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'CONFIRMED' && new Date(b.event.date) >= now
  );
  const completedBookings = bookings.filter(
    (b) => b.bookingStatus === 'CONFIRMED' && new Date(b.event.date) < now
  );
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === 'CANCELLED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Profile Greeting */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-500/20"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user?.email} • Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
            </p>
          </div>
        </div>

        <Link
          to="/events"
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-md transition-all hover:scale-105"
        >
          Discover New Events
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-2">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'events', label: 'My Bookings', icon: Calendar, badge: bookings.length },
          { id: 'tickets', label: 'My Tickets', icon: TicketIcon },
          { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlist.length },
          { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.isRead).length },
          { id: 'profile', label: 'Profile Settings', icon: UserIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {Boolean(tab.badge) && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-primary-100 dark:bg-primary-950 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: bookings.length, color: 'text-primary-600' },
              { label: 'Upcoming Events', value: upcomingBookings.length, color: 'text-indigo-600' },
              { label: 'Completed Events', value: completedBookings.length, color: 'text-emerald-600' },
              { label: 'Cancelled Bookings', value: cancelledBookings.length, color: 'text-rose-500' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <span className="text-xs font-semibold text-slate-400 block">{stat.label}</span>
                <span className={`text-2xl font-black mt-1 block ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Upcoming Event Alert */}
          {upcomingBookings.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-primary-900 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10">
                  Next Upcoming Event
                </span>
                <h3 className="text-xl font-bold">
                  {upcomingBookings[0].event.title}
                </h3>
                <p className="text-xs text-primary-200 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(upcomingBookings[0].event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {upcomingBookings[0].event.city}
                  </span>
                </p>
              </div>

              <Link
                to={`/tickets/${upcomingBookings[0].attendees?.[0]?.id || upcomingBookings[0].id}`}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all flex items-center gap-2 flex-shrink-0"
              >
                <TicketIcon className="w-4 h-4 text-primary-600" />
                <span>View QR Pass</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Bookings */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
              <p className="text-sm text-slate-400">You haven't booked any events yet.</p>
              <Link to="/events" className="text-xs font-bold text-primary-600 hover:underline">
                Explore exciting events now →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={b.event.image}
                      alt={b.event.title}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <span className="text-[11px] font-mono font-bold text-primary-600 block">
                        {b.bookingId}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {b.event.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(b.event.date).toLocaleDateString()} • {b.ticket?.name} (x{b.quantity})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      b.bookingStatus === 'CONFIRMED'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {b.bookingStatus}
                    </span>

                    {b.bookingStatus === 'CONFIRMED' && (
                      <>
                        <Link
                          to={`/tickets/${b.attendees?.[0]?.id || b.id}`}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 flex items-center gap-1.5"
                        >
                          <TicketIcon className="w-3.5 h-3.5" />
                          <span>View Ticket</span>
                        </Link>

                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {bookings.flatMap(b => b.attendees || []).length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No tickets found. When you register for events, your scannable digital passes appear here!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.filter(b => b.bookingStatus === 'CONFIRMED').flatMap(b => (b.attendees || []).map(att => ({ ...att, booking: b, event: b.event }))).map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
                        {t.ticket?.name || 'General Admission'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                        {t.event.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Attendee: <span className="font-semibold text-slate-700 dark:text-slate-300">{t.attendeeName}</span>
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.checkInStatus === 'CHECKED_IN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-primary-50 text-primary-700'
                    }`}>
                      {t.checkInStatus}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">
                      {t.booking.bookingId}
                    </span>
                    <Link
                      to={`/tickets/${t.id}`}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1.5 shadow-sm"
                    >
                      <TicketIcon className="w-3.5 h-3.5" />
                      <span>Print / QR Code</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              Your wishlist is empty. Tap the heart icon on any event to save it for later!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  initialSaved={true}
                  onWishlistToggle={(id, saved) => {
                    if (!saved) {
                      setWishlist(prev => prev.filter(e => e.id !== id));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3"
              >
                <Bell className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <form
            onSubmit={handleProfileSubmit}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Personal Details
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Change Password */}
          <form
            onSubmit={handlePasswordSubmit}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Security & Password
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passForm.confirmNewPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmNewPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-50"
            >
              {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
