import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  LayoutDashboard,
  Calendar,
  DollarSign,
  Users,
  Ticket,
  PlusCircle,
  Scan,
  Download,
  Send,
  Trash2,
  Edit,
  ExternalLink,
  Search,
  CheckCircle,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import QRScannerModal from '../components/QRScannerModal';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function OrganizerDashboard() {
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get('action');

  const { user } = useAuth();
  const { addToast } = useNotification();

  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalAttendees: 0,
    upcomingEvents: 0,
  });

  const [charts, setCharts] = useState({
    eventPerformance: [],
    ticketTiers: [],
    monthlyRevenue: [],
  });

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(initialAction === 'create');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerEventId, setScannerEventId] = useState(null);

  // Attendees Drawer State
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);
  const [attendeesSummary, setAttendeesSummary] = useState({ total: 0, checkedIn: 0, remaining: 0 });
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [attendeeFilter, setAttendeeFilter] = useState('all');
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  // Announcement Modal State
  const [announcementEvent, setAnnouncementEvent] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '' });
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Create Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    image: '',
    date: '',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    venue: '',
    address: '',
    city: '',
    isOnline: false,
    capacity: 100,
    tickets: [
      { name: 'General Admission', type: 'GENERAL', price: 0, quantity: 100 },
    ],
  });
  const [creatingEvent, setCreatingEvent] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, eventsRes, catRes] = await Promise.all([
        api.get('/organizer/stats'),
        api.get('/organizer/analytics'),
        api.get('/organizer/events'),
        api.get('/events/categories'),
      ]);

      setStats(statsRes.data.stats || {});
      setCharts(chartsRes.data || {});
      setEvents(eventsRes.data.events || []);
      setCategories(catRes.data.categories || []);

      if (catRes.data.categories?.length > 0 && !eventForm.categoryId) {
        setEventForm((prev) => ({ ...prev, categoryId: catRes.data.categories[0].id }));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load organizer dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTicketTier = () => {
    setEventForm((prev) => ({
      ...prev,
      tickets: [
        ...prev.tickets,
        { name: 'VIP Pass', type: 'VIP', price: 999, quantity: 50 },
      ],
    }));
  };

  const handleRemoveTicketTier = (idx) => {
    setEventForm((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((_, i) => i !== idx),
    }));
  };

  const handleTicketChange = (idx, field, value) => {
    setEventForm((prev) => {
      const copy = [...prev.tickets];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, tickets: copy };
    });
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreatingEvent(true);
      await api.post('/events', eventForm);
      addToast('Event published successfully!', 'success');
      setShowCreateModal(false);
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create event', 'error');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action is irreversible.')) {
      return;
    }
    try {
      await api.delete(`/events/${id}`);
      addToast('Event deleted successfully', 'info');
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      addToast('Failed to delete event', 'error');
    }
  };

  // Open Attendees Management Drawer
  const openAttendeesDrawer = async (ev) => {
    setSelectedEventForAttendees(ev);
    try {
      setLoadingAttendees(true);
      const res = await api.get(`/organizer/events/${ev.id}/attendees`);
      setAttendeesList(res.data.attendees || []);
      setAttendeesSummary(res.data.summary || {});
    } catch (err) {
      addToast('Failed to load attendees', 'error');
    } finally {
      setLoadingAttendees(false);
    }
  };

  const handleExportCSV = (eventId) => {
    window.open(`/api/organizer/events/${eventId}/export-csv`, '_blank');
  };

  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementEvent) return;

    try {
      setSendingAnnouncement(true);
      const res = await api.post(`/organizer/events/${announcementEvent.id}/announcement`, announcementForm);
      addToast(res.data.message, 'success');
      setAnnouncementEvent(null);
      setAnnouncementForm({ title: '', message: '' });
    } catch (err) {
      addToast('Failed to broadcast announcement', 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const filteredAttendees = attendeesList.filter((att) => {
    const matchesFilter =
      attendeeFilter === 'all' || att.checkInStatus === attendeeFilter.toUpperCase();
    const q = attendeeSearch.toLowerCase();
    const matchesSearch =
      !q ||
      att.attendeeName.toLowerCase().includes(q) ||
      att.attendeeEmail.toLowerCase().includes(q) ||
      att.booking.bookingId.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            Organizer Headquarters
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Event Management Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setScannerEventId(null);
              setShowScannerModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md hover:opacity-90 transition-all hover:scale-105"
          >
            <Scan className="w-4 h-4 text-emerald-500" />
            <span>Gate QR Scanner</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/25 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Host New Event</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-primary-600' },
          { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Tickets Sold', value: stats.totalTicketsSold, icon: Ticket, color: 'text-indigo-600' },
          { label: 'Total Attendees', value: stats.totalAttendees, icon: Users, color: 'text-purple-600' },
          { label: 'Upcoming Events', value: stats.upcomingEvents, icon: Clock, color: 'text-amber-500' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">{s.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue & Registrations Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Revenue & Registrations Trend
            </h3>
            <span className="text-[11px] text-slate-400">2026 Overview</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="registrations" name="Tickets" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Tiers Distribution Pie */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Ticket Tier Distribution
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.ticketTiers || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                  label
                >
                  {(charts.ticketTiers || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Events Management Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Your Hosted Events ({events.length})
          </h3>
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400 space-y-3">
            <p>You haven't created any events yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white"
            >
              Host your first event now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-y border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Registrations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={ev.image}
                          alt={ev.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                            {ev.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{ev.venue}, {ev.city}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                      {new Date(ev.date).toLocaleDateString()}
                      <span className="block text-[11px] text-slate-400">{ev.startTime}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-300">
                        {ev.category?.name}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {ev._count?.attendees || 0} attendees
                    </td>

                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ev.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAttendeesDrawer(ev)}
                          title="Manage Attendees & Check-in"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setScannerEventId(ev.id);
                            setShowScannerModal(true);
                          }}
                          title="Scan Tickets for this Event"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <Scan className="w-4 h-4 text-emerald-500" />
                        </button>

                        <button
                          onClick={() => {
                            setAnnouncementEvent(ev);
                          }}
                          title="Send Announcement"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          title="Delete Event"
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Host New Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Create a New Event</h3>
                <p className="text-xs text-primary-100">Set up details, tickets, and launch ticket sales</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g. NextGen AI Summit 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Category *
                    </label>
                    <select
                      value={eventForm.categoryId}
                      onChange={(e) => setEventForm({ ...eventForm, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Start Time
                    </label>
                    <input
                      type="text"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      placeholder="09:00 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      placeholder="05:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Banner Image URL
                  </label>
                  <input
                    type="url"
                    value={eventForm.image}
                    onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      placeholder="e.g. Grand Convention Hall"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={eventForm.city}
                      onChange={(e) => setEventForm({ ...eventForm, city: e.target.value })}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Full Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Provide event overview, topics covered, target audience..."
                    className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Ticket Tiers Builder */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Ticket Tiers
                    </span>
                    <button
                      type="button"
                      onClick={handleCreateTicketTier}
                      className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  {eventForm.tickets.map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-2 items-center">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block">Tier Name</label>
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => handleTicketChange(idx, 'name', e.target.value)}
                          className="w-full p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Price (₹)</label>
                        <input
                          type="number"
                          value={t.price}
                          onChange={(e) => handleTicketChange(idx, 'price', e.target.value)}
                          className="w-full p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 block">Quantity</label>
                          <input
                            type="number"
                            value={t.quantity}
                            onChange={(e) => handleTicketChange(idx, 'quantity', e.target.value)}
                            className="w-full p-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border"
                          />
                        </div>
                        {eventForm.tickets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTicketTier(idx)}
                            className="mt-4 p-1 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingEvent}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white shadow-md disabled:opacity-50"
                >
                  {creatingEvent ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendee Management Drawer / Modal */}
      {selectedEventForAttendees && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Attendee Roster</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedEventForAttendees.title}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExportCSV(selectedEventForAttendees.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedEventForAttendees(null)}
                  className="p-1 rounded-full text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Check-in summary bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-medium">
              <div className="flex gap-6">
                <span>Total: <strong className="text-slate-900 dark:text-white">{attendeesSummary.total}</strong></span>
                <span>Checked-In: <strong className="text-emerald-600">{attendeesSummary.checkedIn}</strong></span>
                <span>Remaining: <strong className="text-primary-600">{attendeesSummary.remaining}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  placeholder="Search name, email, booking..."
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border outline-none"
                />
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingAttendees ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading roster...</div>
              ) : filteredAttendees.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No attendees match your filter.</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Booking ID</th>
                      <th className="py-2.5 px-3">Attendee Name</th>
                      <th className="py-2.5 px-3">Email & Phone</th>
                      <th className="py-2.5 px-3">Tier</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAttendees.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-primary-600">
                          {att.booking.bookingId}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {att.attendeeName}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {att.attendeeEmail}
                          {att.attendeePhone && <span className="block text-[10px]">{att.attendeePhone}</span>}
                        </td>
                        <td className="py-3 px-3">{att.ticket?.name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            att.checkInStatus === 'CHECKED_IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {att.checkInStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {announcementEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Broadcast Announcement</h3>
                <p className="text-xs text-primary-100">{announcementEvent.title}</p>
              </div>
              <button
                onClick={() => setAnnouncementEvent(null)}
                className="p-1 rounded-full text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. Schedule Update or Venue Entry Instructions"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  placeholder="Type your broadcast message to registered attendees..."
                  className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingAnnouncement}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingAnnouncement ? 'Broadcasting...' : 'Broadcast to Attendees'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        eventId={scannerEventId}
        onCheckInSuccess={(att) => {
          addToast(`Checked in: ${att.name}`, 'success');
          fetchDashboardData();
        }}
      />
    </div>
  );
}
