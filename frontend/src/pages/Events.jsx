import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Calendar,
  DollarSign,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [eventType, setEventType] = useState(searchParams.get('type') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'upcoming');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Data
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    api.get('/events/categories')
      .then((res) => setCategories(res.data.categories || []))
      .catch((err) => console.error(err));
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const qSearch = searchParams.get('search') || '';
    const qCat = searchParams.get('category') || 'all';
    const qType = searchParams.get('type') || 'all';
    const qSort = searchParams.get('sort') || 'upcoming';
    const qPage = parseInt(searchParams.get('page') || '1', 10);

    setSearch(qSearch);
    setCategory(qCat);
    setEventType(qType);
    setSort(qSort);
    setPage(qPage);
  }, [searchParams]);

  // Fetch events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category && category !== 'all') params.append('category', category);
        if (eventType && eventType !== 'all') params.append('type', eventType);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (sort) params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', '9');

        const res = await api.get(`/events?${params.toString()}`);
        setEvents(res.data.events || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [search, category, eventType, startDate, endDate, sort, page]);

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val && val !== 'all') {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('all');
    setEventType('all');
    setStartDate('');
    setEndDate('');
    setSort('upcoming');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Explore Events
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Discover handpicked tech conferences, indie concerts, educational workshops, and hackathons.
        </p>
      </div>

      {/* Search & Mobile Filter Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParam('search', search)}
            placeholder="Search events by title, city, or organizer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-primary-500" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-primary-500 shadow-sm"
            >
              <option value="upcoming">Upcoming Date</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-500" />
                Filters
              </span>
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Category
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => updateParam('category', 'all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    category === 'all'
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category', c.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      category === c.slug
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c._count?.events || ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Event Type Filter (Online vs In-person) */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Format
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                {['all', 'in-person', 'online'].map((t) => (
                  <button
                    key={t}
                    onClick={() => updateParam('type', t)}
                    className={`py-1.5 rounded-lg capitalize transition-all ${
                      eventType === t
                        ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t === 'in-person' ? 'Venue' : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    updateParam('startDate', e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="lg:hidden col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Filter Options</span>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-500 mx-auto flex items-center justify-center">
                <Search className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No matching events found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Try adjusting your keywords, broadening the category, or clearing filters.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary-600 text-white hover:bg-primary-700"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="pt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateParam('page', (page - 1).toString())}
                    disabled={page <= 1}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-3">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
                  </span>

                  <button
                    onClick={() => updateParam('page', (page + 1).toString())}
                    disabled={page >= pagination.totalPages}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
