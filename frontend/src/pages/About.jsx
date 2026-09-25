import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  QrCode,
  Zap,
  Globe,
  Award,
  Layers,
  Code,
  Database,
  Lock,
} from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Event Management Platform of 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
          Reinventing How the World Gathers & Experiences Live Events
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          EventEase bridges event creators, organizers, and attendees through modern digital ticketing, instant gate check-ins with QR technology, transparent analytics, and frictionless registration.
        </p>
      </div>

      {/* Tech Stack Specs */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Layers className="w-6 h-6 text-primary-500" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Full-Stack Architecture & Engineering
            </h2>
            <p className="text-xs text-slate-400">High-performance production specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary-600">
              <Code className="w-4 h-4" />
              <span>Frontend Architecture</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              React 19, Vite, Tailwind CSS, Lucide Icons, Recharts interactive data visualization, Canvas Confetti, and HTML5 QR code scanning.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-600">
              <Zap className="w-4 h-4" />
              <span>Backend & Security</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Node.js, Express, JWT session tokens, bcrypt password hashing, role-based authorization guard, rate-limiting, and Helmet headers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-600">
              <Database className="w-4 h-4" />
              <span>Relational Database</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Prisma ORM with normalized relational models, atomic transactions for stock decrement, and cross-platform SQLite/PostgreSQL support.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: ShieldCheck,
            title: 'Bulletproof Verification',
            desc: 'Every ticket features a unique cryptographic token payload rendered as high-res QR codes to eliminate fraud.',
          },
          {
            icon: Globe,
            title: 'Accessible Anywhere',
            desc: 'Full responsive support across mobile devices, tablets, and wide desktop displays with instant light/dark theme toggle.',
          },
          {
            icon: Award,
            title: 'Organizer Autonomy',
            desc: 'Full control over ticket tiers, real-time check-in stats, attendee rosters, CSV export, and instant broadcast messaging.',
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
