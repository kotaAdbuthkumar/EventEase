import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Heart, Users, Star, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function EventCard({ event, initialSaved = false, onWishlistToggle }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useNotification();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please log in to save events to your wishlist', 'info');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/events/wishlist', { eventId: event.id });
      setSaved(res.data.saved);
      addToast(res.data.message, 'success');
      if (onWishlistToggle) onWishlistToggle(event.id, res.data.saved);
    } catch (err) {
      addToast('Failed to update wishlist', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const minPrice = event.minPrice ?? (event.tickets?.length ? Math.min(...event.tickets.map(t => t.price)) : 0);
  const isFree = minPrice === 0;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-primary-500/40 dark:hover:border-primary-500/40 transition-all duration-300">
      {/* Image Container with Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 backdrop-blur-md shadow-sm">
            {event.category?.name || 'Event'}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={saving}
          aria-label="Save to Wishlist"
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            saved
              ? 'bg-rose-500 text-white'
              : 'bg-black/30 text-white hover:bg-white hover:text-rose-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-tight shadow-md ${
            isFree
              ? 'bg-emerald-500 text-white'
              : 'bg-primary-600 text-white'
          }`}>
            {isFree ? 'FREE' : `₹${minPrice.toLocaleString()}`}
          </span>
        </div>

        {/* Rating if present */}
        {event.averageRating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{event.averageRating}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex-1 flex flex-col p-5">
        {/* Date and Time */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate} • {event.startTime}</span>
        </div>

        {/* Title */}
        <Link to={`/events/${event.slug || event.id}`} className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-2 leading-snug">
            {event.title}
          </h3>
        </Link>

        {/* Venue / Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          <span className="truncate">
            {event.isOnline ? 'Online Interactive Webinar' : `${event.venue}, ${event.city}`}
          </span>
        </div>

        {/* Footer meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{event.capacity ? `${event.capacity} seats` : 'Open Seats'}</span>
          </div>

          <Link
            to={`/events/${event.slug || event.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
