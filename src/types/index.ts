export type City = 'Phnom Penh' | 'Siem Reap' | 'Battambang' | 'Sihanoukville';

export type ConfirmationMethod = 'INSTANT' | 'TELEGRAM_REQUEST';

export interface TimeSlot {
  id: string;
  time: string; // e.g. "18:00", "19:30"
  period: 'lunch' | 'dinner';
  availableCapacity: number;
  maxCapacity: number;
  isPrime?: boolean;
}

export interface RestaurantReview {
  id: string;
  authorName: string;
  date: string;
  rating: number;
  comment: string;
  verifiedCustomer: boolean;
  dishRecommended?: string;
  tag?: 'Food' | 'Service' | 'Ambience' | 'Special Occasion';
}

export interface SignatureDish {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  isChefRecommendation?: boolean;
}

export interface Branch {
  id: string;
  name: string;
  area: string;
  address: string;
  phone: string;
  openingHours: Record<string, string>;
  diningDurationMinutes: number;
  slots: TimeSlot[];
  landmark?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cuisine: string;
  category: string;
  city: City;
  priceTier: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  heroImage: string;
  galleryImages: string[];
  confirmationMethod: ConfirmationMethod;
  confirmationBadgeText: string;
  confirmationDescription: string;
  requiresManualConfirmation?: boolean;
  branches: Branch[];
  isNew?: boolean;
  facilities: string[];
  policies: {
    cancellationWindowHours: number;
    gracePeriodMinutes: number;
    dressCode: string;
    holdNotice: string;
  };
  reviews?: RestaurantReview[];
  signatureDishes?: SignatureDish[];
  website?: string;
  ratingBreakdown?: {
    food: number;
    service: number;
    ambience: number;
    value: number;
  };
}

export type HoldStatus =
  | 'AUTH_PENDING'        // Authorization pending
  | 'AUTH_FAILED'         // Authorization failed
  | 'ON_HOLD'             // Reservation verified via ABA Pay
  | 'RELEASE_PENDING'     // Release pending
  | 'HOLD_RELEASED'       // Reservation status completed
  | 'NO_SHOW_PENDING'     // No-show flag pending
  | 'CAPTURED'            // No-show recorded
  | 'REFUND_PENDING'      // Refund pending
  | 'REFUNDED';           // Refunded

export type ReservationStatus =
  | 'PENDING_CONFIRMATION'  // Telegram staff reviewing within 1 hour
  | 'CONFIRMED'             // Table confirmed (instant or staff accepted)
  | 'SEATED'                // Customer checked in at restaurant
  | 'COMPLETED'             // Dining completed
  | 'CANCELLED_BY_CUSTOMER' // Customer cancelled before dining
  | 'CANCELLED_BY_MERCHANT' // Merchant cancelled
  | 'DECLINED_BY_MERCHANT'  // Telegram venue declined
  | 'REQUEST_EXPIRED'       // 1 hour response window lapsed
  | 'NO_SHOW';              // Customer failed to arrive after grace period

export interface BookingTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  abaAccountNumber: string;
}

export interface Reservation {
  id: string;
  bookingReference: string; // e.g. "ABA-PP-98241"
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  cuisine: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;
  city: City;
  date: string; // "YYYY-MM-DD"
  time: string; // "19:30"
  partySize: number;
  seatingArea: string;
  bookerName: string; // Pre-authenticated ABA customer
  bookerPhone: string;
  dinerType: 'SELF' | 'SOMEONE_ELSE';
  dinerName: string;
  dinerPhone: string;
  specialRequests?: string;
  confirmationMethod: ConfirmationMethod;
  reservationStatus: ReservationStatus;
  holdStatus: HoldStatus;
  holdAmount: number; // 2.00
  holdCurrency: 'USD';
  holdAuthCode: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // 1-hour window for Telegram requests
  cancellationReason?: string;
  rescheduledCount: number;
  timeline: BookingTimelineEvent[];
}

export interface BookingFeeTransaction {
  id: string;
  reservationId: string;
  bookingReference: string;
  restaurantName: string;
  amount: number;
  currency: 'USD';
  status: HoldStatus;
  authCode: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SearchFilterState {
  city: City;
  area: string;
  searchQuery: string;
  cuisine: string;
  priceTier: string;
  minRating: number;
  date: string;
  timeSlot: string;
  partySize?: number;
  confirmationMethod: 'ALL' | 'INSTANT' | 'TELEGRAM_REQUEST';
  selectedFacilities: string[];
  sortBy: 'recommended' | 'rating' | 'reviews' | 'priceAsc' | 'priceDesc';
}
