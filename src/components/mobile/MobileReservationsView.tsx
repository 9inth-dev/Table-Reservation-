import React, { useState } from 'react';
import { Reservation, User } from '../../types';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Receipt,
  RotateCcw,
  Sparkles,
  Phone,
  Info,
  ChevronLeft,
  CalendarCheck,
  X,
} from 'lucide-react';
import {
  cancelReservation,
  rescheduleReservation,
  simulateMerchantDecision,
} from '../../services/storage';

interface MobileReservationsViewProps {
  reservations: Reservation[];
  currentUser: User;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onExploreTables: () => void;
}

export const MobileReservationsView: React.FC<MobileReservationsViewProps> = ({
  reservations,
  currentUser,
  onRefresh,
  onShowToast,
  onExploreTables,
}) => {
  const [subTab, setSubTab] = useState<'active' | 'history'>('active');
  const [expandedFinancialResId, setExpandedFinancialResId] = useState<string | null>(null);
  const [cancelModalRes, setCancelModalRes] = useState<Reservation | null>(null);
  const [rescheduleModalRes, setRescheduleModalRes] = useState<Reservation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reschedule form state
  const [newRescheduleDate, setNewRescheduleDate] = useState<string>('');
  const [newRescheduleTime, setNewRescheduleTime] = useState<string>('19:30');
  const [newRescheduleParty, setNewRescheduleParty] = useState<number>(2);

  // Active includes Confirmed and Pending Confirmation
  const activeBookings = reservations.filter(
    (r) =>
      r.reservationStatus === 'CONFIRMED' ||
      r.reservationStatus === 'PENDING_CONFIRMATION' ||
      r.reservationStatus === 'SEATED'
  );

  // History includes Completed, Cancelled, Declined, Expired, No Show
  const historyBookings = reservations.filter(
    (r) =>
      r.reservationStatus === 'COMPLETED' ||
      r.reservationStatus === 'CANCELLED_BY_CUSTOMER' ||
      r.reservationStatus === 'CANCELLED_BY_MERCHANT' ||
      r.reservationStatus === 'DECLINED_BY_MERCHANT' ||
      r.reservationStatus === 'REQUEST_EXPIRED' ||
      r.reservationStatus === 'NO_SHOW'
  );

  const displayedBookings = subTab === 'active' ? activeBookings : historyBookings;

  const handleDownloadICS = (res: Reservation) => {
    const [year, month, day] = res.date.split('-').map(Number);
    const [hour, minute] = res.time.split(':').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    const endDate = new Date(Date.UTC(year, month - 1, day, hour + 2, minute));

    const formatDateToICS = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ABA Mobile//Table Reservation Agent//EN',
      'BEGIN:VEVENT',
      `UID:${res.id}@aba.com.kh`,
      `DTSTAMP:${formatDateToICS(new Date())}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `SUMMARY:Dinner at ${res.restaurantName} (${res.bookingReference})`,
      `DESCRIPTION:Table for ${res.partySize} at ${res.branchName}. Ref: ${res.bookingReference}.`,
      `LOCATION:${res.branchAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ABA_Booking_${res.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Calendar event downloaded (.ics)', 'info');
  };

  const handleConfirmCancel = () => {
    if (!cancelModalRes) return;
    setIsProcessing(true);
    try {
      const res = cancelReservation(cancelModalRes.id);
      if (res.success) {
        onShowToast(res.message, res.released ? 'info' : 'error');
        setCancelModalRes(null);
        onRefresh();
      } else {
        onShowToast(res.message, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRescheduleModal = (res: Reservation) => {
    setRescheduleModalRes(res);
    // default to tomorrow or next day
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    setNewRescheduleDate(nextDay.toISOString().split('T')[0]);
    setNewRescheduleTime(res.time);
    setNewRescheduleParty(res.partySize);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleModalRes) return;
    setIsProcessing(true);
    try {
      const result = rescheduleReservation({
        reservationId: rescheduleModalRes.id,
        newDate: newRescheduleDate,
        newTime: newRescheduleTime,
        newPartySize: newRescheduleParty,
      });

      if (result.success) {
        onShowToast(result.message, 'success');
        setRescheduleModalRes(null);
        onRefresh();
      } else {
        onShowToast(result.message, 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateDecision = (reservationId: string, action: 'ACCEPT' | 'DECLINE') => {
    const res = simulateMerchantDecision(reservationId, action);
    if (res) {
      if (action === 'ACCEPT') {
        onShowToast('Staff accepted request! Table is confirmed.', 'success');
      } else {
        onShowToast('Staff declined request. Table released.', 'info');
      }
      onRefresh();
    }
  };

  return (
    <div className="space-y-4 pb-12 bg-neutral-50 min-h-full">
      {/* Top Header with Back to Discover */}
      <header className="sticky top-0 z-30 bg-[#002b49] text-white px-4 py-2.5 flex items-center justify-between shadow-sm select-none">
        <button
          onClick={onExploreTables}
          className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <h1 className="text-sm font-bold tracking-tight text-white">
          My Bookings
        </h1>

        <div className="w-12 text-right">
          <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
            {activeBookings.length} Active
          </span>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Title & Description */}
        <div>
          <h2 className="font-bold text-neutral-900 text-lg">Manage Reservations</h2>
          <p className="text-xs text-neutral-500">
            View digital passes, hold statuses, rescheduling, and cancellation
          </p>
        </div>

        {/* Segmented Filter Bar */}
        <div className="flex bg-neutral-200/70 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('active')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'active'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Upcoming & Active ({activeBookings.length})
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'history'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Past & Cancelled ({historyBookings.length})
          </button>
        </div>

        {/* Empty State */}
        {displayedBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 text-sm">
                {subTab === 'active' ? 'No Upcoming Reservations' : 'No Reservation History'}
              </h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                {subTab === 'active'
                  ? 'Discover curated dining destinations across Cambodia and book directly with ABA Pay.'
                  : 'Past dining visits and cancelled bookings will appear here.'}
              </p>
            </div>
            {subTab === 'active' && (
              <button
                onClick={onExploreTables}
                className="px-4 py-2 rounded-xl bg-[#002b49] text-white text-xs font-semibold hover:bg-[#003860] transition-colors cursor-pointer"
              >
                Find a Table
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBookings.map((res) => {
              const isConfirmed = res.reservationStatus === 'CONFIRMED';
              const isPending = res.reservationStatus === 'PENDING_CONFIRMATION';
              const isFinancialExpanded = expandedFinancialResId === res.id;
              const canReschedule = (isConfirmed || isPending) && (res.rescheduledCount || 0) < 1;

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden p-4 space-y-3"
                >
                  {/* Card Header: Restaurant Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={res.restaurantImage}
                        alt={res.restaurantName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h3 className="font-serif font-bold text-neutral-900 text-base leading-tight">
                          {res.restaurantName}
                        </h3>
                        <p className="text-[11px] text-neutral-500">
                          {res.branchName} · {res.city}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Confirmed
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Staff Reviewing
                        </span>
                      ) : res.reservationStatus === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reservation Details Box */}
                  <div className="bg-neutral-50 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Date</span>
                      <span className="font-bold text-neutral-900">{res.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Time</span>
                      <span className="font-bold text-[#002b49] font-mono">{res.time}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase block">Guests</span>
                      <span className="font-bold text-neutral-900">{res.partySize} Diners</span>
                    </div>
                  </div>

                  {/* Diner & Reference Row */}
                  <div className="flex items-center justify-between text-[11px] text-neutral-600 pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-neutral-500">Diner:</span>
                      <span className="font-semibold text-neutral-900">{res.dinerName}</span>
                      {res.dinerType === 'SOMEONE_ELSE' && (
                        <span className="text-[9px] bg-neutral-100 px-1.5 py-0.2 rounded text-neutral-500">
                          Guest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-neutral-400">Ref:</span>
                      <span className="font-mono font-bold text-xs text-[#002b49] bg-neutral-100 px-1.5 py-0.2 rounded">
                        {res.bookingReference}
                      </span>
                    </div>
                  </div>

                  {/* Pending Request Notice & Interactive Staff Acceptance Simulation */}
                  {isPending && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 space-y-2">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-950">
                          <strong>Awaiting Venue Response:</strong> Staff has up to 1 hour to review and confirm your table request.
                        </div>
                      </div>

                      {/* Prototype simulation triggers to test merchant outcomes */}
                      <div className="pt-1 flex items-center justify-between gap-2 border-t border-amber-200/60">
                        <span className="text-[10px] font-mono text-amber-800">Test Staff Response:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSimulateDecision(res.id, 'ACCEPT')}
                            className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                            title="Simulate restaurant accepting request"
                          >
                            Simulate Accept
                          </button>
                          <button
                            onClick={() => handleSimulateDecision(res.id, 'DECLINE')}
                            className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                            title="Simulate restaurant declining request"
                          >
                            Simulate Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reservation Status Badge Card */}
                  <div className="border border-neutral-200 rounded-xl p-2.5 bg-neutral-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-semibold text-neutral-800">ABA Verified Reservation</span>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5">
                      {/* Cancel / Withdraw button */}
                      {(isConfirmed || isPending) && (
                        <button
                          onClick={() => setCancelModalRes(res)}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          {isPending ? 'Withdraw' : 'Cancel'}
                        </button>
                      )}

                      {/* Reschedule button (max 1 allowed, before reservation time) */}
                      {canReschedule && (
                        <button
                          onClick={() => handleOpenRescheduleModal(res)}
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-[#002b49] hover:bg-[#002b49]/5 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* Add to Calendar Button */}
                      {isConfirmed && (
                        <button
                          onClick={() => handleDownloadICS(res)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Calendar</span>
                        </button>
                      )}

                      {/* Call venue */}
                      <a
                        href={`tel:${res.branchPhone}`}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 text-xs hover:bg-neutral-50 font-medium"
                        title="Call restaurant"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalRes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#002b49]" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">Reschedule Table</h4>
                  <p className="text-[11px] text-neutral-500">{rescheduleModalRes.restaurantName}</p>
                </div>
              </div>
              <button
                onClick={() => setRescheduleModalRes(null)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-600 space-y-1">
                <div><strong>Current Slot:</strong> {rescheduleModalRes.date} at {rescheduleModalRes.time}</div>
                <div><strong>Branch:</strong> {rescheduleModalRes.branchName} (Branch remains unchanged)</div>
              </div>

              {/* Date Input */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider">
                  New Date
                </label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white text-neutral-900 focus:outline-none focus:ring-1.5 focus:ring-[#002b49]"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-1">
                <label className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider">
                  New Time Slot
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['12:00', '13:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewRescheduleTime(slot)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        newRescheduleTime === slot
                          ? 'bg-[#002b49] text-white border-[#002b49]'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reschedule Policy Rules */}
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1 leading-snug">
                <div>• Maximum <strong>1 reschedule</strong> permitted per reservation.</div>
                <div>• Must be requested at least <strong>2 hours</strong> before the new time.</div>
                <div>• Your reservation transfers directly to the new booking slot.</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={isProcessing}
                onClick={() => setRescheduleModalRes(null)}
                className="flex-1 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing || !newRescheduleDate || !newRescheduleTime}
                onClick={handleConfirmReschedule}
                className="flex-1 py-2 rounded-xl bg-[#002b49] text-white text-xs font-semibold hover:bg-[#003860] cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Updating...' : 'Confirm New Time'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalRes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2.5 text-rose-600 border-b border-neutral-100 pb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">
                  {cancelModalRes.reservationStatus === 'PENDING_CONFIRMATION'
                    ? 'Withdraw Table Request?'
                    : 'Cancel Reservation?'}
                </h4>
                <p className="text-[11px] text-neutral-500">Ref: {cancelModalRes.bookingReference}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
              <p>
                Are you sure you want to cancel your table at <strong>{cancelModalRes.restaurantName}</strong> on {cancelModalRes.date} at {cancelModalRes.time}?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950">
                <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours in advance.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={isProcessing}
                onClick={() => setCancelModalRes(null)}
                className="flex-1 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                disabled={isProcessing}
                onClick={handleConfirmCancel}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                {isProcessing ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
