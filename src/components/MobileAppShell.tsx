import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Signal,
  UtensilsCrossed,
} from 'lucide-react';
import { User } from '../types';

interface MobileAppShellProps {
  children: React.ReactNode;
  onBackToMiniAppsHub?: () => void;
  currentUser?: User;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  onBackToMiniAppsHub,
}) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-start md:justify-center p-0 md:p-6 font-sans">
      {/* Top Device Switcher Toolbar (Visible on Desktop) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-2 px-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-200">ABA Mobile MiniApp</span>
          <span className="bg-neutral-800 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
            iOS / Android
          </span>
        </div>

        <button
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          title="Toggle Mobile Device Frame"
        >
          {deviceFrameMode ? (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Full Screen</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-neutral-400" />
              <span>Device Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Mobile Device Container */}
      <div
        className={`w-full bg-neutral-50 flex flex-col relative overflow-hidden transition-all duration-300 ${
          deviceFrameMode
            ? 'md:max-w-[430px] md:h-[890px] md:rounded-[44px] md:shadow-2xl md:ring-10 md:ring-neutral-800 md:border md:border-neutral-700'
            : 'max-w-2xl min-h-screen md:rounded-2xl'
        }`}
      >
        {/* iOS Dynamic Island & Status Bar */}
        <div className="sticky top-0 z-40 bg-[#001f35] text-white px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none shrink-0 border-b border-[#002f50]">
          <span className="font-mono text-[13px] tracking-tight">{currentTime}</span>

          {/* Dynamic Island Pill */}
          <div className="hidden md:flex items-center justify-center gap-2 bg-black/60 px-3.5 py-0.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-neutral-300 font-medium">ABA Mobile</span>
          </div>

          <div className="flex items-center gap-2 text-neutral-300">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Mobile App Screen Body (NO BOTTOM NAVIGATION) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-neutral-50 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
