import React from 'react';
import { Ticket, Plus, Minus, Check, AlertCircle } from 'lucide-react';

export default function TicketSelector({
  tickets = [],
  selectedTicket,
  onSelectTicket,
  quantity,
  onQuantityChange,
  onProceed,
  disabled = false,
}) {
  if (!tickets || tickets.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center">
        <p className="text-sm text-slate-500">Tickets are not yet configured for this event.</p>
      </div>
    );
  }

  const activeTicket = selectedTicket || tickets[0];
  const totalPrice = (activeTicket?.price || 0) * quantity;
  const isFree = (activeTicket?.price || 0) === 0;

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        {tickets.map((t) => {
          const isSelected = activeTicket?.id === t.id;
          const isSoldOut = t.availableQuantity <= 0;

          return (
            <div
              key={t.id}
              onClick={() => !isSoldOut && onSelectTicket(t)}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                isSoldOut
                  ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  : isSelected
                  ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/30 shadow-md ring-2 ring-primary-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {t.name}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isSoldOut ? (
                        <span className="text-rose-500 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Sold Out
                        </span>
                      ) : (
                        <span>{t.availableQuantity} seats remaining</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    {t.price === 0 ? 'FREE' : `₹${t.price.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quantity Stepper */}
      {activeTicket && activeTicket.availableQuantity > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Quantity
            </span>
            <span className="text-[11px] text-slate-400">Max 10 tickets per order</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(Math.min(Math.min(10, activeTicket.availableQuantity), quantity + 1))}
              disabled={quantity >= Math.min(10, activeTicket.availableQuantity)}
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Order Summary & Button */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Total ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            {isFree ? 'FREE' : `₹${totalPrice.toLocaleString()}`}
          </span>
        </div>

        <button
          onClick={onProceed}
          disabled={disabled || !activeTicket || activeTicket.availableQuantity <= 0}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span>{isFree ? 'Register For Free' : 'Proceed to Checkout'}</span>
        </button>
      </div>
    </div>
  );
}
