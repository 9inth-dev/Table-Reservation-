import React, { useState } from 'react';
import {
  ChevronLeft,
  Search,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Plane,
  Bus,
  FileText,
  HeartPulse,
  Ticket,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface AbaMiniAppsHubProps {
  onOpenTableReservation: () => void;
}

export const AbaMiniAppsHub: React.FC<AbaMiniAppsHubProps> = ({
  onOpenTableReservation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const miniAppsList = [
    {
      id: 'table-reservation',
      name: 'Table Reservation',
      category: 'Dining & Experiences',
      description: 'Reserve curated tables & fine dining across Cambodia with instant confirmation',
      icon: UtensilsCrossed,
      color: 'bg-[#002b49] text-amber-400',
      isNew: true,
      featured: true,
      onClick: onOpenTableReservation,
    },
    {
      id: 'food-delivery',
      name: 'Food & Groceries',
      category: 'Food Delivery',
      description: 'Order food, snacks, and fresh groceries delivered to your door',
      icon: ShoppingBag,
      color: 'bg-emerald-600 text-white',
    },
    {
      id: 'cinema',
      name: 'Cinema Tickets',
      category: 'Entertainment',
      description: 'Book seats at Legend and Major Cineplex theatres nationwide',
      icon: Film,
      color: 'bg-rose-600 text-white',
    },
    {
      id: 'flights',
      name: 'Travel & Flights',
      category: 'Travel',
      description: 'Domestic flights and international trips with direct ABA Pay',
      icon: Plane,
      color: 'bg-sky-600 text-white',
    },
    {
      id: 'bus-ferry',
      name: 'Express Bus & Ferry',
      category: 'Transport',
      description: 'Intercity bus and island ferry tickets to Koh Rong and beyond',
      icon: Bus,
      color: 'bg-amber-600 text-white',
    },
    {
      id: 'health',
      name: 'Health & Pharmacy',
      category: 'Healthcare',
      description: 'Teleconsultations, prescription delivery, and wellness tests',
      icon: HeartPulse,
      color: 'bg-teal-600 text-white',
    },
    {
      id: 'events',
      name: 'Events & Shows',
      category: 'Leisure',
      description: 'Live concerts, sports matches, and cultural exhibitions',
      icon: Ticket,
      color: 'bg-purple-600 text-white',
    },
    {
      id: 'utilities',
      name: 'Bill Payments',
      category: 'Utilities',
      description: 'EDC electricity, clean water, waste disposal, and internet bills',
      icon: FileText,
      color: 'bg-indigo-600 text-white',
    },
  ];

  const filteredApps = miniAppsList.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-neutral-900 text-white flex flex-col">
      {/* Native ABA Mobile Branded Header */}
      <div className="relative w-full overflow-hidden shrink-0 select-none bg-gradient-to-b from-[#002947] via-[#001827] to-neutral-900 border-b border-neutral-800/60 pt-3 pb-5 px-4">
        {/* Subtle decorative glow accents */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-4 left-1/3 w-32 h-32 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

        {/* Top Controls */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <button
            onClick={() => {}}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-transform active:scale-95 cursor-pointer border border-white/10 shadow-xs"
            title="Back to ABA Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {}}
            className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-transform active:scale-95 cursor-pointer border border-white/10 shadow-xs"
            title="Search Mini Apps"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Header Title Section */}
        <div className="relative z-10 flex items-end justify-between">
          <div className="max-w-[72%]">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center">
              <span>ABA</span>
              <span className="text-red-500 font-serif -ml-0.5 mr-1.5">'</span>
              <span>Mini Apps</span>
            </h1>
            <p className="text-xs text-neutral-300 mt-1 leading-snug font-normal">
              Instantly access services from ABA Bank's verified partners.
            </p>
          </div>

          {/* 4 Golden App Icon Grid Preview */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-200 to-amber-400 shadow-xs flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-amber-900/60" />
            </div>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-400 shadow-xs flex items-center justify-center">
              <div className="w-2.5 h-2.5 rotate-45 border-2 border-neutral-700/60" />
            </div>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-neutral-300 to-neutral-500 shadow-xs flex items-center justify-center">
              <div className="w-2 h-2 rounded-full border-2 border-neutral-700/60" />
            </div>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-200 to-amber-400 shadow-xs flex items-center justify-center">
              <div className="w-2 h-2 rounded bg-amber-900/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Apps Content Area */}
      <div className="flex-1 bg-neutral-900 px-4 pt-3 pb-8 space-y-4">
        {/* Search Bar for Partner Services */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mini apps and services..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-800/90 border border-neutral-700 text-xs text-white placeholder-neutral-400 focus:outline-none focus:ring-1.5 focus:ring-amber-400 transition-all"
          />
        </div>

        {/* Featured Service Card: Table Reservation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold px-1 text-neutral-400">
            <span>Featured Dining Partner</span>
            <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> NEW SERVICE
            </span>
          </div>

          <button
            onClick={onOpenTableReservation}
            className="w-full text-left bg-gradient-to-r from-[#002844] via-[#003153] to-[#001e33] rounded-2xl p-4 border border-amber-400/30 shadow-lg hover:border-amber-400/60 transition-all group active:scale-[0.99] cursor-pointer relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-6 h-6 stroke-[2.4]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base tracking-tight">
                    Table Reservation
                  </h3>
                  <span className="bg-amber-400 text-neutral-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full font-mono">
                    NEW
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-1 leading-snug">
                  Reserve curated tables & fine dining across Cambodia
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-neutral-950 flex items-center justify-center text-white/80 shrink-0 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* Partner Mini Apps Directory */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold px-1 text-neutral-400">
            <span>All Partner Services</span>
            <span className="text-[11px] font-mono text-neutral-500">
              {filteredApps.length} services
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {filteredApps
              .filter((app) => app.id !== 'table-reservation')
              .map((app) => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/70 border border-neutral-700/60 hover:bg-neutral-800 transition-colors select-none opacity-85 hover:opacity-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl ${app.color} flex items-center justify-center shrink-0 shadow-xs`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">
                            {app.name}
                          </h4>
                          <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono">
                            {app.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {app.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-neutral-500 font-medium shrink-0 ml-2 px-2 py-1 rounded bg-neutral-700/50">
                      Open
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
