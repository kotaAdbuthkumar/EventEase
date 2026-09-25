import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Ticket as TicketIcon } from 'lucide-react';
import api from '../services/api';
import DigitalTicket from '../components/DigitalTicket';

export default function TicketView() {
  const { id } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tickets/${id}`);
        setTicketData(res.data.ticket);
      } catch (err) {
        console.error(err);
        setError('Ticket could not be found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-80 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto">
          <TicketIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">{error || 'Ticket not found'}</h2>
        <Link
          to="/dashboard?tab=tickets"
          className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-primary-600 text-white"
        >
          Go to My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="no-print">
        <Link
          to="/dashboard?tab=tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>
      </div>

      <DigitalTicket ticketData={ticketData} />
    </div>
  );
}
