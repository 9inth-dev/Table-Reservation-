import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

interface TableReservationSplashProps {
  onFindTable: () => void;
  onBackToHub: () => void;
}

export const TableReservationSplash: React.FC<TableReservationSplashProps> = ({
  onFindTable,
  onBackToHub,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar over 2000ms
    const startTime = Date.now();
    const duration = 2000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onFindTable();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFindTable]);

  return (
    <div
      onClick={onFindTable}
      className="min-h-full bg-[#f5f5f5] text-neutral-900 flex flex-col justify-between p-6 select-none relative cursor-pointer overflow-hidden"
    >
      {/* Top Bar with gentle Back and Skip controls */}
      <div className="w-full flex items-center justify-between z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBackToHub();
          }}
          className="w-9 h-9 rounded-full bg-white/90 hover:bg-white active:scale-95 text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 shadow-xs flex items-center justify-center transition-all cursor-pointer"
          title="Back to Mini Apps"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFindTable();
          }}
          className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 px-2.5 py-1 rounded-full hover:bg-neutral-200/60 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Center Brand & Splash Icon */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8 space-y-6">
        {/* App Logo Emblem */}
        <div className="relative group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-4 bg-[#002b49]/10 rounded-full blur-xl pointer-events-none" />

          {/* Icon Box in ABA Navy & Amber */}
          <div className="relative w-24 h-24 rounded-3xl bg-[#002b49] text-amber-400 flex items-center justify-center shadow-2xl shadow-[#002b49]/25 ring-1 ring-black/5 transform transition-transform group-hover:scale-105 duration-300">
            <UtensilsCrossed className="w-12 h-12 stroke-[2.2]" />
            {/* Small corner sparkle accent */}
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 ring-4 ring-[#f5f5f5] flex items-center justify-center" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="text-center space-y-1.5 px-4">
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Table Reservation
          </h1>
          <p className="text-xs font-medium text-neutral-500">
            Book curated tables across Cambodia
          </p>
        </div>

        {/* 2-Second Smooth Progress Loading Indicator */}
        <div className="w-48 space-y-2 pt-2">
          <div className="h-1.5 w-full bg-neutral-200/90 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#002b49] to-amber-500 rounded-full transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Lockup with ABA Mobile Identity */}
      <div className="z-10 flex flex-col items-center justify-center space-y-2 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 tracking-tight">
          <span>ABA</span>
          <span className="text-red-500 font-serif -ml-0.5 mr-0.5">'</span>
          <span>Mini Apps</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Partner Service · No-show protection</span>
        </div>
      </div>
    </div>
  );
};
