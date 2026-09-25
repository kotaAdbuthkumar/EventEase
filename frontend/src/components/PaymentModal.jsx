import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Building,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) {
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Dummy form inputs for cards
  const [cardDetails, setCardDetails] = useState({
    number: '4242 •••• •••• 4242',
    name: 'Rahul Verma',
    expiry: '12/28',
    cvv: '888',
  });

  if (!isOpen || !booking) return null;

  const handleTriggerPayment = async (method = selectedMethod) => {
    try {
      setProcessing(true);
      setError(null);

      // Call payment simulation endpoint
      const res = await api.post('/payments/mock-checkout', {
        bookingId: booking.id,
        paymentMethod: method,
      });

      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });

        onSuccess(res.data);
      } else {
        setError(res.data.message || 'Payment verification failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-primary-600 to-indigo-600 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <h3 className="font-bold text-lg">Secure Payment Gateway</h3>
            </div>
            <p className="text-xs text-primary-100 mt-0.5">
              Razorpay Test & Sandbox Simulation Sandbox
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Amount Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Booking Reference
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {booking.bookingId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Amount Payable
              </span>
              <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                ₹{booking.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">
              Select Payment Method
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'NETBANKING', label: 'NetBanking', icon: Building },
                { id: 'WALLET', label: 'Wallet', icon: Wallet },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method Details simulation */}
          {selectedMethod === 'UPI' && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center text-center space-y-3">
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-md flex items-center justify-center border">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=eventease@okaxis&pn=EventEase&am=${booking.totalAmount}&cu=INR`}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-slate-500">
                Scan using Google Pay, PhonePe, Paytm, or BHIM app
              </p>
            </div>
          )}

          {selectedMethod === 'CARD' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Card Number</label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Expires</label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">CVV</label>
                  <input
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'NETBANKING' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                <div key={b} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{b}</span>
                </div>
              ))}
            </div>
          )}

          {selectedMethod === 'WALLET' && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Paytm Wallet', 'Amazon Pay', 'Mobikwik', 'PhonePe Wallet'].map((w) => (
                <div key={w} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-500" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-2">
            <button
              onClick={() => handleTriggerPayment()}
              disabled={processing}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing with Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Pay ₹{booking.totalAmount.toLocaleString()}</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-bit SSL encrypted • Instant ticket issuance</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
