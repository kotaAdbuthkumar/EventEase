import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket as TicketIcon,
  Printer,
  Download,
  CheckCircle,
  Share2,
} from 'lucide-react';

export default function DigitalTicket({ ticketData }) {
  if (!ticketData) return null;

  const {
    attendeeName,
    attendeeEmail,
    ticket,
    event,
    booking,
    qrCodeImage,
    checkInStatus,
  } = ticketData;

  const eventDate = new Date(event?.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top action toolbar (Hidden when printing) */}
      <div className="flex items-center justify-between no-print">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verified Admission Pass
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Digital Ticket
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Pass Card (Target of print stylesheet) */}
      <div className="printable-ticket-area bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row relative">
        {/* Left Side: Event & Attendee Details */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-slate-300 dark:border-slate-700">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300">
                {ticket?.name || 'General Admission'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                checkInStatus === 'CHECKED_IN'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
              }`}>
                <CheckCircle className="w-3 h-3" />
                {checkInStatus === 'CHECKED_IN' ? 'Checked-In' : 'Confirmed'}
              </span>
            </div>

            {/* Event Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">
              {event?.title}
            </h1>

            {/* Event Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-primary-500 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {eventDate}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-primary-500 mt-0.5" />
                <div>
                  <span className="text-slate-400 block font-medium">Time</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {event?.startTime} - {event?.endTime}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-400 block font-medium">Venue & Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {event?.isOnline ? 'Online Live Stream' : `${event?.venue}, ${event?.address}, ${event?.city}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee & Booking Reference Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Attendee</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {attendeeName}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">{attendeeEmail}</span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Booking ID</span>
              <span className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                {booking?.bookingId}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: QR Code Stub */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/40 p-6 flex flex-col items-center justify-center text-center relative">
          {/* Half circle cuts on top/bottom for ticket look */}
          <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800" />

          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700">
            {qrCodeImage ? (
              <img
                src={qrCodeImage}
                alt="Ticket QR Code"
                className="w-36 h-36 object-contain"
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-[11px] font-medium text-slate-500 mt-3">
            Present this QR code at the entrance for instant check-in.
          </p>

          <span className="mt-2 text-[10px] font-mono text-slate-400 tracking-wider">
            TOKEN: {ticketData.qrCode?.substring(0, 16)}...
          </span>
        </div>
      </div>
    </div>
  );
}
