import React, { useState, useMemo } from 'react';
import { Restaurant, SearchFilterState, City } from '../../types';
import {
  MapPin,
  Search,
  Star,
  Calendar,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  Navigation,
  UtensilsCrossed,
  Heart,
  CalendarCheck,
  Sparkles,
  Clock,
} from 'lucide-react';

interface MobileDiscoverViewProps {
  restaurants: Restaurant[];
  allRestaurants: Restaurant[];
  filterState: SearchFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<SearchFilterState>>;
  onSelectRestaurant: (restaurant: Restaurant, initialSlotTime?: string) => void;
  onOpenMyBookings: () => void;
  onBackToMiniAppsHub: () => void;
  bookingCount: number;
}

const ALL_TIME_SLOTS = [
  { time: '11:30', sub: '11:30 AM', period: 'lunch' },
  { time: '12:00', sub: '12:00 PM', period: 'lunch' },
  { time: '12:30', sub: '12:30 PM', period: 'lunch' },
  { time: '13:00', sub: '1:00 PM', period: 'lunch' },
  { time: '18:00', sub: '6:00 PM', period: 'dinner' },
  { time: '18:30', sub: '6:30 PM', period: 'dinner', isPrime: true },
  { time: '19:00', sub: '7:00 PM', period: 'dinner', isPrime: true },
  { time: '19:30', sub: '7:30 PM', period: 'dinner', isPrime: true },
  { time: '20:00', sub: '8:00 PM', period: 'dinner', isPrime: true },
  { time: '20:30', sub: '8:30 PM', period: 'dinner' },
];

const CUISINES_DATA = [
  {
    id: 'All',
    label: 'All',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'Khmer',
    label: 'Khmer',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'French',
    label: 'French',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'Japanese',
    label: 'Japanese',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'Chinese',
    label: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'Italian',
    label: 'Italian',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'Seafood',
    label: 'Seafood',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 'Cafés and casual dining',
    label: 'Cafés',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=360&q=80',
  },
];

const SPECIAL_OFFERS = [
  {
    id: 'offer-1',
    badge: 'Weekend Offers',
    title: 'Get Special Offer',
    discount: '30%',
    cta: 'Book Now',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=480&q=80',
    description: 'Exclusive reservation perk for ABA Mobile diners',
  },
  {
    id: 'offer-2',
    badge: 'Chef Specials',
    title: 'Tasting Menu Perk',
    discount: '25%',
    cta: 'Book Now',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=480&q=80',
    description: 'Complimentary chef welcome drink with prime table seating',
  },
  {
    id: 'offer-3',
    badge: 'ABA Exclusive',
    title: 'Top Rated Tables',
    discount: '20%',
    cta: 'Book Now',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=480&q=80',
    description: 'Guaranteed prime table with verified instant reservation',
  },
  {
    id: 'offer-4',
    badge: 'Evening Dining',
    title: 'Sunset Seating',
    discount: '15%',
    cta: 'Book Now',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=480&q=80',
    description: 'Best courtyard and rooftop tables across the city',
  },
];

export const MobileDiscoverView: React.FC<MobileDiscoverViewProps> = ({
  restaurants,
  allRestaurants,
  filterState,
  setFilterState,
  onSelectRestaurant,
  onOpenMyBookings,
  onBackToMiniAppsHub,
  bookingCount,
}) => {
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [savedFavorites, setSavedFavorites] = useState<string[]>([]);
  const [proximitySortEnabled, setProximitySortEnabled] = useState(false);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [timePeriodFilter, setTimePeriodFilter] = useState<'all' | 'dinner' | 'lunch'>('all');

  const displayedSlots = useMemo(() => {
    if (timePeriodFilter === 'dinner') return ALL_TIME_SLOTS.filter((s) => s.period === 'dinner');
    if (timePeriodFilter === 'lunch') return ALL_TIME_SLOTS.filter((s) => s.period === 'lunch');
    return ALL_TIME_SLOTS;
  }, [timePeriodFilter]);

  // Dedicated vertical list page state (when "See All" is clicked)
  const [viewAllSection, setViewAllSection] = useState<'near' | 'top' | 'popular' | 'all' | null>(null);
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingCuisine, setListingCuisine] = useState('All');
  const [listingSortBy, setListingSortBy] = useState<'popular' | 'rating' | 'nearby' | 'priceAsc'>('popular');

  // Near You list (closest dining in current city)
  const nearbyRestaurants = useMemo(() => {
    return allRestaurants
      .filter((r) => r.city === filterState.city)
      .slice(0, 6);
  }, [allRestaurants, filterState.city]);

  // Top Rated list (highest rated dining in current city)
  const topRatedRestaurants = useMemo(() => {
    return allRestaurants
      .filter((r) => r.city === filterState.city)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [allRestaurants, filterState.city]);

  // Generate next 7 days for preferences picker
  const dateOptions = useMemo(() => {
    const list: { label: string; sub: string; dateStr: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      list.push({ label: dayName, sub: dayNum, dateStr });
    }
    return list;
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const hasActiveFilters =
    filterState.cuisine !== 'All' ||
    filterState.priceTier !== 'all' ||
    filterState.selectedFacilities.length > 0 ||
    filterState.timeSlot.trim().length > 0 ||
    filterState.searchQuery.trim().length > 0;

  const currentOffer = SPECIAL_OFFERS[activeOfferIndex] || SPECIAL_OFFERS[0];

  // Filtered & sorted list for the dedicated View All vertical page
  const verticalListResults = useMemo(() => {
    let list = allRestaurants.filter((r) => r.city === filterState.city);

    // Filter by search input at the top of the vertical list
    if (listingSearchQuery.trim()) {
      const q = listingSearchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.tagline.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.branches.some(
            (b) =>
              b.area.toLowerCase().includes(q) ||
              b.address.toLowerCase().includes(q)
          )
      );
    }

    // Filter by cuisine chip
    if (listingCuisine !== 'All') {
      list = list.filter(
        (r) => r.cuisine.toLowerCase() === listingCuisine.toLowerCase()
      );
    }

    // Sort
    if (listingSortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (listingSortBy === 'priceAsc') {
      list.sort((a, b) => a.priceTier.length - b.priceTier.length);
    } else if (listingSortBy === 'nearby') {
      // Keep near order
    } else {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }, [allRestaurants, filterState.city, listingSearchQuery, listingCuisine, listingSortBy]);

  // =========================================================================
  // VIEW ALL PAGE (Opens when user clicks "See All" on any section)
  // Shows restaurants listed in vertical order with a working search field
  // =========================================================================
  if (viewAllSection) {
    const pageTitle =
      viewAllSection === 'near'
        ? 'Restaurants Near You'
        : viewAllSection === 'top'
        ? 'Top Rated Restaurants'
        : 'All Restaurants';

    return (
      <div className="min-h-full bg-neutral-50 pb-12 space-y-3 select-none">
        {/* Sticky Header with Back button, Title & Working Search Field */}
        <header className="sticky top-0 z-30 bg-[#002b49] text-white px-4 pt-3 pb-4 rounded-b-[24px] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setViewAllSection(null);
                  setListingSearchQuery('');
                  setListingCuisine('All');
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="Back to Discover"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                  {pageTitle}
                </h1>
                <p className="text-[10px] text-white/70">
                  {verticalListResults.length} {verticalListResults.length === 1 ? 'venue' : 'venues'} in {filterState.city}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenMyBookings}
              className="relative w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
              title="My Bookings"
            >
              <CalendarCheck className="w-4 h-4 text-white" />
              {bookingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-amber-400 text-neutral-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {bookingCount}
                </span>
              )}
            </button>
          </div>

          {/* Working Search Field at the Top */}
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={listingSearchQuery}
              onChange={(e) => setListingSearchQuery(e.target.value)}
              placeholder="Search restaurants, cuisines, or areas"
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-white text-xs text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-normal"
              autoFocus
            />
            {listingSearchQuery && (
              <button
                onClick={() => setListingSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Cuisines & Sorting Controls */}
        <div className="px-4 space-y-2">
          {/* Quick Cuisine Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CUISINES_DATA.map((cat) => {
              const isSelected = listingCuisine === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setListingCuisine(cat.id)}
                  className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-[#002b49] text-white shadow-xs'
                      : 'bg-white text-neutral-600 border border-neutral-200/90 hover:bg-neutral-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Sort Selection Chips */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setListingSortBy('popular')}
              className={`px-3 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
                listingSortBy === 'popular'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Recommended
            </button>
            <button
              onClick={() => setListingSortBy('rating')}
              className={`px-3 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
                listingSortBy === 'rating'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              ★ Highest Rated
            </button>
            <button
              onClick={() => setListingSortBy('nearby')}
              className={`px-3 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
                listingSortBy === 'nearby'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              📍 Nearby
            </button>
            <button
              onClick={() => setListingSortBy('priceAsc')}
              className={`px-3 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
                listingSortBy === 'priceAsc'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Price: Low to High
            </button>
          </div>
        </div>

        {/* Vertical List of Restaurant Cards */}
        <div className="px-4 space-y-3.5">
          {verticalListResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">No restaurants found</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Try adjusting your search keywords or switching cuisine filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setListingSearchQuery('');
                  setListingCuisine('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#002b49] text-white text-xs font-semibold hover:bg-[#003860] transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            verticalListResults.map((rest, idx) => {
              const defaultBranch = rest.branches[0];
              const isFav = savedFavorites.includes(rest.id);
              const mockDistance = ['0.4 km', '0.7 km', '1.1 km', '1.5 km', '2.2 km', '2.8 km'][idx % 6];

              return (
                <div
                  key={`v-${rest.id}`}
                  onClick={() => onSelectRestaurant(rest)}
                  className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-neutral-300 active:scale-[0.99] transition-all cursor-pointer group"
                >
                  <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
                    <img
                      src={rest.heroImage}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
                      {rest.priceTier}
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(rest.id, e)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                      title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-500'
                        }`}
                      />
                    </button>

                    <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rest.rating.toFixed(2)}</span>
                      <span className="text-neutral-300 text-[10px]">({rest.reviewCount})</span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-neutral-950/80 backdrop-blur-xs text-neutral-200 px-2.5 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5 text-cyan-300" />
                      <span>{mockDistance} · {defaultBranch?.area || rest.city}</span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-neutral-900 text-base leading-tight">
                        {rest.name}
                      </h3>
                      {rest.branches.length > 1 && (
                        <span className="text-[10px] text-[#002b49] font-bold bg-neutral-100 px-2 py-0.5 rounded-md shrink-0">
                          {rest.branches.length} branches
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {rest.tagline}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // MAIN DISCOVER HOMEPAGE
  // =========================================================================
  return (
    <div className="space-y-4 pb-12 bg-neutral-50 min-h-full select-none">
      {/* 1. Header with App Name, Notification, Working Search & Filter */}
      <header className="bg-[#002b49] text-white pt-3 pb-6 px-4 rounded-b-[30px] shadow-sm relative overflow-hidden select-none">
        {/* Subtle decorative curved background waves */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
            <path
              d="M-50,60 C100,10 250,150 450,40"
              stroke="white"
              strokeWidth="24"
              strokeLinecap="round"
            />
            <path
              d="M-30,120 C120,40 280,180 480,80"
              stroke="white"
              strokeWidth="16"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative z-10 space-y-3.5">
          {/* Top Bar: Back to Hub, App Name, and Booking Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onBackToMiniAppsHub}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer border border-white/10"
                title="Return to ABA Mini Apps"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              </button>

              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                  Table Reservation
                </h1>
              </div>
            </div>

            {/* My Bookings Icon */}
            <button
              onClick={onOpenMyBookings}
              className="relative w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer border border-white/15"
              title="My Bookings"
            >
              <CalendarCheck className="w-4 h-4 text-white" />
              {bookingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-amber-400 text-neutral-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {bookingCount}
                </span>
              )}
            </button>
          </div>

          {/* Search Field & Filter Button in Single Row */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={filterState.searchQuery}
                onChange={(e) =>
                  setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))
                }
                placeholder="Search restaurants, cuisines, or areas"
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-white text-xs text-neutral-900 placeholder-neutral-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-normal"
              />
              {filterState.searchQuery && (
                <button
                  onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Square Filter Button */}
            <button
              onClick={() => setShowPreferencesModal(true)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0 ${
                hasActiveFilters
                  ? 'bg-amber-400 text-neutral-950 ring-2 ring-white/30'
                  : 'bg-white text-[#002b49] hover:bg-neutral-50 active:scale-95'
              }`}
              title="Filter Preferences"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Active Filter Chips (Time & Price) */}
          {(filterState.timeSlot || filterState.priceTier !== 'all') && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-0.5 scrollbar-none text-xs">
              {filterState.timeSlot && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs shrink-0">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Time: {filterState.timeSlot}</span>
                  <button
                    onClick={() => setFilterState((prev) => ({ ...prev, timeSlot: '' }))}
                    className="ml-0.5 hover:text-amber-300 cursor-pointer"
                    title="Clear Time Filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filterState.priceTier !== 'all' && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs shrink-0">
                  <span>Price: {filterState.priceTier}</span>
                  <button
                    onClick={() => setFilterState((prev) => ({ ...prev, priceTier: 'all' }))}
                    className="ml-0.5 hover:text-amber-300 cursor-pointer"
                    title="Clear Price Filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    timeSlot: '',
                    priceTier: 'all',
                  }))
                }
                className="text-[10px] text-white/70 hover:text-white underline cursor-pointer ml-1 whitespace-nowrap"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* When user types in search on homepage: show live vertical search results immediately */}
      {filterState.searchQuery.trim().length > 0 ? (
        <section className="px-4 space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Search Results
              </h2>
              <p className="text-[11px] text-neutral-500">
                Found {restaurants.length} {restaurants.length === 1 ? 'venue' : 'venues'} matching "{filterState.searchQuery}"
              </p>
            </div>
            <button
              onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
              className="text-xs font-semibold text-[#002b49] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {restaurants.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 text-sm">No matching restaurants</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Try checking your spelling, choosing a cuisine, or clearing the search.
                </p>
              </div>
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="px-4 py-2 rounded-xl bg-[#002b49] text-white text-xs font-semibold hover:bg-[#003860] transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {restaurants.map((rest, idx) => {
                const defaultBranch = rest.branches[0];
                const isFav = savedFavorites.includes(rest.id);
                const mockDistance = ['0.4 km', '0.7 km', '1.1 km', '1.5 km', '2.2 km', '2.8 km'][idx % 6];

                return (
                  <div
                    key={`search-${rest.id}`}
                    onClick={() => onSelectRestaurant(rest)}
                    className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-neutral-300 active:scale-[0.99] transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={rest.heroImage}
                        alt={rest.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
                        {rest.priceTier}
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(rest.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                        title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-colors ${
                            isFav ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-500'
                          }`}
                        />
                      </button>

                      <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{rest.rating.toFixed(2)}</span>
                        <span className="text-neutral-300 text-[10px]">({rest.reviewCount})</span>
                      </div>

                      <div className="absolute bottom-3 right-3 bg-neutral-950/80 backdrop-blur-xs text-neutral-200 px-2.5 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-cyan-300" />
                        <span>{mockDistance} · {defaultBranch?.area || rest.city}</span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-neutral-900 text-base leading-tight">
                          {rest.name}
                        </h3>
                        {rest.branches.length > 1 && (
                          <span className="text-[10px] text-[#002b49] font-bold bg-neutral-100 px-2 py-0.5 rounded-md shrink-0">
                            {rest.branches.length} branches
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 line-clamp-1">
                        {rest.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 2. Special Offers Section */}
          <section className="space-y-2 px-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Special Offers
              </h2>
            </div>

            {/* Featured Banner Card */}
            <div className="bg-gradient-to-br from-neutral-50 via-white to-amber-50/40 rounded-3xl p-4 border border-neutral-200/90 shadow-xs relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-2 left-24 w-16 h-16 opacity-30 pointer-events-none">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="#d97706">
                  <circle cx="10" cy="10" r="2" />
                  <circle cx="25" cy="10" r="2" />
                  <circle cx="40" cy="10" r="2" />
                  <circle cx="10" cy="25" r="2" />
                  <circle cx="25" cy="25" r="2" />
                  <circle cx="40" cy="25" r="2" />
                </svg>
              </div>

              <div className="space-y-1.5 z-10 max-w-[55%]">
                <span className="px-2.5 py-0.5 rounded-full bg-white text-neutral-700 text-[10px] font-semibold shadow-2xs border border-neutral-200/80 inline-block">
                  {currentOffer.badge}
                </span>

                <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-tight">
                  {currentOffer.title}
                </h3>

                <div className="flex items-baseline gap-1 text-xs text-neutral-600 font-medium">
                  <span>Up to</span>
                  <span className="text-2xl font-black text-neutral-900 tracking-tight">
                    {currentOffer.discount}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const target = restaurants[activeOfferIndex % restaurants.length] || restaurants[0];
                    if (target) onSelectRestaurant(target);
                  }}
                  className="mt-1 px-4 py-1.5 rounded-xl bg-[#002b49] text-white text-xs font-bold hover:bg-[#003860] active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  {currentOffer.cta}
                </button>
              </div>

              <div className="relative w-36 h-32 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-neutral-200/60">
                <img
                  src={currentOffer.image}
                  alt={currentOffer.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Carousel Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {SPECIAL_OFFERS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveOfferIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeOfferIndex === idx ? 'w-5 bg-[#002b49]' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  title={`Offer ${idx + 1}`}
                />
              ))}
            </div>
          </section>

          {/* 3. Cuisines Section */}
          <section className="space-y-2.5 px-4 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Cuisines
              </h2>
              <button
                onClick={() => {
                  setViewAllSection('all');
                  setListingSortBy('popular');
                  setListingSearchQuery('');
                  setListingCuisine('All');
                }}
                className="text-xs font-semibold text-[#002b49] hover:underline cursor-pointer"
              >
                See All
              </button>
            </div>

            {/* Horizontal Capsules with Photo Background */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              {CUISINES_DATA.map((item) => {
                const isSelected =
                  (item.id === 'All' && filterState.cuisine === 'All') ||
                  (item.id !== 'All' &&
                    filterState.cuisine.toLowerCase() === item.id.toLowerCase());

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'All') {
                        setViewAllSection('all');
                        setListingCuisine('All');
                      } else {
                        setViewAllSection('all');
                        setListingCuisine(item.id);
                      }
                    }}
                    className={`w-32 h-14 rounded-full overflow-hidden shrink-0 relative flex items-center justify-center cursor-pointer shadow-2xs group active:scale-95 transition-all snap-start border ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#002b49] border-[#002b49]'
                        : 'border-neutral-200/80 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      className={`absolute inset-0 transition-colors ${
                        isSelected ? 'bg-black/60' : 'bg-black/50 group-hover:bg-black/40'
                      }`}
                    />
                    <span className="relative z-10 text-white font-bold text-xs tracking-wide drop-shadow-sm">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. Horizontal Scroll Section: Restaurants Near You (CSS selector 1: section:nth-of-type(3)) */}
          <section className="space-y-2.5 pt-1">
            <div className="px-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Restaurants Near You
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Closest dining tables in {filterState.city}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewAllSection('near');
                  setListingSortBy('nearby');
                  setListingSearchQuery('');
                  setListingCuisine('All');
                }}
                className="text-xs font-semibold text-[#002b49] hover:underline cursor-pointer"
              >
                See All
              </button>
            </div>

            {/* Horizontal Snap Scroll Cards */}
            <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 scrollbar-none snap-x">
              {nearbyRestaurants.map((rest, idx) => {
                const defaultBranch = rest.branches[0];
                const isFav = savedFavorites.includes(rest.id);
                const mockDistance = ['0.4 km', '0.7 km', '1.1 km', '1.5 km', '2.2 km', '2.8 km'][idx % 6];

                return (
                  <div
                    key={`near-${rest.id}`}
                    onClick={() => onSelectRestaurant(rest)}
                    className="w-64 shrink-0 snap-start bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-neutral-300 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={rest.heroImage}
                        alt={rest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Navigation className="w-2.5 h-2.5 text-cyan-300" />
                        <span>{mockDistance}</span>
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(rest.id, e)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                        title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            isFav ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-500'
                          }`}
                        />
                      </button>

                      <div className="absolute bottom-2.5 left-2.5 bg-neutral-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {rest.priceTier}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 bg-neutral-950/80 backdrop-blur-xs text-neutral-200 px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {defaultBranch?.area || rest.city}
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm leading-tight truncate">
                          {rest.name}
                        </h3>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {rest.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">
                        {rest.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. Horizontal Scroll Section: Top Restaurants (CSS selector 2: section:nth-of-type(4)) */}
          <section className="space-y-2.5 pt-1">
            <div className="px-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  Top Restaurants
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Highest rated experiences in {filterState.city}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewAllSection('top');
                  setListingSortBy('rating');
                  setListingSearchQuery('');
                  setListingCuisine('All');
                }}
                className="text-xs font-semibold text-[#002b49] hover:underline cursor-pointer"
              >
                See All
              </button>
            </div>

            {/* Horizontal Snap Scroll Cards */}
            <div className="flex gap-3.5 overflow-x-auto px-4 pb-2 scrollbar-none snap-x">
              {topRatedRestaurants.map((rest) => {
                const defaultBranch = rest.branches[0];
                const isFav = savedFavorites.includes(rest.id);

                return (
                  <div
                    key={`top-${rest.id}`}
                    onClick={() => onSelectRestaurant(rest)}
                    className="w-64 shrink-0 snap-start bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-neutral-300 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
                      <img
                        src={rest.heroImage}
                        alt={rest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                      <div className="absolute top-2.5 left-2.5 bg-neutral-950/85 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{rest.rating.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(rest.id, e)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                        title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${
                            isFav ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-500'
                          }`}
                        />
                      </button>

                      <div className="absolute bottom-2.5 left-2.5 bg-neutral-950/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {rest.priceTier}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 bg-neutral-950/80 backdrop-blur-xs text-neutral-200 px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {defaultBranch?.area || rest.city}
                      </div>
                    </div>

                    <div className="p-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-neutral-900 text-sm leading-tight truncate">
                          {rest.name}
                        </h3>
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {rest.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-1">
                        {rest.tagline}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 6. Popular Restaurants Section (CSS selector 3: section:nth-of-type(5)) */}
          <section className="px-4 space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Popular Restaurants
              </h2>
              <button
                onClick={() => {
                  setViewAllSection('popular');
                  setListingSortBy('popular');
                  setListingSearchQuery('');
                  setListingCuisine('All');
                }}
                className="text-xs font-semibold text-[#002b49] hover:underline cursor-pointer"
              >
                See All
              </button>
            </div>

            {restaurants.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">No restaurants found</h4>
                  <p className="text-xs text-neutral-500 mt-1">
                    Try selecting another cuisine, adjusting your search query, or resetting filters.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setFilterState((prev) => ({
                      ...prev,
                      searchQuery: '',
                      cuisine: 'All',
                      priceTier: 'all',
                      confirmationMethod: 'ALL',
                      selectedFacilities: [],
                    }))
                  }
                  className="px-4 py-2 rounded-xl bg-[#002b49] text-white text-xs font-semibold hover:bg-[#003860] transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurants.map((rest, idx) => {
                  const defaultBranch = rest.branches[0];
                  const isFav = savedFavorites.includes(rest.id);
                  const mockDistance = ['0.4 km', '0.7 km', '1.1 km', '1.5 km', '2.2 km', '2.8 km'][idx % 6];

                  return (
                    <div
                      key={rest.id}
                      onClick={() => onSelectRestaurant(rest)}
                      className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden shadow-xs hover:border-neutral-300 active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-[16/10] w-full bg-neutral-900 overflow-hidden">
                        <img
                          src={rest.heroImage}
                          alt={rest.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                        <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold">
                          {rest.priceTier}
                        </div>

                        <button
                          onClick={(e) => toggleFavorite(rest.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                          title={isFav ? 'Remove Favorite' : 'Save Favorite'}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              isFav ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-500'
                            }`}
                          />
                        </button>

                        <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-lg text-[11px] flex items-center gap-1 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rest.rating.toFixed(2)}</span>
                          <span className="text-neutral-300 text-[10px]">({rest.reviewCount})</span>
                        </div>

                        <div className="absolute bottom-3 right-3 bg-neutral-950/80 backdrop-blur-xs text-neutral-200 px-2.5 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1">
                          <Navigation className="w-2.5 h-2.5 text-cyan-300" />
                          <span>{mockDistance} · {defaultBranch?.area || rest.city}</span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-neutral-900 text-base leading-tight">
                            {rest.name}
                          </h3>
                          {rest.branches.length > 1 && (
                            <span className="text-[10px] text-[#002b49] font-bold bg-neutral-100 px-2 py-0.5 rounded-md shrink-0">
                              {rest.branches.length} branches
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-600 line-clamp-1">
                          {rest.tagline}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Preferences & Filter Modal */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-w-md w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-bold text-neutral-900 text-base">Booking Preferences & Filters</h3>
                <p className="text-[11px] text-neutral-500">Refine date, dining time, and price preferences</p>
              </div>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dining Time Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#002b49]" /> Dining Time
                </label>

                {/* Period Filter Tabs: All, Dinner, Lunch */}
                <div className="flex items-center bg-neutral-100 p-0.5 rounded-xl border border-neutral-200/80 text-[11px]">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'dinner', label: 'Dinner' },
                    { id: 'lunch', label: 'Lunch' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTimePeriodFilter(p.id as 'all' | 'dinner' | 'lunch')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        timePeriodFilter === p.id
                          ? 'bg-[#002b49] text-white shadow-2xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid: Responsive, Tap-Friendly Cards */}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {/* Any Time Button Card */}
                <button
                  onClick={() => setFilterState((prev) => ({ ...prev, timeSlot: '' }))}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                    !filterState.timeSlot
                      ? 'bg-[#002b49] text-white border-[#002b49] shadow-xs'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  <span className="font-bold text-xs tracking-tight">Any Time</span>
                  <span className={`text-[10px] mt-0.5 ${!filterState.timeSlot ? 'text-amber-300' : 'text-neutral-400'}`}>
                    Flexible
                  </span>
                </button>

                {/* Time Slots */}
                {displayedSlots.map((slot) => {
                  const isSelected = filterState.timeSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          timeSlot: isSelected ? '' : slot.time,
                        }))
                      }
                      className={`relative py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#002b49] text-white border-[#002b49] shadow-xs scale-[1.02]'
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 active:scale-98'
                      }`}
                    >
                      {slot.isPrime && (
                        <span
                          className={`absolute -top-1.5 right-1.5 px-1 py-0.2 rounded text-[8px] font-black tracking-tight uppercase ${
                            isSelected
                              ? 'bg-amber-400 text-neutral-950'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Peak
                        </span>
                      )}
                      <span className="font-bold font-mono text-xs">{slot.time}</span>
                      <span
                        className={`text-[10px] font-medium mt-0.5 ${
                          isSelected ? 'text-amber-300' : 'text-neutral-500'
                        }`}
                      >
                        {slot.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#002b49]" /> Date
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {dateOptions.map((item) => {
                  const isSelected = filterState.date === item.dateStr;
                  return (
                    <button
                      key={item.dateStr}
                      onClick={() =>
                        setFilterState((prev) => ({ ...prev, date: item.dateStr }))
                      }
                      className={`min-w-[62px] py-2 px-2 rounded-xl flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#002b49] text-white shadow-xs'
                          : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="text-[10px] font-semibold">{item.label}</span>
                      <span className={`text-xs font-bold mt-0.5 ${isSelected ? 'text-amber-300' : 'text-neutral-900'}`}>
                        {item.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Tier */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Price Tier
              </label>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {(['all', '$', '$$', '$$$', '$$$$'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() =>
                      setFilterState((prev) => ({ ...prev, priceTier: tier }))
                    }
                    className={`py-2 px-2 rounded-xl text-center font-bold border transition-colors cursor-pointer ${
                      filterState.priceTier === tier
                        ? 'bg-[#002b49] text-white border-[#002b49]'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {tier === 'all' ? 'All' : tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    cuisine: 'All',
                    priceTier: 'all',
                    selectedFacilities: [],
                    timeSlot: '',
                    searchQuery: '',
                  }))
                }
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setShowPreferencesModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#002b49] text-white text-xs font-semibold hover:bg-[#003860] cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
