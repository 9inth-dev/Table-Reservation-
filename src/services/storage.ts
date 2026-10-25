import {
  Restaurant,
  Reservation,
  BookingFeeTransaction,
  User,
  City,
  HoldStatus,
  ReservationStatus,
  ConfirmationMethod,
} from '../types';
import { INITIAL_RESTAURANTS } from '../data/seedRestaurants';

const STORAGE_KEYS = {
  RESTAURANTS: 'aba_tra_restaurants_v4',
  RESERVATIONS: 'aba_tra_reservations_v4',
  TRANSACTIONS: 'aba_tra_transactions_v4',
  CURRENT_USER: 'aba_tra_user_v4',
};

// Authenticated ABA Mobile Customer
export const DEFAULT_ABA_USER: User = {
  id: 'aba-usr-8890',
  name: 'Sokha Meng',
  phone: '+855 12 889 900',
  email: 'sokha.meng@aba.com.kh',
  abaAccountNumber: '001 842 4821',
};

// Helper to seed initial reservations for immediate rich experience
function getInitialReservations(): Reservation[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const inThreeDays = new Date(today);
  inThreeDays.setDate(today.getDate() + 3);
  const inThreeDaysStr = inThreeDays.toISOString().split('T')[0];

  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 5);
  const pastDateStr = pastDate.toISOString().split('T')[0];

  return [
    {
      id: 'res-init-1',
      bookingReference: 'ABA-PP-9824',
      restaurantId: 'rest-malis-pp',
      restaurantName: 'Malis Restaurant',
      restaurantImage: '/src/assets/images/khmer_fine_dining_1792409398233.jpg',
      cuisine: 'Royal Khmer Heritage',
      branchId: 'malis-bkk1',
      branchName: 'Norodom Boulevard (Main)',
      branchAddress: 'No. 136 Norodom Blvd, Phnom Penh',
      branchPhone: '+855 15 814 888',
      city: 'Phnom Penh',
      date: tomorrowStr,
      time: '19:30',
      partySize: 2,
      seatingArea: 'Lotus Pond Courtyard',
      bookerName: DEFAULT_ABA_USER.name,
      bookerPhone: DEFAULT_ABA_USER.phone,
      dinerType: 'SELF',
      dinerName: DEFAULT_ABA_USER.name,
      dinerPhone: DEFAULT_ABA_USER.phone,
      specialRequests: 'Quiet table near water lily pond if available',
      confirmationMethod: 'INSTANT',
      reservationStatus: 'CONFIRMED',
      holdStatus: 'ON_HOLD',
      holdAmount: 2.0,
      holdCurrency: 'USD',
      holdAuthCode: 'AUTH_ABA_92819',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      rescheduledCount: 0,
      timeline: [
        {
          id: 'tl-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Table Reservation Confirmed',
          description: 'Reservation confirmed from ABA Account •••• 4821',
          type: 'info',
        },
        {
          id: 'tl-2',
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Instant Table Confirmed',
          description: 'Reservation synced with Malis venue schedule. Digital pass ready.',
          type: 'success',
        },
      ],
    },
    {
      id: 'res-init-2',
      bookingReference: 'ABA-PP-4102',
      restaurantId: 'rest-sushilab-pp',
      restaurantName: 'Sushi Lab Omakase',
      restaurantImage: '/src/assets/images/restaurant_omakase_sushi_1792022892025.jpg',
      cuisine: 'Japanese Omakase',
      branchId: 'sushilab-bkk1',
      branchName: 'Street 302 Counter',
      branchAddress: 'No. 29 Street 302, Boeng Keng Kang 1, Phnom Penh',
      branchPhone: '+855 96 220 9988',
      city: 'Phnom Penh',
      date: inThreeDaysStr,
      time: '18:00',
      partySize: 2,
      seatingArea: 'Hinoki Chef Counter',
      bookerName: DEFAULT_ABA_USER.name,
      bookerPhone: DEFAULT_ABA_USER.phone,
      dinerType: 'SELF',
      dinerName: DEFAULT_ABA_USER.name,
      dinerPhone: DEFAULT_ABA_USER.phone,
      specialRequests: 'No shellfish if possible',
      confirmationMethod: 'TELEGRAM_REQUEST',
      reservationStatus: 'PENDING_CONFIRMATION',
      holdStatus: 'ON_HOLD',
      holdAmount: 2.0,
      holdCurrency: 'USD',
      holdAuthCode: 'AUTH_ABA_77102',
      createdAt: new Date(Date.now() - 1200000).toISOString(),
      updatedAt: new Date(Date.now() - 1200000).toISOString(),
      expiresAt: new Date(Date.now() + 2400000).toISOString(), // ~40m left
      rescheduledCount: 0,
      timeline: [
        {
          id: 'tl-1',
          timestamp: '20 mins ago',
          title: 'Booking Request Submitted',
          description: 'Dispatched to Sushi Lab staff Telegram channel. Response expected within 1 hour.',
          type: 'info',
        },
        {
          id: 'tl-2',
          timestamp: '20 mins ago',
          title: 'Table Reservation Confirmed',
          description: 'Reservation requested pending venue response.',
          type: 'info',
        },
      ],
    },
    {
      id: 'res-init-3',
      bookingReference: 'ABA-SR-1904',
      restaurantId: 'rest-damnak-sr',
      restaurantName: 'Cuisine Wat Damnak',
      restaurantImage: '/src/assets/images/khmer_fine_dining_1792409398233.jpg',
      cuisine: 'Modern Khmer Degustation',
      branchId: 'damnak-main',
      branchName: 'Wat Damnak Village',
      branchAddress: 'Between Psa Dey Hoy and Angkor High School, Siem Reap',
      branchPhone: '+855 77 347 762',
      city: 'Siem Reap',
      date: pastDateStr,
      time: '19:00',
      partySize: 2,
      seatingArea: 'Garden Pavilion',
      bookerName: DEFAULT_ABA_USER.name,
      bookerPhone: DEFAULT_ABA_USER.phone,
      dinerType: 'SELF',
      dinerName: DEFAULT_ABA_USER.name,
      dinerPhone: DEFAULT_ABA_USER.phone,
      confirmationMethod: 'INSTANT',
      reservationStatus: 'COMPLETED',
      holdStatus: 'HOLD_RELEASED',
      holdAmount: 2.0,
      holdCurrency: 'USD',
      holdAuthCode: 'AUTH_ABA_33910',
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 100).toISOString(),
      rescheduledCount: 0,
      timeline: [
        {
          id: 'tl-1',
          timestamp: '5 days ago',
          title: 'Table Confirmed',
          description: 'Table reservation confirmed via ABA Mobile.',
          type: 'success',
        },
        {
          id: 'tl-2',
          timestamp: '5 days ago',
          title: 'Checked in at Restaurant',
          description: 'Guest arrived and seated.',
          type: 'success',
        },
      ],
    },
  ];
}

// Read/Write Restaurants
export function getRestaurants(): Restaurant[] {
  const cached = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(INITIAL_RESTAURANTS));
  return INITIAL_RESTAURANTS;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return getRestaurants().find((r) => r.id === id);
}

// Current User (Pre-authenticated ABA Mobile Customer)
export function getCurrentUser(): User {
  const cached = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_ABA_USER));
  return DEFAULT_ABA_USER;
}

// Read/Write Reservations
export function getReservations(): Reservation[] {
  const cached = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fallback
    }
  }
  const initial = getInitialReservations();
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(initial));
  return initial;
}

export function saveReservations(list: Reservation[]): void {
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(list));
}

export function getTransactions(): BookingFeeTransaction[] {
  const reservations = getReservations();
  return reservations.map((r) => ({
    id: `tx-${r.id}`,
    reservationId: r.id,
    bookingReference: r.bookingReference,
    restaurantName: r.restaurantName,
    amount: r.holdAmount,
    currency: r.holdCurrency,
    status: r.holdStatus,
    authCode: r.holdAuthCode,
    paymentMethod: `ABA Pay (Account ${DEFAULT_ABA_USER.abaAccountNumber})`,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    notes:
      r.holdStatus === 'HOLD_RELEASED'
        ? 'Hold released upon dining completion / timely cancellation'
        : r.holdStatus === 'ON_HOLD'
        ? 'Active table reservation'
        : 'Hold settled',
  }));
}

// Create new reservation via ABA Pay Hold authorization
export function createNewReservation(params: {
  restaurant: Restaurant;
  branch: { id: string; name: string; address: string; phone: string };
  date: string;
  time: string;
  partySize: number;
  seatingArea: string;
  dinerType: 'SELF' | 'SOMEONE_ELSE';
  dinerName: string;
  dinerPhone: string;
  specialRequests?: string;
}): Reservation {
  const reservations = getReservations();
  const randomRefNum = Math.floor(1000 + Math.random() * 9000);
  const cityCode = params.restaurant.city === 'Siem Reap' ? 'SR' : params.restaurant.city === 'Battambang' ? 'BTB' : params.restaurant.city === 'Sihanoukville' ? 'SHV' : 'PP';
  const bookingReference = `ABA-${cityCode}-${randomRefNum}`;
  const now = new Date();
  const authCode = `AUTH_ABA_${Math.floor(10000 + Math.random() * 90000)}`;

  const isTelegram = params.restaurant.confirmationMethod === 'TELEGRAM_REQUEST';
  const reservationStatus: ReservationStatus = isTelegram ? 'PENDING_CONFIRMATION' : 'CONFIRMED';
  const expiresAt = isTelegram ? new Date(now.getTime() + 60 * 60 * 1000).toISOString() : undefined;

  const newReservation: Reservation = {
    id: `res-${Date.now()}`,
    bookingReference,
    restaurantId: params.restaurant.id,
    restaurantName: params.restaurant.name,
    restaurantImage: params.restaurant.heroImage,
    cuisine: params.restaurant.cuisine,
    branchId: params.branch.id,
    branchName: params.branch.name,
    branchAddress: params.branch.address,
    branchPhone: params.branch.phone,
    city: params.restaurant.city,
    date: params.date,
    time: params.time,
    partySize: params.partySize,
    seatingArea: params.seatingArea,
    bookerName: DEFAULT_ABA_USER.name,
    bookerPhone: DEFAULT_ABA_USER.phone,
    dinerType: params.dinerType,
    dinerName: params.dinerName,
    dinerPhone: params.dinerPhone,
    specialRequests: params.specialRequests,
    confirmationMethod: params.restaurant.confirmationMethod,
    reservationStatus,
    holdStatus: 'ON_HOLD',
    holdAmount: 2.0,
    holdCurrency: 'USD',
    holdAuthCode: authCode,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt,
    rescheduledCount: 0,
    timeline: [
      {
        id: `tl-auth-${Date.now()}`,
        timestamp: 'Just now',
        title: 'Table Reservation Confirmed',
        description: `Authorization code ${authCode} placed on account ${DEFAULT_ABA_USER.abaAccountNumber}`,
        type: 'info',
      },
      {
        id: `tl-stat-${Date.now()}`,
        timestamp: 'Just now',
        title: isTelegram ? 'Request Dispatched via Telegram' : 'Table Instantly Confirmed',
        description: isTelegram
          ? 'Venue host has 60 minutes to review and accept your table request.'
          : 'Table guaranteed. Digital table pass active in My Bookings.',
        type: 'success',
      },
    ],
  };

  const updatedList = [newReservation, ...reservations];
  saveReservations(updatedList);
  return newReservation;
}

// Cancel reservation by customer
export function cancelReservation(
  reservationId: string,
  reason: string = 'Cancelled by diner in ABA MiniApp'
): { success: boolean; released: boolean; message: string } {
  const reservations = getReservations();
  const idx = reservations.findIndex((r) => r.id === reservationId);
  if (idx === -1) {
    return { success: false, released: false, message: 'Reservation not found.' };
  }

  const res = reservations[idx];

  // If already cancelled or completed
  if (
    res.reservationStatus === 'CANCELLED_BY_CUSTOMER' ||
    res.reservationStatus === 'CANCELLED_BY_MERCHANT' ||
    res.reservationStatus === 'COMPLETED'
  ) {
    return { success: false, released: false, message: 'Reservation cannot be cancelled in its current state.' };
  }

  // Determine if cancelled before cutoff (e.g. pending request or > 24 hours prior)
  const isPending = res.reservationStatus === 'PENDING_CONFIRMATION';
  const resDateTime = new Date(`${res.date}T${res.time}`);
  const hoursUntil = (resDateTime.getTime() - Date.now()) / (1000 * 60 * 60);

  const isEligibleForFullRelease = isPending || hoursUntil >= 24;

  res.reservationStatus = 'CANCELLED_BY_CUSTOMER';
  res.cancellationReason = reason;
  res.updatedAt = new Date().toISOString();

  if (isEligibleForFullRelease) {
    res.holdStatus = 'HOLD_RELEASED';
    res.timeline.push({
      id: `tl-cancel-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Reservation Cancelled',
      description: 'Cancelled on time. Table released.',
      type: 'info',
    });
  } else {
    // Within cutoff penalty per terms
    res.holdStatus = 'CAPTURED';
    res.timeline.push({
      id: `tl-cancel-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Reservation Cancelled - Late Notice',
      description: 'Cancelled per restaurant cancellation policy.',
      type: 'warning',
    });
  }

  reservations[idx] = res;
  saveReservations(reservations);

  return {
    success: true,
    released: isEligibleForFullRelease,
    message: isEligibleForFullRelease
      ? 'Reservation cancelled.'
      : 'Reservation cancelled per late cancellation policy.',
  };
}

// Prototype simulation helper: simulates restaurant accepting or declining Telegram request
export function simulateMerchantDecision(
  reservationId: string,
  action: 'ACCEPT' | 'DECLINE'
): Reservation | null {
  const reservations = getReservations();
  const idx = reservations.findIndex((r) => r.id === reservationId);
  if (idx === -1) return null;

  const res = reservations[idx];
  if (res.reservationStatus !== 'PENDING_CONFIRMATION') return res;

  if (action === 'ACCEPT') {
    res.reservationStatus = 'CONFIRMED';
    res.updatedAt = new Date().toISOString();
    res.timeline.push({
      id: `tl-acc-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Restaurant Accepted Request',
      description: 'Host confirmed table availability via Telegram staff portal.',
      type: 'success',
    });
  } else {
    res.reservationStatus = 'DECLINED_BY_MERCHANT';
    res.holdStatus = 'HOLD_RELEASED';
    res.updatedAt = new Date().toISOString();
    res.timeline.push({
      id: `tl-dec-${Date.now()}`,
      timestamp: 'Just now',
      title: 'Request Declined by Restaurant',
      description: 'Restaurant was fully booked at requested time.',
      type: 'alert',
    });
  }

  reservations[idx] = res;
  saveReservations(reservations);
  return res;
}

// Reschedule reservation enforcing all business rules
export function rescheduleReservation(params: {
  reservationId: string;
  newDate: string;
  newTime: string;
  newPartySize?: number;
}): { success: boolean; message: string; updatedReservation?: Reservation } {
  const reservations = getReservations();
  const idx = reservations.findIndex((r) => r.id === params.reservationId);
  if (idx === -1) {
    return { success: false, message: 'Reservation not found.' };
  }
  const res = reservations[idx];

  if (res.reservationStatus !== 'CONFIRMED' && res.reservationStatus !== 'PENDING_CONFIRMATION') {
    return { success: false, message: 'Only active reservations can be rescheduled.' };
  }

  if (res.rescheduledCount >= 1) {
    return { success: false, message: 'Maximum 1 reschedule permitted per reservation.' };
  }

  const now = new Date();
  const originalDateTime = new Date(`${res.date}T${res.time}`);
  if (now >= originalDateTime) {
    return { success: false, message: 'Rescheduling is only allowed before original reservation time.' };
  }

  const newDateTime = new Date(`${params.newDate}T${params.newTime}`);
  const hoursUntilNewTime = (newDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilNewTime < 2) {
    return { success: false, message: 'Rescheduling must be at least 2 hours before the new requested time.' };
  }

  const prevDate = res.date;
  const prevTime = res.time;

  res.date = params.newDate;
  res.time = params.newTime;
  if (params.newPartySize) res.partySize = params.newPartySize;
  res.rescheduledCount = (res.rescheduledCount || 0) + 1;
  res.updatedAt = new Date().toISOString();

  res.timeline.push({
    id: `tl-resched-${Date.now()}`,
    timestamp: 'Just now',
    title: 'Table Rescheduled',
    description: `Rescheduled from ${prevDate} ${prevTime} to ${params.newDate} ${params.newTime}. Reservation transferred to new slot.`,
    type: 'info',
  });

  reservations[idx] = res;
  saveReservations(reservations);

  return {
    success: true,
    message: `Rescheduled to ${params.newDate} at ${params.newTime}!`,
    updatedReservation: res,
  };
}

