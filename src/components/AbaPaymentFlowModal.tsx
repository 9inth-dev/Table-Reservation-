import React, { useState, useEffect } from 'react';
import { Restaurant, Branch, User, Reservation } from '../types';
import {
  Check,
  MapPin,
  Calendar,
  Clock,
  Users,
  Copy,
  Store,
  Smile,
  QrCode,
  Download,
  ArrowRight,
  ChevronLeft,
  Ticket,
} from 'lucide-react';
import { createNewReservation } from '../services/storage';

interface AbaPaymentFlowModalProps {
  restaurant: Restaurant;
  branch: Branch;
  date: string;
  time: string;
  partySize: number;
  seatingArea: string;
  contactPhone: string;
  specialRequests?: string;
  currentUser: User;
  amountUsd?: number;
  onCancel: () => void;
  onSuccess: (reservation: Reservation) => void;
  onViewMyBookings: () => void;
  onDownloadICS: (reservation: Reservation) => void;
}

type PaymentScreen = 'CONFIRM' | 'PIN' | 'LOADING' | 'DONE' | 'SUCCESS';

export const AbaPaymentFlowModal: React.FC<AbaPaymentFlowModalProps> = ({
  restaurant,
  branch,
  date,
  time,
  partySize,
  seatingArea,
  contactPhone,
  specialRequests,
  currentUser,
  amountUsd = 2.0,
  onCancel,
  onSuccess,
  onViewMyBookings,
  onDownloadICS,
}) => {
  const [currentScreen, setCurrentScreen] = useState<PaymentScreen>('CONFIRM');
  const [pin, setPin] = useState<string>('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Check if restaurant requires manual confirmation / booking acceptance
  const isManualConfirmation =
    restaurant.confirmationMethod === 'TELEGRAM_REQUEST' ||
    Boolean(restaurant.requiresManualConfirmation) ||
    restaurant.confirmationMethod !== 'INSTANT';

  // Format date for ticket: e.g. "Mon, 27 Oct 2026"
  const formattedDate = React.useMemo(() => {
    try {
      const [y, m, d] = date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return date;
    }
  }, [date]);

  // Format time window: e.g. "7:00 PM - 9:00 PM (120 minutes)"
  const formattedTimeWindow = React.useMemo(() => {
    try {
      const [hStr, mStr] = time.split(':');
      const h = parseInt(hStr, 10);
      const m = parseInt(mStr || '0', 10);
      const formatHour = (hour: number, min: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        const displayMin = min === 0 ? '00' : min < 10 ? `0${min}` : `${min}`;
        return `${displayHour}:${displayMin} ${period}`;
      };
      const startFormatted = formatHour(h, m);
      const endFormatted = formatHour((h + 2) % 24, m);
      return `${startFormatted} - ${endFormatted} (120 minutes)`;
    } catch {
      return `${time} (120 minutes)`;
    }
  }, [time]);

  // Handle PIN button press
  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      // Completed 4-digit PIN, advance to loading
      setTimeout(() => {
        setCurrentScreen('LOADING');
      }, 200);
    }
  };

  const handleClearPin = () => {
    setPin('');
  };

  const handleBackspacePin = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Keyboard navigation support
  useEffect(() => {
    if (currentScreen !== 'PIN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspacePin();
      } else if (e.key === 'Escape') {
        setCurrentScreen('CONFIRM');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen, pin]);

  // Handle LOADING state: create real reservation and transition to DONE
  useEffect(() => {
    if (currentScreen !== 'LOADING') return;

    // Create reservation in persistent storage
    let newRes: Reservation | null = null;
    try {
      newRes = createNewReservation({
        restaurant,
        branch,
        date,
        time,
        partySize,
        seatingArea,
        dinerType: 'SELF',
        dinerName: currentUser.name,
        dinerPhone: contactPhone.trim() || currentUser.phone,
        specialRequests: specialRequests?.trim() || undefined,
      });
      setReservation(newRes);
    } catch (err) {
      console.error('Error creating reservation:', err);
    }

    // Keep loading animation for 1.6s
    const timer = setTimeout(() => {
      setCurrentScreen('DONE');
    }, 1600);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  // Handle DONE state: show for 1.2s then transition to SUCCESS
  useEffect(() => {
    if (currentScreen !== 'DONE') return;

    const timer = setTimeout(() => {
      setCurrentScreen('SUCCESS');
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md overflow-hidden transition-colors duration-200 flex flex-col ${
          currentScreen === 'SUCCESS'
            ? 'bg-[#f4f7f6] rounded-t-3xl sm:rounded-2xl max-h-[94vh] shadow-2xl'
            : currentScreen === 'DONE'
            ? 'bg-white rounded-t-3xl sm:rounded-2xl min-h-[580px] justify-center items-center shadow-2xl'
            : 'bg-[#103546] text-white rounded-t-3xl sm:rounded-2xl min-h-[620px] shadow-2xl'
        }`}
      >
        {/* ========================================================= */}
        {/* SCREEN 1: DARK BLUE PAYMENT CONFIRMATION PROMPT           */}
        {/* ========================================================= */}
        {currentScreen === 'CONFIRM' && (
          <div className="flex flex-col justify-between h-full min-h-[600px] p-6 pt-3 animate-in fade-in duration-150">
            {/* Top iOS Status Bar Simulator */}
            <div className="flex items-center justify-between text-white text-xs font-semibold px-1 pt-1 pb-3">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="w-0.5 h-1 bg-white rounded-full" />
                  <div className="w-0.5 h-1.5 bg-white rounded-full" />
                  <div className="w-0.5 h-2 bg-white rounded-full" />
                  <div className="w-0.5 h-2.5 bg-white rounded-full" />
                </div>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.32c3.55 0 6.78 1.34 9.25 3.55L12 19.33 2.75 10.87C5.22 8.66 8.45 7.32 12 7.32z" />
                </svg>
                <div className="w-5 h-2.5 rounded-sm border border-white p-0.5 flex items-center">
                  <div className="h-full w-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Sub-header: Cancel button */}
            <div className="flex items-center justify-start py-2">
              <button
                type="button"
                onClick={onCancel}
                className="text-white text-base font-normal hover:opacity-80 transition-opacity cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* Center Content: Merchant Badge & Amount */}
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
              {/* Circular Logo Badge */}
              <div className="w-22 h-22 rounded-full bg-[#e9f1dc] p-1.5 shadow-md flex items-center justify-center overflow-hidden mb-6 border border-white/20">
                {restaurant.heroImage ? (
                  <img
                    src={restaurant.heroImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1c6758] flex items-center justify-center text-white text-xl font-bold font-serif">
                    {restaurant.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Sub-text */}
              <p className="text-white/80 text-[15px] font-normal tracking-wide">
                You are about to pay
              </p>

              {/* Amount */}
              <div className="flex items-baseline justify-center gap-1.5 mt-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {amountUsd.toFixed(2)}
                </span>
                <span className="text-lg font-bold text-white tracking-wide">USD</span>
              </div>

              {/* Divider with "to" */}
              <div className="flex items-center w-64 max-w-xs mx-auto my-6">
                <div className="flex-1 h-px bg-white/20" />
                <span className="px-3 text-white/70 text-sm font-normal">to</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Merchant Name */}
              <h2 className="text-2xl font-bold text-white tracking-tight px-4 max-w-sm leading-snug">
                {restaurant.name}
              </h2>
            </div>

            {/* Bottom Actions */}
            <div className="w-full pt-4 pb-2 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setPin('');
                  setCurrentScreen('PIN');
                }}
                className="w-full py-4 rounded-2xl bg-[#e54b42] hover:bg-[#d63f36] active:scale-[0.99] text-white font-bold text-base tracking-wider uppercase shadow-lg transition-all cursor-pointer flex items-center justify-center"
              >
                CONFIRM
              </button>

              {/* iOS Home Indicator */}
              <div className="w-32 h-1 bg-white/60 rounded-full mx-auto" />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: DARK BLUE PIN KEYPAD SCREEN                     */}
        {/* ========================================================= */}
        {currentScreen === 'PIN' && (
          <div className="flex flex-col justify-between h-full min-h-[620px] p-6 pt-3 animate-in fade-in duration-150">
            {/* Top iOS Status Bar Simulator */}
            <div className="flex items-center justify-between text-white text-xs font-semibold px-1 pt-1 pb-2">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="w-0.5 h-1 bg-white rounded-full" />
                  <div className="w-0.5 h-1.5 bg-white rounded-full" />
                  <div className="w-0.5 h-2 bg-white rounded-full" />
                  <div className="w-0.5 h-2.5 bg-white rounded-full" />
                </div>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.32c3.55 0 6.78 1.34 9.25 3.55L12 19.33 2.75 10.87C5.22 8.66 8.45 7.32 12 7.32z" />
                </svg>
                <div className="w-5 h-2.5 rounded-sm border border-white p-0.5 flex items-center">
                  <div className="h-full w-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Sub-header: Back button */}
            <div className="flex items-center justify-start py-1">
              <button
                type="button"
                onClick={() => setCurrentScreen('CONFIRM')}
                className="text-white text-base font-normal hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1"
              >
                <span>Back</span>
              </button>
            </div>

            {/* Merchant info summary */}
            <div className="flex flex-col items-center text-center mt-1">
              {/* Circular Logo Badge */}
              <div className="w-16 h-16 rounded-full bg-[#e9f1dc] p-1 shadow-md flex items-center justify-center overflow-hidden mb-2 border border-white/20">
                {restaurant.heroImage ? (
                  <img
                    src={restaurant.heroImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1c6758] flex items-center justify-center text-white text-base font-bold font-serif">
                    {restaurant.name.charAt(0)}
                  </div>
                )}
              </div>

              <p className="text-white/80 text-xs font-normal">You are about to pay</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {amountUsd.toFixed(2)}{' '}
                <span className="text-sm font-semibold">USD</span>
              </p>
              <p className="text-xs text-white/90 mt-0.5">
                to <span className="font-bold text-white">{restaurant.name}</span>
              </p>
            </div>

            {/* 4 PIN Dots */}
            <div className="flex items-center justify-center gap-4 my-4">
              {[0, 1, 2, 3].map((idx) => {
                const isFilled = idx < pin.length;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-150 ${
                      isFilled
                        ? 'bg-white shadow-sm scale-110'
                        : 'bg-white/25 border border-white/40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Circular Keypad 3x4 */}
            <div className="w-full max-w-[280px] mx-auto grid grid-cols-3 gap-y-3.5 gap-x-5 py-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinDigit(digit)}
                  className="w-16 h-16 rounded-full border border-white/45 text-white text-2xl font-light hover:border-white hover:bg-white/10 active:bg-white/25 flex items-center justify-center transition-all cursor-pointer select-none mx-auto active:scale-95 shadow-2xs"
                >
                  {digit}
                </button>
              ))}

              {/* Bottom Row: C, 0, Backspace */}
              <button
                type="button"
                onClick={handleClearPin}
                className="w-16 h-16 rounded-full text-[#00c5c8] text-2xl font-normal hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all cursor-pointer select-none mx-auto"
                title="Clear"
              >
                C
              </button>

              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="w-16 h-16 rounded-full border border-white/45 text-white text-2xl font-light hover:border-white hover:bg-white/10 active:bg-white/25 flex items-center justify-center transition-all cursor-pointer select-none mx-auto active:scale-95 shadow-2xs"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspacePin}
                className="w-16 h-16 rounded-full text-[#00c5c8] hover:bg-white/10 active:scale-90 flex items-center justify-center transition-all cursor-pointer select-none mx-auto"
                title="Backspace"
              >
                {/* Custom Crisp Backspace Icon Matching ABA Cyan Box */}
                <div className="w-7 h-5 rounded-sm bg-[#00c5c8] text-[#103546] flex items-center justify-center">
                  <span className="font-bold text-xs leading-none">✕</span>
                </div>
              </button>
            </div>

            {/* iOS Home Indicator */}
            <div className="w-32 h-1 bg-white/60 rounded-full mx-auto mt-2" />
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: DARK BLUE PROCESSING / EQUALIZER ANIMATION      */}
        {/* ========================================================= */}
        {currentScreen === 'LOADING' && (
          <div className="relative flex flex-col justify-between h-full min-h-[620px] p-6 pt-3 overflow-hidden animate-in fade-in duration-200">
            {/* Top iOS Status Bar Simulator */}
            <div className="flex items-center justify-between text-white text-xs font-semibold px-1 pt-1 pb-2">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="w-0.5 h-1 bg-white rounded-full" />
                  <div className="w-0.5 h-1.5 bg-white rounded-full" />
                  <div className="w-0.5 h-2 bg-white rounded-full" />
                  <div className="w-0.5 h-2.5 bg-white rounded-full" />
                </div>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.32c3.55 0 6.78 1.34 9.25 3.55L12 19.33 2.75 10.87C5.22 8.66 8.45 7.32 12 7.32z" />
                </svg>
                <div className="w-5 h-2.5 rounded-sm border border-white p-0.5 flex items-center">
                  <div className="h-full w-full bg-white rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Sub-header */}
            <div className="flex items-center justify-start py-1 opacity-70">
              <span className="text-white text-base font-normal">Back</span>
            </div>

            {/* Center Merchant Info */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-18 h-18 rounded-full bg-[#e9f1dc] p-1.5 shadow-md flex items-center justify-center overflow-hidden mb-3 border border-white/20">
                {restaurant.heroImage ? (
                  <img
                    src={restaurant.heroImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#1c6758] flex items-center justify-center text-white text-xl font-bold font-serif">
                    {restaurant.name.charAt(0)}
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{restaurant.name}</h2>
            </div>

            {/* Animated Cyan Pulsing Equalizer Dot Columns */}
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3 py-6">
                {/* Column 1 */}
                <div className="flex flex-col items-center gap-1.5 animate-pulse" style={{ animationDuration: '0.9s' }}>
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/50" />
                </div>

                {/* Column 2 */}
                <div className="flex flex-col items-center gap-1.5 animate-pulse" style={{ animationDuration: '0.7s', animationDelay: '0.15s' }}>
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/60" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/30" />
                </div>

                {/* Column 3 - Center Highest */}
                <div className="flex flex-col items-center gap-1.5 animate-pulse" style={{ animationDuration: '1.1s', animationDelay: '0.3s' }}>
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_8px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_8px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_8px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_8px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_8px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/70" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/40" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/20" />
                </div>

                {/* Column 4 */}
                <div className="flex flex-col items-center gap-1.5 animate-pulse" style={{ animationDuration: '0.8s', animationDelay: '0.2s' }}>
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/60" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/30" />
                </div>

                {/* Column 5 */}
                <div className="flex flex-col items-center gap-1.5 animate-pulse" style={{ animationDuration: '0.95s', animationDelay: '0.4s' }}>
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8] shadow-[0_0_6px_#00c5c8]" />
                  <div className="w-2 h-2 rounded-full bg-[#00c5c8]/50" />
                </div>
              </div>
            </div>

            {/* Bottom Glow ABA Pay Coin Emblem */}
            <div className="relative flex justify-center items-end -mb-10">
              <div className="w-48 h-48 rounded-full border-4 border-[#00c5c8]/40 bg-[#143f54]/90 flex items-center justify-center shadow-[0_0_50px_rgba(0,197,200,0.35)]">
                <div className="w-36 h-36 rounded-full border-2 border-[#00c5c8] flex items-center justify-center text-[#00c5c8] text-5xl font-black">
                  $
                </div>
              </div>
            </div>

            {/* iOS Home Indicator */}
            <div className="w-32 h-1 bg-white/60 rounded-full mx-auto relative z-10" />
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: CLEAN WHITE "DONE" SCREEN                       */}
        {/* ========================================================= */}
        {currentScreen === 'DONE' && (
          <div className="flex flex-col justify-between h-full min-h-[580px] w-full p-6 pt-3 animate-in fade-in duration-200">
            {/* Top iOS Status Bar Simulator (Dark) */}
            <div className="flex items-center justify-between text-neutral-900 text-xs font-semibold px-1 pt-1 pb-3">
              <span>9:41</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="w-0.5 h-1 bg-neutral-900 rounded-full" />
                  <div className="w-0.5 h-1.5 bg-neutral-900 rounded-full" />
                  <div className="w-0.5 h-2 bg-neutral-900 rounded-full" />
                  <div className="w-0.5 h-2.5 bg-neutral-900 rounded-full" />
                </div>
                <svg className="w-3.5 h-3.5 fill-neutral-900" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.32c3.55 0 6.78 1.34 9.25 3.55L12 19.33 2.75 10.87C5.22 8.66 8.45 7.32 12 7.32z" />
                </svg>
                <div className="w-5 h-2.5 rounded-sm border border-neutral-900 p-0.5 flex items-center">
                  <div className="h-full w-full bg-neutral-900 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Center Done Badge */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-22 h-22 rounded-full bg-[#22c55e] flex items-center justify-center shadow-lg animate-in zoom-in-75 duration-200">
                <Check className="w-12 h-12 text-white stroke-[3.5]" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mt-5 tracking-tight">Done</h1>
            </div>

            {/* iOS Home Indicator */}
            <div className="w-32 h-1 bg-neutral-400 rounded-full mx-auto" />
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 5: SUCCESS TICKET & BREAKDOWN                      */}
        {/* ========================================================= */}
        {currentScreen === 'SUCCESS' && (
          <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-5 text-neutral-900 animate-in fade-in duration-200">
            {/* Top iOS Status Bar Simulator & Dynamic Island */}
            <div className="relative flex items-center justify-between text-neutral-900 text-xs font-semibold px-2 pt-0 pb-3 shrink-0">
              <span>9:41</span>
              {/* Dynamic Island Simulation */}
              <div className="w-28 h-6 bg-black rounded-full mx-auto shadow-xs" />
              <div className="flex items-center gap-1.5 opacity-90">
                <div className="flex items-end gap-0.5 h-2.5">
                  <div className="w-0.5 h-1 bg-neutral-900 rounded-full" />
                  <div className="w-0.5 h-1.5 bg-neutral-900 rounded-full" />
                  <div className="w-0.5 h-2 bg-neutral-900 rounded-full" />
                  <div className="w-0.5 h-2.5 bg-neutral-900 rounded-full" />
                </div>
                <svg className="w-3.5 h-3.5 fill-neutral-900" viewBox="0 0 24 24">
                  <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.32c3.55 0 6.78 1.34 9.25 3.55L12 19.33 2.75 10.87C5.22 8.66 8.45 7.32 12 7.32z" />
                </svg>
                <div className="w-5 h-2.5 rounded-sm border border-neutral-900 p-0.5 flex items-center">
                  <div className="h-full w-full bg-neutral-900 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Success Header Badge */}
            <div className="text-center pt-1 pb-3 shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center mx-auto shadow-md">
                <Check className="w-9 h-9 text-white stroke-[3.5]" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mt-2 tracking-tight">Success</h2>

              {/* Conditional manual confirmation awaiting status */}
              {isManualConfirmation && (
                <div className="mt-2.5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                  <h3 className="text-base sm:text-[17px] font-bold text-neutral-900 tracking-tight">
                    Awaiting store confirmation ([15min])
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-[290px] sm:max-w-[320px] mx-auto leading-relaxed">
                    We are currently waiting for the restaurant to accept your booking then we will update you
                  </p>
                </div>
              )}
            </div>

            {/* Ticket Card with Scalloped Side Cutouts */}
            <div className="relative bg-white rounded-3xl p-5 shadow-sm border border-neutral-100/90 text-left space-y-4">
              {/* Left Cutout */}
              <div className="absolute top-[136px] -left-3.5 w-7 h-7 rounded-full bg-[#f4f7f6] border-r border-neutral-200/80 pointer-events-none" />
              {/* Right Cutout */}
              <div className="absolute top-[136px] -right-3.5 w-7 h-7 rounded-full bg-[#f4f7f6] border-l border-neutral-200/80 pointer-events-none" />

              {/* Top Merchant Brand & Title */}
              <div className="text-center pt-1">
                <div className="w-14 h-14 rounded-full bg-[#edf6eb] border border-[#d2ecd0] p-1 mx-auto flex items-center justify-center overflow-hidden">
                  {restaurant.heroImage ? (
                    <img
                      src={restaurant.heroImage}
                      alt={restaurant.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#1c6758] flex items-center justify-center text-white text-base font-bold font-serif">
                      {restaurant.name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-500 font-medium mt-2">{restaurant.name}</p>
                <h3 className="font-bold text-base text-neutral-900 mt-0.5">
                  Table Reservation for {partySize} Guests
                </h3>
              </div>

              {/* Dashed Ticket Divider */}
              <div className="border-b border-dashed border-neutral-200 my-2" />

              {/* Booking Details Section */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-neutral-900">Booking details</h4>

                <div className="space-y-2 text-xs text-neutral-700">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-neutral-800">
                      {branch.name} — {branch.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Schedule on {formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{formattedTimeWindow}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>
                      {partySize} Diners ({seatingArea})
                    </span>
                  </div>

                  {/* Booking Code with Copy */}
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span className="font-mono font-bold text-neutral-900 tracking-wider">
                      {reservation?.bookingReference || 'AB-84920'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCode(reservation?.bookingReference || 'AB-84920')
                      }
                      className="text-teal-700 hover:text-teal-900 p-0.5 rounded cursor-pointer"
                      title="Copy Booking Reference"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {copiedCode && (
                      <span className="text-[10px] text-teal-700 font-semibold animate-in fade-in">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* How to Redeem Section */}
              <div className="pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900 mb-2">How to redeem</h4>

                <div className="flex items-center justify-between gap-3">
                  {/* Left 3 Steps */}
                  <div className="space-y-2 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>Visit restaurant.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>Show QR to redeem.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smile className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>Enjoy the service!</span>
                    </div>
                  </div>

                  {/* Right Authentic QR Code SVG */}
                  <div className="shrink-0 p-1.5 bg-white border border-neutral-200 rounded-xl shadow-2xs">
                    <svg
                      className="w-20 h-20"
                      viewBox="0 0 100 100"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Top-Left Finder */}
                      <rect x="5" y="5" width="28" height="28" fill="#111827" rx="3" />
                      <rect x="9" y="9" width="20" height="20" fill="white" rx="1.5" />
                      <rect x="13" y="13" width="12" height="12" fill="#111827" rx="1" />

                      {/* Top-Right Finder */}
                      <rect x="67" y="5" width="28" height="28" fill="#111827" rx="3" />
                      <rect x="71" y="9" width="20" height="20" fill="white" rx="1.5" />
                      <rect x="75" y="13" width="12" height="12" fill="#111827" rx="1" />

                      {/* Bottom-Left Finder */}
                      <rect x="5" y="67" width="28" height="28" fill="#111827" rx="3" />
                      <rect x="9" y="71" width="20" height="20" fill="white" rx="1.5" />
                      <rect x="13" y="75" width="12" height="12" fill="#111827" rx="1" />

                      {/* QR Data Matrix Bits */}
                      <rect x="38" y="8" width="5" height="5" fill="#111827" />
                      <rect x="48" y="8" width="5" height="5" fill="#111827" />
                      <rect x="58" y="8" width="5" height="5" fill="#111827" />
                      <rect x="38" y="18" width="5" height="5" fill="#111827" />
                      <rect x="53" y="18" width="5" height="5" fill="#111827" />
                      <rect x="43" y="28" width="5" height="5" fill="#111827" />
                      <rect x="53" y="28" width="5" height="5" fill="#111827" />

                      <rect x="8" y="38" width="5" height="5" fill="#111827" />
                      <rect x="18" y="38" width="5" height="5" fill="#111827" />
                      <rect x="28" y="38" width="5" height="5" fill="#111827" />
                      <rect x="38" y="38" width="5" height="5" fill="#111827" />
                      <rect x="48" y="38" width="5" height="5" fill="#111827" />
                      <rect x="58" y="38" width="5" height="5" fill="#111827" />
                      <rect x="68" y="38" width="5" height="5" fill="#111827" />
                      <rect x="78" y="38" width="5" height="5" fill="#111827" />
                      <rect x="88" y="38" width="5" height="5" fill="#111827" />

                      <rect x="13" y="48" width="5" height="5" fill="#111827" />
                      <rect x="28" y="48" width="5" height="5" fill="#111827" />
                      <rect x="43" y="48" width="5" height="5" fill="#111827" />
                      <rect x="63" y="48" width="5" height="5" fill="#111827" />
                      <rect x="73" y="48" width="5" height="5" fill="#111827" />
                      <rect x="83" y="48" width="5" height="5" fill="#111827" />

                      <rect x="8" y="58" width="5" height="5" fill="#111827" />
                      <rect x="23" y="58" width="5" height="5" fill="#111827" />
                      <rect x="38" y="58" width="5" height="5" fill="#111827" />
                      <rect x="53" y="58" width="5" height="5" fill="#111827" />
                      <rect x="68" y="58" width="5" height="5" fill="#111827" />
                      <rect x="83" y="58" width="5" height="5" fill="#111827" />

                      <rect x="38" y="68" width="5" height="5" fill="#111827" />
                      <rect x="48" y="68" width="5" height="5" fill="#111827" />
                      <rect x="63" y="68" width="5" height="5" fill="#111827" />
                      <rect x="78" y="68" width="5" height="5" fill="#111827" />
                      <rect x="88" y="68" width="5" height="5" fill="#111827" />

                      <rect x="43" y="78" width="5" height="5" fill="#111827" />
                      <rect x="58" y="78" width="5" height="5" fill="#111827" />
                      <rect x="73" y="78" width="5" height="5" fill="#111827" />
                      <rect x="88" y="78" width="5" height="5" fill="#111827" />

                      <rect x="38" y="88" width="5" height="5" fill="#111827" />
                      <rect x="53" y="88" width="5" height="5" fill="#111827" />
                      <rect x="68" y="88" width="5" height="5" fill="#111827" />
                      <rect x="83" y="88" width="5" height="5" fill="#111827" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ABA Bank Footer Inside Ticket */}
              <div className="pt-2">
                <div className="bg-neutral-50/90 rounded-2xl py-2 px-3 border border-neutral-100 flex items-center justify-center gap-2">
                  <span className="text-[#002b49] font-black tracking-tight text-xs">
                    ABA' BANK
                  </span>
                  <div className="w-px h-3 bg-red-400" />
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-2xs flex items-center justify-center text-[7px] text-white font-bold">
                      ★
                    </span>
                    <span className="text-[8px] font-bold text-red-600 tracking-wider uppercase">
                      NATIONAL BANK OF CANADA GROUP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-2 pt-4 pb-1 shrink-0">
              {/* Back to Home Main Button */}
              <button
                type="button"
                onClick={() => {
                  if (reservation) onSuccess(reservation);
                  else onCancel();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#1c6758] hover:bg-[#155346] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Back to Home</span>
              </button>

              {/* Secondary Options: Calendar & My Bookings */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (reservation) onDownloadICS(reservation);
                  }}
                  className="py-2.5 px-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Add to Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (reservation) onSuccess(reservation);
                    onViewMyBookings();
                  }}
                  className="py-2.5 px-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>My Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              </div>

              {/* iOS Home Indicator */}
              <div className="w-32 h-1 bg-neutral-300 rounded-full mx-auto mt-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
