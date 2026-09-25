import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Heart, Mail, Phone, MapPin, Globe, MessageCircle, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
                EventEase
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              The premier modern event management and ticketing platform. Discover vibrant tech conferences, music festivals, college fests, and workshops — with seamless registration and QR check-in.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#global" aria-label="Website" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#community" aria-label="Community" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#share" aria-label="Share" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/events" className="hover:text-primary-600 transition-colors">All Events</Link>
              </li>
              <li>
                <Link to="/events?type=online" className="hover:text-primary-600 transition-colors">Online Webinars</Link>
              </li>
              <li>
                <Link to="/events?type=in-person" className="hover:text-primary-600 transition-colors">In-Person Summits</Link>
              </li>
              <li>
                <Link to="/events?sort=popular" className="hover:text-primary-600 transition-colors">Featured & Trending</Link>
              </li>
            </ul>
          </div>

          {/* Organizers & Host */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              For Organizers
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/organizer" className="hover:text-primary-600 transition-colors">Organizer Hub</Link>
              </li>
              <li>
                <Link to="/organizer?action=create" className="hover:text-primary-600 transition-colors">Publish an Event</Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-primary-600 transition-colors">QR Ticket Scanner</Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-primary-600 transition-colors">Attendee Management</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500" />
                <span>support@eventease.io</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500" />
                <span>+91 (080) 4567-8900</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 EventEase Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#terms" className="hover:underline">Terms of Service</a>
            <a href="#security" className="hover:underline">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
