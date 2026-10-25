import React, { useState } from 'react';
import { Restaurant, Branch, TimeSlot, User, Reservation } from '../types';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Zap,
  Building,
  AlertCircle,
  Download,
  Heart,
  Share2,
  Check,
  Sparkles,
  Phone,
  Navigation,
  ImageIcon,
  Camera,
  Globe,
  Copy,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Play,
  Wallet,
  Utensils,
  MessageCircle,
  Banknote,
} from 'lucide-react';
import { createNewReservation } from '../services/storage';
import { RestaurantLocationMap } from './mobile/RestaurantLocationMap';
import { RestaurantReviewsSection } from './mobile/RestaurantReviewsSection';
import { RestaurantHighlightsSection } from './mobile/RestaurantHighlightsSection';
import { AbaPaymentFlowModal } from './AbaPaymentFlowModal';

interface BookingFlowModalProps {
  restaurant: Restaurant;
  initialSlotTime?: string;
  initialDate?: string;
  initialPartySize?: number;
  initialArea?: string;
  currentUser: User;
  onClose: () => void;
  onBookingComplete: (newRes: Reservation) => void;
  onViewMyBookings: () => void;
}

interface AbaAccount {
  id: string;
  name: string;
  number: string;
  currency: 'USD' | 'KHR';
  balance: string;
}

const DEFAULT_ABA_ACCOUNTS: AbaAccount[] = [
  {
    id: 'acc-1',
    name: 'Savings Account',
    number: '000 123 569',
    currency: 'USD',
    balance: '$2,450.00',
  },
  {
    id: 'acc-2',
    name: 'Current Account',
    number: '000 789 123',
    currency: 'USD',
    balance: '$820.50',
  },
  {
    id: 'acc-3',
    name: 'Mobile Savings (KHR)',
    number: '500 456 789',
    currency: 'KHR',
    balance: '1,500,000 KHR',
  },
];

type BookingStep =
  | 'DETAILS'
  | 'SLOT_SELECTION'
  | 'CONFIRM_AND_PAY'
  | 'SUCCESS';

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  restaurant,
  initialSlotTime,
  initialDate,
  initialPartySize,
  initialArea,
  currentUser,
  onClose,
  onBookingComplete,
  onViewMyBookings,
}) => {
  // Step state - always start on DETAILS unless a direct slot was specified
  const [currentStep, setCurrentStep] = useState<BookingStep>('DETAILS');

  // Pre-match branch by initialArea if available
  const initialMatchedBranch = React.useMemo(() => {
    if (initialArea) {
      const match = restaurant.branches.find(
        (b) =>
          b.area.toLowerCase().includes(initialArea.toLowerCase()) ||
          b.name.toLowerCase().includes(initialArea.toLowerCase()) ||
          b.address.toLowerCase().includes(initialArea.toLowerCase())
      );
      if (match) return match;
    }
    return restaurant.branches[0];
  }, [restaurant, initialArea]);

  // Branch Selection
  const [selectedBranch, setSelectedBranch] = useState<Branch>(initialMatchedBranch);

  // Structured booking preferences state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [partySize, setPartySize] = useState<number>(initialPartySize && initialPartySize > 0 ? initialPartySize : 2);
  const [selectedTime, setSelectedTime] = useState<string>(
    initialSlotTime || selectedBranch.slots[0]?.time || '19:00'
  );
  const [seatingArea, setSeatingArea] = useState<string>('Standard Dining Table');
  const [slotPeriodFilter, setSlotPeriodFilter] = useState<'all' | 'dinner' | 'lunch'>('all');

  const displayedBranchSlots = React.useMemo(() => {
    if (slotPeriodFilter === 'dinner') {
      return selectedBranch.slots.filter((s) => s.period === 'dinner');
    }
    if (slotPeriodFilter === 'lunch') {
      return selectedBranch.slots.filter((s) => s.period === 'lunch');
    }
    return selectedBranch.slots;
  }, [selectedBranch.slots, slotPeriodFilter]);

  // Availability / Revalidation notice
  const [availabilityNotice, setAvailabilityNotice] = useState<{
    message: string;
    type: 'warning' | 'info';
  } | null>(null);

  // Check if entry criteria came from search/filters (Flow A)
  // Flow A criteria: User had explicitly specified date, time, and party size in search/filters
  const hadCompleteSearchPreferences = Boolean(
    initialDate && initialSlotTime && initialPartySize && initialPartySize > 0
  );

  // Helper to revalidate slot availability and capacity
  const validateSlot = (branch: Branch, timeStr: string, guestsCount: number) => {
    const slot = branch.slots.find((s) => s.time === timeStr);
    if (!slot) {
      return {
        valid: false,
        reason: `The time ${timeStr} is not available at ${branch.name}. Please select an open time slot.`,
      };
    }
    if (slot.availableCapacity < guestsCount) {
      return {
        valid: false,
        reason: `The ${timeStr} slot at ${branch.name} only has ${slot.availableCapacity} seats remaining, but you requested ${guestsCount} guests. Please pick another slot below.`,
      };
    }
    return { valid: true };
  };

  // Entry handler when customer taps "Book a table"
  const handleStartBooking = () => {
    // Proceed directly to Table & Slot Selection (skips intermediate branch selection step)
    setCurrentStep('SLOT_SELECTION');
  };

  // Branch chosen (or bypassed if single branch)
  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);

    // If Flow A: customer selected preferences via search or filters
    if (hadCompleteSearchPreferences && initialSlotTime) {
      const validation = validateSlot(branch, initialSlotTime, partySize);
      if (validation.valid) {
        // Revalidated successfully! Skip slot selection and go directly to Confirm & Pay
        setAvailabilityNotice(null);
        setSelectedTime(initialSlotTime);
        setCurrentStep('CONFIRM_AND_PAY');
        return;
      } else {
        // Capacity or slot issue: explain the issue and allow picking an alternative slot
        setAvailabilityNotice({
          message: validation.reason || 'The requested slot is not available. Please choose an available time slot below.',
          type: 'warning',
        });
        setCurrentStep('SLOT_SELECTION');
        return;
      }
    }

    // Flow B (or missing info): proceed to booking-preferences screen (date, time, party size)
    setCurrentStep('SLOT_SELECTION');
  };

  // Confirm & Pay state: Contact number & Special requests
  const [contactPhone, setContactPhone] = useState<string>(currentUser.phone || '012 345 678');
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Debiting account selection
  const [selectedAccount, setSelectedAccount] = useState<AbaAccount>(DEFAULT_ABA_ACCOUNTS[0]);
  const [showAccountPicker, setShowAccountPicker] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [showAbaPaymentFlow, setShowAbaPaymentFlow] = useState<boolean>(false);

  // Success reservation reference
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Helper to format date & time nicely for Booking details card
  const formatBookingDateTime = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const d = new Date(year, month - 1, day, hours, minutes);
      const dateFormatted = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const h12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const mPadded = String(minutes).padStart(2, '0');
      return `${dateFormatted} ${h12}:${mPadded} ${ampm}`;
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  };

  // Active gallery image
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);

  // User interactions on Details
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'about' | 'reviews'>('about');
  const [showFullHours, setShowFullHours] = useState<boolean>(false);
  const [addressCopied, setAddressCopied] = useState<boolean>(false);
  const [reviewsFilter, setReviewsFilter] = useState<'ALL' | 'Food' | 'Ambience' | 'Service'>('ALL');

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: restaurant.name,
          text: `Reserve a table at ${restaurant.name} via ABA Mobile`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setShareToast('Link copied to clipboard!');
      setTimeout(() => setShareToast(null), 2200);
    }
  };

  // Date options for next 7 days
  const dateOptions = React.useMemo(() => {
    const list: { label: string; sub: string; dateStr: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      list.push({ label: dayName, sub: dayNum, dateStr });
    }
    return list;
  }, []);

  // ABA Pay Authorization submission - opens the authentic 5-screen payment and confirmation flow
  const handleAuthorizeABAPay = () => {
    setShowAbaPaymentFlow(true);
  };

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
      `DESCRIPTION:Table for ${res.partySize} diners at ${res.branchName}. Ref: ${res.bookingReference}.`,
      `LOCATION:${res.branchAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ABA_Table_${res.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const heroThumbnails = React.useMemo(() => {
    const all = [
      restaurant.heroImage,
      ...restaurant.galleryImages,
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80',
    ];
    const unique = Array.from(new Set(all));
    return unique.slice(0, 6);
  }, [restaurant]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-250">
        {/* Grab Handle - only on secondary steps */}
        {currentStep !== 'DETAILS' && (
          <div className="pt-2 pb-1 flex justify-center bg-white shrink-0">
            <div className="w-10 h-1 bg-neutral-300 rounded-full" />
          </div>
        )}

        {/* Top Flow Header - only on secondary steps */}
        {currentStep !== 'DETAILS' && (
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentStep !== 'SUCCESS' && (
                <button
                  onClick={() => {
                    if (currentStep === 'SLOT_SELECTION') {
                      setCurrentStep('DETAILS');
                    } else if (currentStep === 'CONFIRM_AND_PAY') {
                      setCurrentStep('SLOT_SELECTION');
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-800 cursor-pointer transition-colors shrink-0"
                  title="Back"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-neutral-900 text-base leading-tight truncate">
                  {currentStep === 'CONFIRM_AND_PAY'
                    ? 'Confirm & Pay'
                    : currentStep === 'SLOT_SELECTION'
                    ? 'Select Table & Time'
                    : 'Reservation Confirmed'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer shrink-0 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className={`flex-1 overflow-y-auto text-neutral-900 ${currentStep === 'DETAILS' ? 'p-0' : 'p-4 space-y-4'}`}>
          {/* ================= STEP: DETAILS ================= */}
          {currentStep === 'DETAILS' && (
            <div className="space-y-0 pb-4">
              {/* Toast for Share / Save Feedback */}
              {shareToast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 bg-[#002b49] text-white text-xs font-semibold rounded-full shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{shareToast}</span>
                </div>
              )}

              {/* 1. Large Hero Image with Floating Header Controls, Play Video Center, and Bottom Thumbnails Strip */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950 select-none group">
                <img
                  src={restaurant.galleryImages[activeImgIndex] || restaurant.heroImage}
                  alt={restaurant.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
                />

                {/* Subtle Top Gradient for Floating Controls Contrast */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Top Floating Controls: Back Arrow (Left), Share & Favorite (Right) */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20 pointer-events-auto">
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                    title="Back"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSaved(!isSaved);
                        setShareToast(isSaved ? 'Removed from favorites' : 'Saved to favorites');
                        setTimeout(() => setShareToast(null), 2000);
                      }}
                      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer backdrop-blur-xs"
                      title="Favorite"
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-neutral-800'}`} />
                    </button>
                  </div>
                </div>

                {/* Center Video Play Action */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareToast('Playing restaurant ambiance tour...');
                      setTimeout(() => setShareToast(null), 2200);
                      setShowGalleryModal(true);
                    }}
                    className="w-13 h-13 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/40 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                    title="Watch Video Tour"
                  >
                    <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                  </button>
                </div>

                {/* Bottom Floating Thumbnails Strip inside Hero (Inspiration layout) */}
                <div className="absolute bottom-6 left-3 right-3 z-20 pointer-events-auto">
                  <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/20 flex items-center justify-between gap-1.5 shadow-lg">
                    {heroThumbnails.map((img, idx) => {
                      const isLastWithMore = idx === 5;
                      const isCurrent = activeImgIndex === idx;

                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isLastWithMore) {
                              setShowGalleryModal(true);
                            } else {
                              setActiveImgIndex(idx);
                            }
                          }}
                          className={`relative flex-1 aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            isCurrent
                              ? 'border-white ring-2 ring-white/90 scale-105'
                              : 'border-white/30 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {isLastWithMore && (
                            <div className="absolute inset-0 bg-black/65 backdrop-blur-2xs flex items-center justify-center text-white font-bold text-xs">
                              +10
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. Overlapping White Card Sheet Container */}
              <div className="-mt-4 relative z-10 bg-white rounded-t-3xl pt-4 px-4 pb-4 space-y-3 shadow-md">
                {/* Offer Badge & Star Rating */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>10% OFF with ABA Pay</span>
                  </span>

                  <button
                    onClick={() => setDetailTab('reviews')}
                    className="flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-[#002b49] cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{restaurant.rating.toFixed(1)}</span>
                    <span className="text-neutral-400 font-normal">({restaurant.reviewCount} reviews)</span>
                  </button>
                </div>

                {/* Restaurant Name */}
                <h1 className="text-2xl font-bold font-serif text-neutral-900 tracking-tight leading-tight">
                  {restaurant.name}
                </h1>

                {/* Meta info row: duration • price • cuisine */}
                <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium">
                  <span className="flex items-center gap-1 text-neutral-700">
                    <Clock className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{selectedBranch.diningDurationMinutes || 15} min</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1 text-neutral-700">
                    <Wallet className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{restaurant.priceTier}</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1 text-neutral-700">
                    <Utensils className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{restaurant.cuisine}</span>
                  </span>
                </div>

                {/* Location with Pin */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <MapPin className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span className="truncate">{selectedBranch.address}, {selectedBranch.area}</span>
                </div>

                {/* Branch Switcher if multi-branch */}
                {restaurant.branches.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
                    <span className="text-[11px] font-semibold text-neutral-500 shrink-0">Branch:</span>
                    {restaurant.branches.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBranch(b)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                          selectedBranch.id === b.id
                            ? 'bg-[#002b49] text-white shadow-xs'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Tab Bar: About | Review */}
                <div className="flex border-b border-neutral-200 pt-1">
                  {[
                    { id: 'about', label: 'About' },
                    { id: 'reviews', label: 'Review' },
                  ].map((tab) => {
                    const isActive = detailTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setDetailTab(tab.id as 'about' | 'reviews')}
                        className={`flex-1 py-2.5 text-center text-xs font-semibold transition-all relative cursor-pointer ${
                          isActive ? 'text-[#002b49]' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#002b49] rounded-t-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT: ABOUT */}
                {detailTab === 'about' && (
                  <div className="space-y-4 pt-1">
                    {/* About Section */}
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        About
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {isDescriptionExpanded || restaurant.description.length <= 130
                          ? restaurant.description
                          : `${restaurant.description.slice(0, 130)}...`}
                        {restaurant.description.length > 130 && (
                          <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-xs font-semibold text-[#002b49] hover:underline cursor-pointer ml-1 inline-block"
                          >
                            {isDescriptionExpanded ? 'Read less' : 'Read more'}
                          </button>
                        )}
                      </p>
                    </div>

                    {/* Restaurant Contact & Official Channels */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Restaurant Contact
                      </h3>

                      {/* Official Website */}
                      <div className="p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-indigo-50 text-[#002b49] flex items-center justify-center shrink-0">
                            <Globe className="w-5 h-5 text-[#002b49]" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-neutral-900 block truncate">
                              Official Website
                            </span>
                            <span className="text-[11px] text-neutral-500 block truncate">
                              {restaurant.website || `www.${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.kh`}
                            </span>
                          </div>
                        </div>

                        <a
                          href={restaurant.website || `https://${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.kh`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-[#002b49] font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                        >
                          <span>Visit Website</span>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                        </a>
                      </div>

                      {/* Phone Number */}
                      <div className="p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Phone className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-neutral-900 block truncate">
                              Verified Phone
                            </span>
                            <span className="text-[11px] text-neutral-500 block truncate font-mono">
                              {selectedBranch.phone}
                            </span>
                          </div>
                        </div>

                        <a
                          href={`tel:${selectedBranch.phone.replace(/\s+/g, '')}`}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-200 text-[#002b49] font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                        >
                          <span>Call Branch</span>
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        </a>
                      </div>
                    </div>

                    {/* Opening Hours Section */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Opening Hours
                      </h3>
                      <div className="p-3 bg-neutral-50/80 rounded-2xl border border-neutral-200/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#002b49] shrink-0" />
                            <div>
                              <span className="font-semibold text-neutral-800 block">Today's Hours</span>
                              <span className="text-[11px] text-neutral-500">
                                {Object.values(selectedBranch.openingHours)[0] || '11:00 AM - 10:30 PM'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                            Open today
                          </span>
                        </div>

                        {/* Expandable full schedule dropdown */}
                        <button
                          onClick={() => setShowFullHours(!showFullHours)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#002b49] hover:underline cursor-pointer pt-0.5"
                        >
                          <span>{showFullHours ? 'Hide full schedule' : 'View full weekly schedule'}</span>
                          {showFullHours ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {showFullHours && (
                          <div className="pt-2 space-y-1 border-t border-neutral-200/50 mt-1">
                            {Object.entries(selectedBranch.openingHours).map(([label, times]) => (
                              <div key={label} className="flex justify-between text-[11px] py-0.5">
                                <span className="text-neutral-600 font-medium">{label}</span>
                                <span className="font-mono text-neutral-900 font-semibold">{times}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>


                    {/* Location Section */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                        Location
                      </h3>

                      {/* Compact Map Preview */}
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-200/90 shadow-2xs bg-slate-900 select-none">
                        <svg viewBox="0 0 400 160" className="w-full h-full object-cover">
                          <defs>
                            <linearGradient id="mapWaterInspo" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#002b49" />
                              <stop offset="100%" stopColor="#004373" />
                            </linearGradient>
                            <pattern id="gridInspo" width="30" height="30" patternUnits="userSpaceOnUse">
                              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.7" />
                            </pattern>
                          </defs>
                          <rect width="400" height="160" fill="#0f172a" />
                          <rect width="400" height="160" fill="url(#gridInspo)" />
                          <path d="M 330 0 Q 300 70 350 120 T 320 160 L 400 160 L 400 0 Z" fill="url(#mapWaterInspo)" opacity="0.85" />
                          <line x1="0" y1="80" x2="400" y2="80" stroke="#334155" strokeWidth="4" />
                          <line x1="190" y1="0" x2="190" y2="160" stroke="#334155" strokeWidth="5" />
                          <line x1="80" y1="0" x2="280" y2="160" stroke="#1e293b" strokeWidth="2.5" />
                          <circle cx="190" cy="80" r="20" fill="#f59e0b" fillOpacity="0.2" />
                          <circle cx="190" cy="80" r="10" fill="#f59e0b" fillOpacity="0.4" />
                        </svg>

                        {/* Pin Marker */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                          <div className="bg-[#002b49] text-white px-2.5 py-0.5 rounded-full shadow-md border border-amber-400/80 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            <span className="text-[9px] font-bold tracking-tight whitespace-nowrap">
                              {restaurant.name}
                            </span>
                          </div>
                          <div className="w-0.5 h-2 bg-amber-400 shadow-xs" />
                          <div className="w-2 h-2 rounded-full bg-amber-500 shadow ring-1 ring-white" />
                        </div>

                        <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{selectedBranch.area || restaurant.city}</span>
                        </div>
                      </div>

                      {/* Address & Actions */}
                      <div className="p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/80 space-y-2.5">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                            Address
                          </span>
                          <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                            {selectedBranch.address}, {selectedBranch.area}, {restaurant.city}
                          </p>
                          {selectedBranch.landmark && (
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              Landmark: {selectedBranch.landmark}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-200/60">
                          <button
                            onClick={() => {
                              const query = encodeURIComponent(`${restaurant.name} ${selectedBranch.address} ${restaurant.city} Cambodia`);
                              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                            }}
                            className="py-2 px-3 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
                          >
                            <Navigation className="w-3.5 h-3.5 text-[#002b49]" />
                            <span>Get directions</span>
                          </button>

                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(`${restaurant.name}, ${selectedBranch.address}, ${restaurant.city}`);
                              setAddressCopied(true);
                              setTimeout(() => setAddressCopied(false), 2000);
                            }}
                            className="py-2 px-3 rounded-lg bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-98"
                          >
                            {addressCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                                <span>Copy address</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* TAB CONTENT: REVIEWS */}
                {detailTab === 'reviews' && (
                  <div className="space-y-4 pt-1">
                    {/* Overall Rating & Breakdown Card */}
                    <div className="p-3.5 bg-neutral-50/90 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs min-w-[100px] w-full sm:w-auto text-center">
                        <span className="text-3xl font-black font-serif text-neutral-900 leading-none">
                          {restaurant.rating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-400 my-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i <= Math.round(restaurant.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-neutral-200 text-neutral-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-medium text-neutral-500">
                          {restaurant.reviewCount} reviews
                        </span>
                      </div>

                      {restaurant.ratingBreakdown && (
                        <div className="flex-1 w-full space-y-1.5">
                          {[
                            { label: 'Food & Flavor', score: restaurant.ratingBreakdown.food },
                            { label: 'Ambience', score: restaurant.ratingBreakdown.ambience },
                            { label: 'Service', score: restaurant.ratingBreakdown.service },
                            { label: 'Value', score: restaurant.ratingBreakdown.value },
                          ].map((cat) => (
                            <div key={cat.label} className="space-y-0.5">
                              <div className="flex justify-between text-[11px] font-medium text-neutral-700">
                                <span>{cat.label}</span>
                                <span className="font-bold font-mono text-neutral-900">{cat.score.toFixed(1)}</span>
                              </div>
                              <div className="w-full bg-neutral-200/70 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#002b49] h-full rounded-full transition-all duration-300"
                                  style={{ width: `${(cat.score / 5) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                      {(['ALL', 'Food', 'Ambience', 'Service'] as const).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setReviewsFilter(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            reviewsFilter === tag
                              ? 'bg-[#002b49] text-white shadow-2xs'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {tag === 'ALL' ? 'All Reviews' : tag}
                        </button>
                      ))}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-2.5">
                      {(() => {
                        const filtered = (restaurant.reviews || []).filter((r) => {
                          if (reviewsFilter === 'ALL') return true;
                          return r.tag === reviewsFilter;
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                              No reviews available for this filter.
                            </div>
                          );
                        }

                        return filtered.map((r) => (
                          <div
                            key={r.id}
                            className="p-3 bg-white rounded-xl border border-neutral-200/80 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-neutral-900">{r.authorName}</span>
                                {r.verifiedCustomer && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-neutral-400">{r.date}</span>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'
                                  }`}
                                />
                              ))}
                            </div>

                            <p className="text-xs text-neutral-600 leading-relaxed">{r.comment}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Lightbox Fullscreen Gallery Modal */}
              {showGalleryModal && (
                <div className="fixed inset-0 z-[60] bg-black/92 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 text-white border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-sm truncate max-w-[200px]">
                        {restaurant.name}
                      </span>
                      <span className="text-xs text-neutral-400">
                        ({activeImgIndex + 1} of {restaurant.galleryImages.length})
                      </span>
                    </div>
                    <button
                      onClick={() => setShowGalleryModal(false)}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative my-auto py-4">
                    <img
                      src={restaurant.galleryImages[activeImgIndex]}
                      alt=""
                      className="max-h-[62vh] max-w-full rounded-2xl object-contain shadow-2xl"
                    />

                    {restaurant.galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setActiveImgIndex(
                              (prev) => (prev - 1 + restaurant.galleryImages.length) % restaurant.galleryImages.length
                            )
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer shadow-lg"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveImgIndex((prev) => (prev + 1) % restaurant.galleryImages.length)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer shadow-lg"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Lightbox Thumbnails Strip */}
                  <div className="pt-2 pb-1 flex items-center justify-center gap-2.5 overflow-x-auto">
                    {restaurant.galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImgIndex === idx
                            ? 'border-amber-400 scale-105 ring-2 ring-amber-400/50'
                            : 'border-white/20 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 1: SLOT SELECTION (Includes Guest Counter!) ================= */}
          {currentStep === 'SLOT_SELECTION' && (
            <div className="space-y-4">
              {/* Availability or Capacity issue notice */}
              {availabilityNotice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 shadow-2xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold block">Availability Notice</span>
                    <span className="leading-relaxed">{availabilityNotice.message}</span>
                  </div>
                </div>
              )}

              {/* Inline Branch Selection if restaurant has multiple branches */}
              {restaurant.branches.length > 1 && (
                <div className="space-y-1.5 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#002b49]" /> Branch Location
                    </span>
                    <span className="text-[11px] text-neutral-500">{selectedBranch.area}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1">
                    {restaurant.branches.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBranch(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                          selectedBranch.id === b.id
                            ? 'bg-[#002b49] text-white border-[#002b49] shadow-xs'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Date Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                  1. Select Date
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {dateOptions.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        onClick={() => {
                          setSelectedDate(item.dateStr);
                          setAvailabilityNotice(null);
                        }}
                        className={`min-w-[64px] py-2 px-2 rounded-xl flex flex-col items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-[#002b49] text-white shadow-xs'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="text-[10px] font-semibold">{item.label}</span>
                        <span
                          className={`text-xs font-mono font-bold mt-0.5 ${
                            isSelected ? 'text-amber-300' : 'text-neutral-900'
                          }`}
                        >
                          {item.sub}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Number of Guests (MOVED HERE PER USER FEEDBACK!) */}
              <div className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                      2. Number of Diners
                    </label>
                    <span className="text-[11px] text-neutral-500">
                      Table sized for your party
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-neutral-200 shadow-xs">
                    <button
                      onClick={() => {
                        setPartySize((p) => Math.max(1, p - 1));
                        setAvailabilityNotice(null);
                      }}
                      className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center cursor-pointer text-sm"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sm text-[#002b49] min-w-[20px] text-center">
                      {partySize}
                    </span>
                    <button
                      onClick={() => {
                        setPartySize((p) => Math.min(12, p + 1));
                        setAvailabilityNotice(null);
                      }}
                      className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center cursor-pointer text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Time Slot Selection */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider block">
                    3. Select Time Slot
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
                        type="button"
                        onClick={() => setSlotPeriodFilter(p.id as 'all' | 'dinner' | 'lunch')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                          slotPeriodFilter === p.id
                            ? 'bg-[#002b49] text-white shadow-2xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Responsive 4-Column Time Cards matching filter style */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {displayedBranchSlots.map((s) => {
                    const isSelected = selectedTime === s.time;
                    const [hStr, mStr] = s.time.split(':');
                    const h = parseInt(hStr, 10);
                    const h12 = h % 12 || 12;
                    const sub12 = `${h12}:${mStr} ${h >= 12 ? 'PM' : 'AM'}`;

                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedTime(s.time);
                          setAvailabilityNotice(null);
                        }}
                        className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-[#002b49] text-white border-[#002b49] shadow-xs scale-[1.02]'
                            : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100 active:scale-98'
                        }`}
                      >
                        <span className="font-bold font-mono text-xs">{s.time}</span>
                        <span
                          className={`text-[10px] font-medium mt-0.5 ${
                            isSelected ? 'text-amber-300' : 'text-neutral-500'
                          }`}
                        >
                          {sub12}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Booking Policy Card - Conditional based on manual confirmation requirement */}
              <div className="rounded-2xl bg-[#fff7f0] border border-[#fde4d0] p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[10px] font-black shrink-0 leading-none shadow-2xs">
                    !
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 tracking-tight">Booking Policy</h4>
                </div>

                <div className="space-y-2.5 text-xs text-neutral-700 leading-snug">
                  {/* First policy: displayed only when restaurant requires manual confirmation */}
                  {restaurant.confirmationMethod === 'TELEGRAM_REQUEST' && (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                      <span>Confirmation from the business is required after payment.</span>
                    </div>
                  )}

                  {/* Second policy: Rescheduling window */}
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>Rescheduling is available until 2 hours before the appointment.</span>
                  </div>

                  {/* Third policy: Cancellation & full refund */}
                  <div className="flex items-start gap-2.5">
                    <Banknote className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                    <span>Full refund for cancellations within 1 hour of purchase or if the booking request is canceled.</span>
                  </div>
                </div>
              </div>

              {/* Move to Confirm & Pay Button with Capacity Validation */}
              <button
                onClick={() => {
                  const validation = validateSlot(selectedBranch, selectedTime, partySize);
                  if (!validation.valid) {
                    setAvailabilityNotice({
                      message: validation.reason || 'This slot is unavailable for your party size. Please choose an open slot.',
                      type: 'warning',
                    });
                    return;
                  }
                  setAvailabilityNotice(null);
                  setCurrentStep('CONFIRM_AND_PAY');
                }}
                className="w-full py-3 rounded-xl bg-[#002b49] hover:bg-[#003860] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Continue to Confirm & Pay</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= STEP: CONFIRM & PAY ================= */}
          {currentStep === 'CONFIRM_AND_PAY' && (
            <div className="space-y-4">
              {/* 1. Booking Details Card */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200/90 p-4 space-y-3">
                <span className="text-xs text-neutral-500 block font-medium">
                  Booking details
                </span>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={restaurant.heroImage}
                      alt={restaurant.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-neutral-200"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-neutral-900 truncate">
                        {partySize} {partySize === 1 ? 'Diner' : 'Diners'} <span className="font-normal text-neutral-400">|</span> {restaurant.name}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {seatingArea} · Guaranteed Table
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-sm text-neutral-900 font-mono">2.00 USD</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-neutral-300/80 my-1" />

                <div className="flex items-end justify-between gap-2">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-neutral-700">
                      <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="truncate font-medium">{selectedBranch.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-700">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-medium">{formatBookingDateTime(selectedDate, selectedTime)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep('SLOT_SELECTION')}
                    className="text-[#002b49] hover:underline font-bold text-xs px-2 py-1 rounded-lg hover:bg-neutral-100 cursor-pointer shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* 2. Your Contact Number Card with Inline Edit Mode */}
              <div
                className={`rounded-2xl p-3.5 transition-all ${
                  isEditingPhone
                    ? 'border-2 border-[#002b49] bg-white shadow-xs'
                    : 'bg-neutral-50 border border-neutral-200/90'
                }`}
              >
                <span className="text-[11px] font-medium text-neutral-500 block mb-1">
                  Your contact number
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                    {isEditingPhone ? (
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="012 345 678"
                        autoFocus
                        className="w-full bg-transparent text-sm font-semibold text-neutral-900 font-mono focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-neutral-900 font-mono">
                        {contactPhone || '012 345 678'}
                      </span>
                    )}
                  </div>
                  {isEditingPhone ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      className="text-[#002b49] hover:text-[#001c30] font-bold text-sm cursor-pointer shrink-0 px-2 py-0.5"
                    >
                      Done
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(true)}
                      className="text-[#002b49] hover:text-[#001c30] font-bold text-sm cursor-pointer shrink-0 px-2 py-0.5 hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Special Requests (Optional) - Clean empty field without occasion buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Special requests <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any dietary preferences, allergies, or table requests..."
                  className="w-full p-3 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1.5 focus:ring-[#002b49] focus:bg-white resize-none"
                />
              </div>

              {/* 4. Terms and Conditions Note */}
              <p className="text-[11px] text-neutral-500 text-center leading-relaxed px-2 pt-1">
                By proceeding, you agree to{' '}
                <span className="text-neutral-700 underline font-medium cursor-pointer">
                  {restaurant.name}’s Terms & Conditions
                </span>
              </p>

              {/* 5. Savings Account Selector Card */}
              <div className="bg-neutral-100 rounded-2xl p-3.5 border border-neutral-200/90 flex items-center justify-between mt-2">
                <div>
                  <h4 className="font-bold text-xs text-neutral-900">{selectedAccount.name}</h4>
                  <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                    {selectedAccount.number} <span className="text-neutral-300">|</span> {selectedAccount.currency}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAccountPicker(true)}
                  className="text-xs font-semibold text-neutral-900 flex items-center gap-1 hover:text-[#002b49] cursor-pointer"
                >
                  <span>Accounts</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
                </button>
              </div>

              {/* 6. Signature ABA Pay Button */}
              <button
                type="button"
                disabled={isAuthorizing}
                onClick={handleAuthorizeABAPay}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#002b49] hover:bg-[#003860] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-75"
              >
                {isAuthorizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing with ABA Pay...</span>
                  </>
                ) : (
                  <>
                    <span className="bg-white text-[#002b49] text-[10px] font-black px-1.5 py-0.5 rounded tracking-tight font-sans">
                      ABA' PAY
                    </span>
                    <span>Pay 2.00 USD</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ================= STEP: SUCCESS ================= */}
          {currentStep === 'SUCCESS' && confirmedReservation && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {confirmedReservation.confirmationMethod === 'INSTANT'
                    ? 'Instant Table Confirmed'
                    : 'Awaiting Store Confirmation'}
                </span>
                <h3 className="font-serif font-bold text-lg text-neutral-900 mt-2">
                  {confirmedReservation.confirmationMethod === 'INSTANT'
                    ? 'Your Table is Guaranteed!'
                    : 'Awaiting store confirmation ([15min])'}
                </h3>
                <p className="text-xs text-neutral-600 mt-1 max-w-xs mx-auto">
                  {confirmedReservation.confirmationMethod === 'INSTANT'
                    ? `We've locked your table at ${confirmedReservation.restaurantName}. Show your booking pass upon arrival.`
                    : 'We are currently waiting for the restaurant to accept your booking then we will update you'}
                </p>
              </div>

              {/* Pass Card */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-4 text-left space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <span className="text-[10px] text-neutral-500 font-semibold uppercase">Booking Reference</span>
                  <span className="font-mono font-bold text-xs text-[#002b49] bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {confirmedReservation.bookingReference}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Date</span>
                    <span className="font-bold text-neutral-900">{confirmedReservation.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Time</span>
                    <span className="font-mono font-bold text-[#002b49]">{confirmedReservation.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block">Guests</span>
                    <span className="font-bold text-neutral-900">{confirmedReservation.partySize} Diners</span>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-100 flex items-center justify-between">
                  <span>Table Status:</span>
                  <span className="font-bold text-emerald-700">Guaranteed via ABA Mobile</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleDownloadICS(confirmedReservation)}
                  className="w-full py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Add to Apple / Google Calendar (.ics)</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onViewMyBookings();
                  }}
                  className="w-full py-3 rounded-xl bg-[#002b49] hover:bg-[#003860] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <span>View in My Bookings</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar on DETAILS step */}
        {currentStep === 'DETAILS' && (
          <div className="p-3.5 pb-2 border-t border-neutral-100 bg-white/95 backdrop-blur-md shrink-0 shadow-lg">
            <button
              onClick={handleStartBooking}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#002b49] hover:bg-[#003860] active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Book a Table</span>
            </button>
            <div className="w-28 h-1 bg-neutral-300 rounded-full mx-auto mt-2" />
          </div>
        )}
      </div>

      {/* Account Selection Bottom Sheet */}
      {showAccountPicker && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-2xs flex items-end justify-center p-0 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-4 space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Select Debiting Account</h3>
                <p className="text-[11px] text-neutral-500">Choose an account to authorize table booking</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountPicker(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1 pb-3">
              {DEFAULT_ABA_ACCOUNTS.map((acc) => {
                const isSelected = selectedAccount.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setSelectedAccount(acc);
                      setShowAccountPicker(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#002b49] bg-[#002b49]/5 shadow-2xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-neutral-900">{acc.name}</p>
                      <p className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        {acc.number} · {acc.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-neutral-900 font-mono block">
                        {acc.balance}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#002b49] flex items-center gap-1 justify-end mt-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Complete 5-Screen ABA Pay & Confirmation Flow */}
      {showAbaPaymentFlow && (
        <AbaPaymentFlowModal
          restaurant={restaurant}
          branch={selectedBranch}
          date={selectedDate}
          time={selectedTime}
          partySize={partySize}
          seatingArea={seatingArea}
          contactPhone={contactPhone}
          specialRequests={specialRequests}
          currentUser={currentUser}
          amountUsd={2.0}
          onCancel={() => setShowAbaPaymentFlow(false)}
          onSuccess={(newRes) => {
            setConfirmedReservation(newRes);
            setShowAbaPaymentFlow(false);
            onBookingComplete(newRes);
            onClose();
          }}
          onViewMyBookings={() => {
            setShowAbaPaymentFlow(false);
            onClose();
            onViewMyBookings();
          }}
          onDownloadICS={(res) => handleDownloadICS(res)}
        />
      )}
    </div>
  );
};
