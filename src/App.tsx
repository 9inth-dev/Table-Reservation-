import React, { useState, useEffect, useMemo } from 'react';
import {
  Restaurant,
  Reservation,
  User,
  SearchFilterState,
  City,
} from './types';
import {
  getRestaurants,
  getReservations,
  getCurrentUser,
} from './services/storage';
import { MobileAppShell } from './components/MobileAppShell';
import { AbaMiniAppsHub } from './components/mobile/AbaMiniAppsHub';
import { TableReservationSplash } from './components/mobile/TableReservationSplash';
import { MobileDiscoverView } from './components/mobile/MobileDiscoverView';
import { MobileReservationsView } from './components/mobile/MobileReservationsView';
import { BookingFlowModal } from './components/BookingFlowModal';
import { Toast, ToastMessage } from './components/Toast';

type AppView = 'MINI_APPS_HUB' | 'SPLASH' | 'DISCOVER' | 'BOOKINGS';

export default function App() {
  // Navigation Flow: Hub -> Splash -> Discover <-> Bookings
  const [currentView, setCurrentView] = useState<AppView>('MINI_APPS_HUB');

  // Application Data States
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentUser] = useState<User>(() => getCurrentUser());

  // Search & Filter State (Preserved across screen transitions)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [filterState, setFilterState] = useState<SearchFilterState>({
    city: 'Phnom Penh',
    area: '',
    searchQuery: '',
    cuisine: 'All',
    priceTier: 'all',
    minRating: 0,
    date: todayStr,
    timeSlot: '',
    confirmationMethod: 'ALL',
    selectedFacilities: [],
    sortBy: 'recommended',
  });

  // Focused Booking Flow Sheet
  const [bookingRestaurant, setBookingRestaurant] = useState<Restaurant | null>(null);
  const [bookingInitialSlot, setBookingInitialSlot] = useState<string | undefined>(undefined);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reload data
  const reloadData = () => {
    setRestaurants(getRestaurants());
    setReservations(getReservations());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filter & Search Logic
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        // City match
        if (r.city !== filterState.city) {
          const hasBranchInCity = r.branches.some(
            (b) => b.address.toLowerCase().includes(filterState.city.toLowerCase())
          );
          if (!hasBranchInCity) return false;
        }

        // Query match
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchTagline = r.tagline.toLowerCase().includes(q);
          const matchCuisine = r.cuisine.toLowerCase().includes(q);
          const matchCategory = r.category.toLowerCase().includes(q);
          const matchBranch = r.branches.some(
            (b) => b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q)
          );
          if (!matchName && !matchTagline && !matchCuisine && !matchCategory && !matchBranch) {
            return false;
          }
        }

        // Cuisine match
        if (
          filterState.cuisine !== 'All' &&
          !r.cuisine.toLowerCase().includes(filterState.cuisine.toLowerCase())
        ) {
          return false;
        }

        // Price tier match
        if (filterState.priceTier !== 'all' && r.priceTier !== filterState.priceTier) {
          return false;
        }

        // Confirmation Method match
        if (
          filterState.confirmationMethod !== 'ALL' &&
          r.confirmationMethod !== filterState.confirmationMethod
        ) {
          return false;
        }

        // Facilities match
        if (filterState.selectedFacilities.length > 0) {
          const hasAllFacilities = filterState.selectedFacilities.every((fac) =>
            r.facilities.includes(fac)
          );
          if (!hasAllFacilities) return false;
        }

        // Time slot match
        if (filterState.timeSlot && filterState.timeSlot.trim()) {
          const hasMatchingSlot = r.branches.some((b) =>
            b.slots.some(
              (s) => s.time === filterState.timeSlot && s.availableCapacity > 0
            )
          );
          if (!hasMatchingSlot) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'rating') return b.rating - a.rating;
        if (filterState.sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        if (filterState.sortBy === 'priceAsc') return a.priceTier.length - b.priceTier.length;
        if (filterState.sortBy === 'priceDesc') return b.priceTier.length - a.priceTier.length;
        return 0; // recommended
      });
  }, [restaurants, filterState]);

  // Handle open booking flow
  const handleOpenBookingFlow = (restaurant: Restaurant, initialSlotTime?: string) => {
    setBookingRestaurant(restaurant);
    setBookingInitialSlot(initialSlotTime);
  };

  const handleBookingConfirmed = (confirmedRes: Reservation) => {
    reloadData();
    addToast(
      confirmedRes.confirmationMethod === 'INSTANT'
        ? `Table confirmed at ${confirmedRes.restaurantName}! Ref: ${confirmedRes.bookingReference}`
        : `Request sent to ${confirmedRes.restaurantName}! Staff response within 1 hour.`,
      'success'
    );
  };

  // Active bookings count for badge on top-right icon
  const activeBookingsCount = useMemo(() => {
    return reservations.filter(
      (r) =>
        r.reservationStatus === 'CONFIRMED' ||
        r.reservationStatus === 'PENDING_CONFIRMATION' ||
        r.reservationStatus === 'SEATED'
    ).length;
  }, [reservations]);

  return (
    <>
      <MobileAppShell
        currentUser={currentUser}
        onBackToMiniAppsHub={() => setCurrentView('MINI_APPS_HUB')}
      >
        {/* Screen 1: ABA Mini Apps Catalog Hub */}
        {currentView === 'MINI_APPS_HUB' && (
          <AbaMiniAppsHub
            onOpenTableReservation={() => setCurrentView('SPLASH')}
          />
        )}

        {/* Screen 2: Dedicated Table Reservation Splash Screen */}
        {currentView === 'SPLASH' && (
          <TableReservationSplash
            onFindTable={() => setCurrentView('DISCOVER')}
            onBackToHub={() => setCurrentView('MINI_APPS_HUB')}
          />
        )}

        {/* Screen 3: Discover Homepage (No bottom nav, top-right My Bookings icon) */}
        {currentView === 'DISCOVER' && (
          <MobileDiscoverView
            restaurants={filteredRestaurants}
            allRestaurants={restaurants}
            filterState={filterState}
            setFilterState={setFilterState}
            onSelectRestaurant={handleOpenBookingFlow}
            onOpenMyBookings={() => setCurrentView('BOOKINGS')}
            onBackToMiniAppsHub={() => setCurrentView('MINI_APPS_HUB')}
            bookingCount={activeBookingsCount}
          />
        )}

        {/* Screen 4: My Bookings Screen (Back to Discover seamlessly) */}
        {currentView === 'BOOKINGS' && (
          <MobileReservationsView
            reservations={reservations}
            currentUser={currentUser}
            onRefresh={reloadData}
            onShowToast={addToast}
            onExploreTables={() => setCurrentView('DISCOVER')}
          />
        )}
      </MobileAppShell>

      {/* Connected Unified Booking Flow (Step 1 -> Step 2 -> Step 3 Review & Confirmation -> ABA Pay PIN -> Success) */}
      {bookingRestaurant && (
        <BookingFlowModal
          restaurant={bookingRestaurant}
          initialSlotTime={bookingInitialSlot}
          initialDate={filterState.date}
          currentUser={currentUser}
          onClose={() => {
            setBookingRestaurant(null);
            setBookingInitialSlot(undefined);
          }}
          onBookingComplete={handleBookingConfirmed}
          onViewMyBookings={() => {
            setBookingRestaurant(null);
            setBookingInitialSlot(undefined);
            setCurrentView('BOOKINGS');
          }}
        />
      )}

      {/* Toast Feedback */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
