import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Shield,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Trash2,
  Lock,
  Unlock,
  Tag,
  PlusCircle,
  Search,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'events' | 'categories'
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({ categoryDistribution: [], growthTrends: [] });
  const [usersList, setUsersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, chartsRes, usersRes, eventsRes, catRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/charts'),
        api.get('/admin/users'),
        api.get('/admin/events'),
        api.get('/events/categories'),
      ]);

      setStats(statsRes.data.stats || {});
      setCharts(chartsRes.data || {});
      setUsersList(usersRes.data.users || []);
      setEventsList(eventsRes.data.events || []);
      setCategoriesList(catRes.data.categories || []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load admin moderation console', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      addToast(`User status changed to ${newStatus}`, 'info');
    } catch (err) {
      addToast('Failed to update user status', 'error');
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      await api.put(`/admin/events/${eventId}/status`, { status: newStatus });
      setEventsList((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: newStatus } : e))
      );
      addToast(`Event marked as ${newStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update event status', 'error');
    }
  };

  const handleToggleEventFeatured = async (eventId, currentFeatured) => {
    try {
      await api.put(`/admin/events/${eventId}/status`, { featured: !currentFeatured });
      setEventsList((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, featured: !currentFeatured } : e))
      );
      addToast('Featured status updated', 'success');
    } catch (err) {
      addToast('Failed to update featured status', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setCreatingCat(true);
      const res = await api.post('/admin/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
      });
      setCategoriesList((prev) => [...prev, res.data.category]);
      setNewCatName('');
      setNewCatDesc('');
      addToast('Category created successfully!', 'success');
    } catch (err) {
      addToast('Failed to create category', 'error');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      setCategoriesList((prev) => prev.filter((c) => c.id !== id));
      addToast('Category deleted', 'info');
    } catch (err) {
      addToast('Failed to delete category', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Platform Moderation & Analytics
          </h1>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Registered Users', value: stats.totalUsers || 0, color: 'text-primary-600' },
          { label: 'Organizers', value: stats.totalOrganizers || 0, color: 'text-indigo-600' },
          { label: 'Total Events', value: stats.totalEvents || 0, color: 'text-purple-600' },
          { label: 'Active Events', value: stats.activeEvents || 0, color: 'text-emerald-600' },
          { label: 'Pending Approval', value: stats.pendingEvents || 0, color: 'text-amber-500' },
          { label: 'Platform Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-rose-600' },
        ].map((s, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <span className="text-[11px] font-semibold text-slate-400 block">{s.label}</span>
            <span className={`text-xl font-black mt-1 block ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        {[
          { id: 'overview', label: 'Platform Overview' },
          { id: 'events', label: `Events Moderation (${eventsList.length})` },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'categories', label: `Categories (${categoriesList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Growth Charts */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Platform Growth Trends
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.growthTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="quarter" stroke="#888888" fontSize={11} />
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
                  <Line type="monotone" dataKey="users" name="Active Users" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="events" name="Events Published" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Events by Category
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution || []}
                    dataKey="events"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {(charts.categoryDistribution || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Events Moderation Table */}
      {activeTab === 'events' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-y">
                <tr>
                  <th className="py-3 px-3">Event</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Featured</th>
                  <th className="py-3 px-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {eventsList.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {ev.title}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{ev.organizer?.name}</td>
                    <td className="py-3 px-3">{ev.category?.name}</td>
                    <td className="py-3 px-3">{new Date(ev.date).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleEventFeatured(ev.id, ev.featured)}
                        className={`p-1 rounded ${ev.featured ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        <Star className={`w-4 h-4 ${ev.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {ev.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateEventStatus(ev.id, 'APPROVED')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white"
                          >
                            Approve
                          </button>
                        )}
                        {ev.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateEventStatus(ev.id, 'REJECTED')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-600 text-white"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Management Table */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold border-y">
                <tr>
                  <th className="py-3 px-3">User Details</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold">{u.role}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend User' : 'Unblock User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Categories Management */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Add New Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Comedy & Improv"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <button
                type="submit"
                disabled={creatingCat}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-primary-600 text-white disabled:opacity-50"
              >
                {creatingCat ? 'Adding...' : 'Create Category'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Existing Event Categories
            </h3>
            <div className="space-y-2">
              {categoriesList.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400">{cat.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
