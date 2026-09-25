import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  User,
  Briefcase,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = await login(email, password);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate(redirectPath);
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    try {
      setLoading(true);
      const user = await demoLogin(role);
      addToast(`Logged in as Demo ${role}!`, 'success');
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'ORGANIZER') navigate('/organizer');
      else navigate('/dashboard');
    } catch (err) {
      addToast('Demo login failed. Make sure database is seeded.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
              EventEase
            </span>
          </Link>
          <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your digital tickets, manage bookings, or host events.
          </p>
        </div>

        {/* 1-Click Fast Demo Switcher Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-950/40 dark:to-indigo-950/40 border border-primary-200 dark:border-primary-800/60 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-700 dark:text-primary-300">
            <Sparkles className="w-4 h-4 text-primary-600 animate-pulse" />
            <span>Instant Demo Logins (No typing required)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ATTENDEE')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary-500 flex flex-col items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-primary-600" />
              <span>Attendee</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ORGANIZER')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-indigo-500 flex flex-col items-center gap-1"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Organizer</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200 dark:border-slate-800 hover:border-rose-500 flex flex-col items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <form
          onSubmit={handleLoginSubmit}
          className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5"
        >
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a href="#forgot" className="text-[11px] text-primary-600 hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:underline">
              Create one for free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
