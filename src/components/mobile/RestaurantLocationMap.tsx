import React, { useState } from 'react';
import { Branch, City } from '../../types';
import { MapPin, Navigation, Copy, Check, ExternalLink, Phone, Compass, Plus, Minus } from 'lucide-react';

interface RestaurantLocationMapProps {
  branch: Branch;
  city: City;
  restaurantName: string;
}

export const RestaurantLocationMap: React.FC<RestaurantLocationMapProps> = ({
  branch,
  city,
  restaurantName,
}) => {
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(`${restaurantName}, ${branch.address}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(`${restaurantName} ${branch.address} ${city} Cambodia`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Coordinates or city defaults
  const lat = branch.coordinates?.lat || (city === 'Phnom Penh' ? 11.5564 : 13.3633);
  const lng = branch.coordinates?.lng || (city === 'Phnom Penh' ? 104.9282 : 103.8564);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#002b49]" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
            Location & Directions
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
          {branch.area}
        </span>
      </div>

      {/* Styled Interactive Map Canvas */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs bg-slate-900 select-none">
        {/* Vector Stylized Map Background */}
        <svg
          viewBox="0 0 400 200"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#002b49" />
              <stop offset="100%" stopColor="#004373" />
            </linearGradient>
            <pattern id="streetGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Base Land */}
          <rect width="400" height="200" fill="#0f172a" />
          <rect width="400" height="200" fill="url(#streetGrid)" />

          {/* Stylized River Waterway (Tonle Sap / Mekong / Riverside) */}
          <path
            d="M 320 0 Q 280 80 340 140 T 310 200 L 400 200 L 400 0 Z"
            fill="url(#waterGrad)"
            opacity="0.85"
          />
          <path
            d="M 0 160 Q 120 140 240 180 L 250 200 L 0 200 Z"
            fill="url(#waterGrad)"
            opacity="0.6"
          />

          {/* Major Avenues & Streets */}
          <line x1="0" y1="100" x2="400" y2="100" stroke="#334155" strokeWidth="5" />
          <line x1="180" y1="0" x2="180" y2="200" stroke="#334155" strokeWidth="6" />
          <line x1="60" y1="0" x2="300" y2="200" stroke="#1e293b" strokeWidth="3" />
          <line x1="30" y1="200" x2="260" y2="0" stroke="#1e293b" strokeWidth="2.5" />

          {/* Secondary streets */}
          <line x1="0" y1="50" x2="320" y2="50" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="0" y1="150" x2="340" y2="150" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="#1e293b" strokeWidth="1.5" />
          <line x1="260" y1="0" x2="260" y2="200" stroke="#1e293b" strokeWidth="1.5" />

          {/* District Labels */}
          <text x="70" y="35" fill="#64748b" fontSize="8" fontWeight="600" letterSpacing="0.8">
            {city.toUpperCase()}
          </text>
          <text x="210" y="170" fill="#64748b" fontSize="7" fontWeight="500">
            {branch.area}
          </text>
          {city === 'Phnom Penh' && (
            <text x="330" y="70" fill="#38bdf8" fontSize="7" opacity="0.7">
              Tonle Sap River
            </text>
          )}

          {/* Location Center Pin Ring Pulse */}
          <circle cx="180" cy="100" r="28" fill="#f59e0b" fillOpacity="0.15">
            <animate attributeName="r" values="16;34;16" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="180" cy="100" r="14" fill="#f59e0b" fillOpacity="0.3" />
        </svg>

        {/* Floating Custom Restaurant Pin Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
          <div className="bg-[#002b49] text-white px-2.5 py-1 rounded-full shadow-lg border border-amber-400/80 flex items-center gap-1.5 animate-bounce duration-1000">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
              {restaurantName}
            </span>
          </div>
          <div className="w-0.5 h-3 bg-amber-400 shadow-sm" />
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-md ring-2 ring-white" />
        </div>

        {/* Map Controls */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.2))}
            className="w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer shadow-xs active:scale-95"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
            className="w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer shadow-xs active:scale-95"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Distance Badge */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
          <Compass className="w-3 h-3 text-amber-400" />
          <span>Approx. 1.2 km from your location</span>
        </div>
      </div>

      {/* Address & Quick Actions Bar */}
      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/90 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-neutral-900">{branch.address}</div>
            {branch.landmark && (
              <div className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                <span className="text-amber-700 font-semibold">Landmark:</span>
                <span>{branch.landmark}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleCopyAddress}
            className="shrink-0 text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Copy address"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-neutral-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/60">
          <button
            onClick={handleOpenMaps}
            className="py-2 px-3 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Navigation className="w-3.5 h-3.5 text-[#002b49]" />
            <span>Get Directions</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </button>

          <a
            href={`tel:${branch.phone.replace(/\s+/g, '')}`}
            className="py-2 px-3 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Call Branch</span>
          </a>
        </div>
      </div>
    </div>
  );
};
