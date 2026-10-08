import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hireApi from '../services/hireApi';
import LeafletRouteMap from '../components/Common/LeafletRouteMap';
import {
  CheckCircle, Clock, MapPin, Calendar, User, Phone, ShieldCheck, RefreshCw,
  Share2, AlertTriangle, FileText, RotateCcw, Download, Check, Navigation, Car, LogIn
} from 'lucide-react';
import './PreviousHirePage.css';

// Interactive Live OpenStreetMap Leaflet Route Component
const LiveRouteMap = ({ pickup, dropoff, distance, pickupCoords, dropoffCoords }) => {
  return (
    <div className="live-route-map-card" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <LeafletRouteMap
        pickupLocation={pickup || 'Bandaranaike International Airport (CMB)'}
        dropoffLocation={dropoff || 'Kandy City Center'}
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        distance={distance}
        height="220px"
        theme="light"
        interactive={false}
      />
    </div>
  );
};

const PreviousHirePage = () => {
  const navigate = useNavigate();
  const { user, userHires, openAuthModal } = useAuth();
  const [filterTab, setFilterTab] = useState('All');

  // Dispatched booking state synced with Super Admin actions
  const [dispatchedData, setDispatchedData] = useState(() => {
    try {
      const cached = localStorage.getItem('deno_latest_dispatched_hire');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Current active user's bookings list (Strictly user-isolated)
  const allUserHires = user ? (userHires || []) : [];

  // Listen for real-time dispatch updates for this specific user & poll MongoDB every 3s
  useEffect(() => {
    const syncLiveDispatched = (e) => {
      if (e?.detail) {
        setDispatchedData(e.detail);
      } else {
        try {
          const cached = localStorage.getItem('deno_latest_dispatched_hire');
          if (cached) setDispatchedData(JSON.parse(cached));
        } catch {}
      }
    };

    window.addEventListener('deno_user_hires_updated', syncLiveDispatched);
    window.addEventListener('deno_dispatch_updated', syncLiveDispatched);
    window.addEventListener('storage', syncLiveDispatched);

    // Live query from MongoDB backend scoped strictly to current user's email
    const fetchLatestBooking = async () => {
      if (!user?.email) return;
      try {
        const res = await hireApi.getLatestBooking(user.email);
        if (res?.data) {
          setDispatchedData(res.data);
        }
      } catch (err) {
        // Fallback to local storage
      }
    };

    fetchLatestBooking();
    const interval = setInterval(fetchLatestBooking, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('deno_user_hires_updated', syncLiveDispatched);
      window.removeEventListener('deno_dispatch_updated', syncLiveDispatched);
      window.removeEventListener('storage', syncLiveDispatched);
    };
  }, [user]);

  // IMPORTANT: The latest booking booked by this user is at allUserHires[0]
  const hasBookings = allUserHires && allUserHires.length > 0;
  const rawHire = hasBookings ? allUserHires[0] : null;

  // Check if dispatchedData strictly belongs to THIS rawHire or user
  const matchesDispatched = Boolean(
    dispatchedData && (
      (rawHire && (
        (dispatchedData.id && String(dispatchedData.id).replace('#', '') === String(rawHire.id || rawHire.ref).replace('#', '')) ||
        (dispatchedData.ref && (dispatchedData.ref === rawHire.ref || dispatchedData.ref === rawHire.id))
      )) ||
      (user?.email && (
        (dispatchedData.email && dispatchedData.email.toLowerCase() === user.email.toLowerCase()) ||
        (dispatchedData.contactEmail && dispatchedData.contactEmail.toLowerCase() === user.email.toLowerCase())
      ))
    )
  );

  // Check if cancelled by Super Admin
  const isCancelled = Boolean(
    (rawHire?.status && rawHire.status.toLowerCase().includes('cancel')) ||
    (matchesDispatched && dispatchedData?.status && dispatchedData.status.toLowerCase().includes('cancel')) ||
    (matchesDispatched && dispatchedData?.badgeType === 'cancelled')
  );

  // Check if completed
  const isCompleted = Boolean(
    !isCancelled && (
      (rawHire?.status && rawHire.status.toLowerCase().includes('complete')) ||
      (matchesDispatched && dispatchedData?.status && dispatchedData.status.toLowerCase().includes('complete')) ||
      rawHire?.paymentStatus === 'Paid' ||
      dispatchedData?.paymentStatus === 'Paid'
    )
  );

  // Determine if booking has been confirmed & dispatched by Super Admin
  const isDispatched = Boolean(
    !isCancelled && (
      isCompleted ||
      (rawHire && (
        rawHire.dispatchConfirmed ||
        rawHire.assignedDriverName ||
        (rawHire.status && (
          rawHire.status.toLowerCase().includes('confirm') || 
          rawHire.status.toLowerCase().includes('active') ||
          rawHire.status.toLowerCase().includes('dispatch')
        ))
      )) ||
      (matchesDispatched && (
        dispatchedData.dispatchConfirmed ||
        dispatchedData.assignedDriverName ||
        (dispatchedData.status && (
          dispatchedData.status.toLowerCase().includes('confirm') || 
          dispatchedData.status.toLowerCase().includes('active') ||
          dispatchedData.status.toLowerCase().includes('dispatch')
        ))
      ))
    )
  );

  const activeBooking = rawHire ? {
    ...rawHire,
    ...(matchesDispatched && dispatchedData ? dispatchedData : {}),
    ...(rawHire.assignedDriverName ? rawHire : {})
  } : (matchesDispatched && dispatchedData ? dispatchedData : null);

  const bookingId = activeBooking ? (activeBooking.ref || (activeBooking.id ? (activeBooking.id.startsWith('#') ? activeBooking.id : `#${activeBooking.id}`) : '#DENO-000-000-001')) : '';
  const driverName = activeBooking?.assignedDriverName || activeBooking?.driverName || (isDispatched ? 'Dinusha Chandima' : '');
  const driverId = activeBooking?.assignedDriverId || activeBooking?.driverId || (isDispatched ? 'DENO-DRV-0000001' : '');
  const driverPhone = activeBooking?.assignedDriverPhone || activeBooking?.driverPhone || (isDispatched ? '+94 77 458 5471' : '');
  const vehiclePlate = activeBooking?.assignedVehicleNumber || (activeBooking?.vehiclePlate && activeBooking?.vehiclePlate !== 'Pending Allocation' ? activeBooking.vehiclePlate : (isDispatched ? 'WP CAB - 8829' : 'Pending Allocation'));
  const vehicleColor = activeBooking?.assignedVehicleColor || activeBooking?.vehicleColor || 'Pearl Metallic Black';
  const vehicleModel = activeBooking?.assignedAssetPreview || activeBooking?.vehicle || activeBooking?.vehicleModel || 'Toyota Land Cruiser V8';
  const assetCode = activeBooking?.assignedAssetCode || '#V8-EXEC-01';
  const dispatchedAt = activeBooking?.dispatchedAt || ('Today, ' + (activeBooking?.updatedAt ? new Date(activeBooking.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:45 AM'));

  // Trip completion action handler
  const [isCompletingTrip, setIsCompletingTrip] = useState(false);

  const handleMarkTripCompleted = async () => {
    if (!activeBooking) return;
    setIsCompletingTrip(true);

    const bookingRefOrId = activeBooking.ref || activeBooking.id || activeBooking.bookingId;
    const completedTimestamp = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const completedPayload = {
      ...activeBooking,
      status: 'Completed',
      paymentStatus: 'Paid',
      badgeType: 'completed',
      completedAt: completedTimestamp,
      dispatchedAt: activeBooking.dispatchedAt || completedTimestamp,
      dispatchConfirmed: true,
      statusCode: 'completed'
    };

    // 1. Update MongoDB backend
    try {
      await hireApi.updateStatus(bookingRefOrId, 'Completed');
    } catch (err) {
      console.warn('Backend updateStatus note:', err.message);
    }

    // 2. Sync localStorage ledgers
    try {
      const savedLedger = localStorage.getItem('deno_all_hires_ledger') || localStorage.getItem('deno_dispatch_bookings');
      let ledger = savedLedger ? JSON.parse(savedLedger) : [];
      let foundIndex = ledger.findIndex(
        (h) => h.id === activeBooking.id || h.ref === activeBooking.ref || (h.id && activeBooking.id && String(h.id).replace('#', '') === String(activeBooking.id).replace('#', ''))
      );

      if (foundIndex !== -1) {
        ledger[foundIndex] = { ...ledger[foundIndex], ...completedPayload };
      } else {
        ledger = [completedPayload, ...ledger];
      }

      localStorage.setItem('deno_all_hires_ledger', JSON.stringify(ledger));
      localStorage.setItem('deno_dispatch_bookings', JSON.stringify(ledger));
      localStorage.setItem('deno_latest_dispatched_hire', JSON.stringify(completedPayload));

      if (user?.email) {
        const userHiresKey = `deno_user_hires_${user.email.toLowerCase().trim()}`;
        const userSaved = localStorage.getItem(userHiresKey);
        let userList = userSaved ? JSON.parse(userSaved) : [];
        const uIdx = userList.findIndex((h) => h.id === activeBooking.id || h.ref === activeBooking.ref);
        if (uIdx !== -1) {
          userList[uIdx] = { ...userList[uIdx], ...completedPayload };
        } else {
          userList = [completedPayload, ...userList];
        }
        localStorage.setItem(userHiresKey, JSON.stringify(userList));
        localStorage.setItem('deno_user_hires', JSON.stringify(userList));
      }

      window.dispatchEvent(new CustomEvent('deno_user_hires_updated', { detail: completedPayload }));
      window.dispatchEvent(new CustomEvent('deno_dispatch_updated', { detail: completedPayload }));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error updating completed booking:', e);
    }

    setDispatchedData(completedPayload);
    setIsCompletingTrip(false);
  };

  const getColorHex = (color = '') => {
    const c = color.toLowerCase();
    if (c.includes('white')) return '#ffffff';
    if (c.includes('silver')) return '#94a3b8';
    if (c.includes('blue') || c.includes('navy')) return '#0284c7';
    if (c.includes('gold')) return '#ffb800';
    if (c.includes('grey') || c.includes('gray')) return '#64748b';
    if (c.includes('red')) return '#ef4444';
    return '#0f172a';
  };

  // User-scoped history list (strictly this user's bookings only!)
  const userHistoryList = allUserHires.map((item, idx) => {
    const isItemCancelled = Boolean(
      (item.status && item.status.toLowerCase().includes('cancel')) ||
      (matchesDispatched && dispatchedData?.status && dispatchedData.status.toLowerCase().includes('cancel') && (item.id === rawHire?.id || item.ref === rawHire?.ref))
    );

    const isItemCompleted = Boolean(
      !isItemCancelled && (
        (item.status && item.status.toLowerCase().includes('complete')) ||
        (matchesDispatched && dispatchedData?.status && dispatchedData.status.toLowerCase().includes('complete') && (item.id === rawHire?.id || item.ref === rawHire?.ref)) ||
        item.paymentStatus === 'Paid'
      )
    );

    const isConfirmed = !isItemCancelled && (
      isItemCompleted ||
      Boolean(
        item.dispatchConfirmed || 
        (matchesDispatched && dispatchedData?.dispatchConfirmed && (item.id === rawHire?.id || item.ref === rawHire?.ref))
      )
    );

    const displayStatus = isItemCancelled 
      ? 'Cancelled'
      : isItemCompleted
      ? 'Completed'
      : isConfirmed 
      ? 'Confirmed & Dispatched' 
      : 'Pending Approval';

    const assignedDName = item.assignedDriverName || (matchesDispatched && dispatchedData?.assignedDriverName) || 'Dinusha Chandima';
    const assignedDId = item.assignedDriverId || (matchesDispatched && dispatchedData?.assignedDriverId) || 'DENO-DRV-0000001';

    const paddedIdx = String(idx + 1).padStart(9, '0');
    const fallbackId = `#DENO-${paddedIdx.slice(0, 3)}-${paddedIdx.slice(3, 6)}-${paddedIdx.slice(6, 9)}`;

    return {
      id: item.ref || (item.id ? (item.id.startsWith('#') ? item.id : `#${item.id}`) : fallbackId),
      vehicle: item.assignedAssetPreview || item.vehicle || item.vehicleModel || 'Executive Luxury Fleet',
      status: displayStatus,
      statusCode: isItemCancelled ? 'cancelled' : isItemCompleted ? 'completed' : isConfirmed ? 'active' : 'pending',
      pickupLocation: item.pickupLocation || 'Colombo 03',
      dropoffLocation: item.dropoffLocation || 'Kandy City',
      date: item.hireDate || item.scheduleDate || 'Today',
      driver: isItemCancelled
        ? 'Cancelled by Super Admin'
        : isConfirmed 
        ? `${assignedDName} (ID: ${assignedDId})` 
        : 'Pending Super Admin Allocation',
      fare: item.estimatedFare || (typeof item.totalLKR === 'number' ? `LKR ${item.totalLKR.toLocaleString()}` : 'LKR 45,000')
    };
  });

  const filteredHistory = userHistoryList.filter(item => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Completed') return item.statusCode === 'completed';
    if (filterTab === 'Pending') return item.statusCode === 'pending' || item.statusCode === 'active';
    if (filterTab === 'Cancelled') return item.statusCode === 'cancelled';
    return true;
  });

  const totalCompleted = userHistoryList.filter(i => i.statusCode === 'completed').length;
  const totalPending = userHistoryList.filter(i => i.statusCode === 'pending' || i.statusCode === 'active').length;
  const totalCancelled = userHistoryList.filter(i => i.statusCode === 'cancelled').length;

  return (
    <div className="prev-hire-page-container">
      <div className="prev-hire-inner-wrapper">
        
        {/* Page Top Header Bar */}
        <div className="prev-hire-top-header">
          <div>
            <span className="prev-hire-hub-badge">● VIP DISPATCH & LOGISTICS HUB</span>
            <h1 className="prev-hire-main-title">Booking Hire Status & Management</h1>
            <p className="prev-hire-subtitle">
              Track your active hire progress in real-time and review your private hire history.
            </p>
          </div>
          <div className="prev-hire-header-actions">
            <span className="escort-active-pill">
              📍 Live Escort Support Active
            </span>
          </div>
        </div>

        {/* 1. TOP SECTION */}
        {!user ? (
          // Guest State (Not Logged In)
          <div className="prev-hire-guest-card">
            <div className="empty-top-icon-badge">
              <ShieldCheck size={36} color="#d97706" />
            </div>
            <h2>Private VIP Dispatch Ledger</h2>
            <p>
              Please sign in or create an account to view your active chauffeur hire status, live vehicle telemetry, and personal booking history.
            </p>
            <button className="empty-book-hire-btn" onClick={() => openAuthModal('login')}>
              <LogIn size={18} /> Sign In / Register to Access Hires ➔
            </button>
          </div>
        ) : !hasBookings ? (
          // User Logged In but has 0 bookings
          <div className="prev-hire-empty-top-card">
            <div className="empty-top-icon-badge">
              <Car size={36} color="#d97706" />
            </div>
            <h2>No Active Chauffeur Bookings</h2>
            <p>
              Welcome, <strong>{user.fullName}</strong>! You currently have no active chauffeur bookings registered under <strong>{user.email}</strong>. Select your preferred luxury vehicle and book your first executive journey across Sri Lanka.
            </p>
            <button className="empty-book-hire-btn" onClick={() => navigate('/hire')}>
              <Navigation size={18} /> Reserve Your Luxury Chauffeur Now ➔
            </button>
          </div>
        ) : (
          // User has active bookings -> display latest booking right at top
          <div className="prev-hire-top-grid">
            
            {/* LEFT CARD: CURRENT BOOKING STATUS */}
            <div className="status-card-box">
              <div className="status-card-header">
                <div>
                  <span className="status-card-tag">CURRENT BOOKING STATUS</span>
                  <div className="ref-code-row">
                    <h2 className="ref-code-title">{bookingId}</h2>
                    {isCancelled ? (
                      <span className="status-pill cancelled">
                        ● Cancelled by Admin
                      </span>
                    ) : isCompleted ? (
                      <span className="status-pill completed">
                        ● Trip Completed & Paid
                      </span>
                    ) : isDispatched ? (
                      <span className="status-pill confirmed">
                        ● Confirmed & Dispatched
                      </span>
                    ) : (
                      <span className="status-pill pending">
                        Pending Approval
                      </span>
                    )}
                  </div>
                </div>
                {isCancelled ? (
                  <span className="dispatch-queued-tag cancelled">● Hire Cancelled</span>
                ) : isCompleted ? (
                  <span className="dispatch-queued-tag completed">● Trip Reconciled</span>
                ) : isDispatched ? (
                  <span className="dispatch-queued-tag active">● Chauffeur En Route</span>
                ) : (
                  <span className="dispatch-queued-tag">● Dispatch Queued</span>
                )}
              </div>

              {/* Stepper Progress Steps */}
              <div className="milestone-stepper">
                {/* Step 1 */}
                <div className="milestone-item active completed">
                  <div className="milestone-left-col">
                    <div className="milestone-badge green">
                      <Check size={14} />
                    </div>
                    <div className={`milestone-line ${isCancelled ? 'red-line' : (isDispatched || isCompleted) ? 'green-line' : ''}`} />
                  </div>
                  <div className="milestone-content">
                    <div className="milestone-title-row">
                      <strong>1. Pending Driver Confirmation</strong>
                      <span className="milestone-time">
                        {activeBooking.createdAt ? new Date(activeBooking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today, 10:30 AM'}
                      </span>
                    </div>
                    <p>
                      Booking request received and assigned to dispatch officer. Awaiting driver confirmation & vehicle transit clearance.
                    </p>
                  </div>
                </div>

                {/* Step 2: Confirm & Dispatch / Cancelled */}
                {isCancelled ? (
                  <div className="milestone-item active completed">
                    <div className="milestone-left-col">
                      <div className="milestone-badge red">
                        <AlertTriangle size={14} />
                      </div>
                      <div className="milestone-line red-line" />
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong className="text-red">2. Hire Request Cancelled</strong>
                        <span className="milestone-time red-time">Cancelled</span>
                      </div>
                      <p>
                        This hire request was cancelled by Super Admin dispatch. Please contact customer support or place a new booking.
                      </p>
                    </div>
                  </div>
                ) : isDispatched || isCompleted ? (
                  <div className="milestone-item active completed">
                    <div className="milestone-left-col">
                      <div className="milestone-badge green">
                        <Check size={14} />
                      </div>
                      <div className={`milestone-line ${isCompleted ? 'green-line' : ''}`} />
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>2. Confirm & Dispatch</strong>
                        <span className="milestone-time green-time">{dispatchedAt}</span>
                      </div>
                      <p>
                        Driver allocated and vehicle scheduled for departure. Chauffeur credentials verified by Super Admin dispatch.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="milestone-item upcoming">
                    <div className="milestone-left-col">
                      <div className="milestone-badge grey">
                        2
                      </div>
                      <div className="milestone-line" />
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>2. Confirm & Dispatch</strong>
                        <span className="milestone-time">Upcoming</span>
                      </div>
                      <p>
                        Driver allocated and vehicle scheduled for departure. Chauffeur credentials verified.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {isCancelled ? (
                  <div className="milestone-item upcoming">
                    <div className="milestone-left-col">
                      <div className="milestone-badge grey">
                        3
                      </div>
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>3. Trip Closed / Cancelled</strong>
                        <span className="milestone-time">Closed</span>
                      </div>
                      <p>
                        Dispatch processing closed due to booking cancellation by Super Admin.
                      </p>
                    </div>
                  </div>
                ) : isCompleted ? (
                  <div className="milestone-item active completed">
                    <div className="milestone-left-col">
                      <div className="milestone-badge green">
                        <Check size={14} />
                      </div>
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>3. Trip Completed & Reconciled</strong>
                        <span className="milestone-time green-time">{activeBooking.completedAt || 'Today, Completed'}</span>
                      </div>
                      <p>
                        Trip successfully completed, corporate travel manifest logged, and tax invoice generated in Payment History.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="milestone-item upcoming">
                    <div className="milestone-left-col">
                      <div className="milestone-badge grey">
                        3
                      </div>
                    </div>
                    <div className="milestone-content">
                      <div className="milestone-title-row">
                        <strong>3. Trip Completed & Reconciled</strong>
                        <span className="milestone-time">Upcoming</span>
                      </div>
                      <p>
                        Trip successfully completed, corporate travel manifest logged, and payment reconciled.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Route Details Box (Stacked & Centered: Route -> Pickup Schedule -> Estimated Fare) */}
              <div className="route-details-grey-box">
                {/* 1. ROUTE */}
                <div className="route-detail-row route-item">
                  <div className="detail-header-center">
                    <span className="detail-label-pill">
                      <MapPin size={13} className="pill-icon" /> Route
                    </span>
                  </div>
                  <div className="detail-val-center route-val">
                    <span className="route-loc pickup">{activeBooking.pickupLocation}</span>
                    <span className="route-arrow-icon">➔</span>
                    <span className="route-loc dropoff">{activeBooking.dropoffLocation}</span>
                  </div>
                </div>

                {/* 2. PICKUP SCHEDULE */}
                <div className="route-detail-row schedule-item">
                  <div className="detail-header-center">
                    <span className="detail-label-pill">
                      <Calendar size={13} className="pill-icon" /> Pickup Schedule
                    </span>
                  </div>
                  <div className="detail-val-center schedule-val">
                    <span className="schedule-date-badge">{activeBooking.scheduleDate || activeBooking.hireDate || 'Today'}</span>
                    <span className="schedule-dot">•</span>
                    <span className="schedule-time-badge">{activeBooking.scheduleTime || activeBooking.hireTime || '10:30 AM'}</span>
                  </div>
                </div>

                {/* 3. ESTIMATED FARE (Highlighted & Prominent) */}
                <div className="route-detail-row fare-item">
                  <div className="detail-header-center">
                    <span className="detail-label-pill fare-pill">
                      <FileText size={13} className="pill-icon" /> Estimated Fare
                    </span>
                  </div>
                  <div className="fare-highlight-box">
                    <span className="fare-currency-tag">TOTAL CONFIRMED FARE</span>
                    <strong className="detail-val fare-large">
                      {activeBooking.estimatedFare || (typeof activeBooking.totalLKR === 'number'
                        ? `LKR ${activeBooking.totalLKR.toLocaleString()}`
                        : 'LKR 28,500')}
                    </strong>
                    <span className="fare-sub-note">✓ All-Inclusive Luxury Tariff • Taxes Included</span>
                  </div>
                </div>
              </div>

              {/* TRIP COMPLETED BUTTON / SUCCESS STRIP */}
              {!isCancelled && (
                <div className="trip-status-action-container">
                  {!isCompleted ? (
                    <button
                      id="btn-trip-completed"
                      className="btn-mark-trip-completed"
                      onClick={handleMarkTripCompleted}
                      disabled={isCompletingTrip}
                      title="Mark this hire journey as completed and populate Payment History"
                    >
                      <CheckCircle size={18} />
                      <span>{isCompletingTrip ? 'Finalizing Journey & Settling Invoice...' : 'Trip Completed'}</span>
                    </button>
                  ) : (
                    <div className="trip-completed-success-strip" id="trip-completed-banner">
                      <div className="completed-badge-icon">
                        <Check size={20} />
                      </div>
                      <div className="completed-meta">
                        <strong>Trip Successfully Completed & Settled!</strong>
                        <span>Receipt & Tax Invoice {bookingId?.startsWith('#') ? bookingId : `#${bookingId}`} recorded in your Payment History.</span>
                      </div>
                      <button 
                        id="btn-view-payment-history"
                        className="btn-view-payment-history"
                        onClick={() => navigate('/payment-history')}
                        title="Open Payment History to view official Tax Invoice & Receipt"
                      >
                        <FileText size={15} /> View in Payment History ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer Bar */}
              <div className="status-card-footer">
                <span className={`eta-allocation-text ${isCancelled ? 'text-red' : isCompleted ? 'text-emerald' : isDispatched ? 'text-emerald' : ''}`}>
                  {isCancelled 
                    ? '❌ Hire Status: Cancelled by Super Admin Dispatch'
                    : isCompleted
                    ? '✅ Trip Completed: Payment Settled & Archived'
                    : isDispatched 
                    ? '⚡ Live Dispatch: Chauffeur Assigned & En Route' 
                    : '⏱️ ETA Allocation: ~8 mins'}
                </span>
                <button className="refresh-status-btn" onClick={() => window.location.reload()}>
                  <RefreshCw size={14} /> Refresh Live Status
                </button>
              </div>
            </div>

            {/* RIGHT CARD: EXECUTIVE FLEET ALLOCATION & LIVE MAP */}
            <div className="allocation-card-box">
              <div className="allocation-header">
                <div>
                  <span className="allocation-tag">EXECUTIVE FLEET ALLOCATION</span>
                  <h2 className="allocation-title">Allocated Driver & Vehicle</h2>
                </div>
                {isCancelled ? (
                  <span className="chauffeur-cancelled-pill">
                    <AlertTriangle size={14} /> Request Cancelled
                  </span>
                ) : isDispatched ? (
                  <span className="chauffeur-assigned-pill">
                    <CheckCircle size={14} /> Chauffeur Assigned
                  </span>
                ) : (
                  <span className="chauffeur-pending-pill">
                    <Clock size={14} /> Pending Allocation
                  </span>
                )}
              </div>

              {/* Chauffeur Card: Dispatched vs Cancelled vs Pending */}
              {isCancelled ? (
                <div className="chauffeur-info-box cancelled">
                  <div className="chauffeur-avatar-cancelled">
                    <AlertTriangle size={22} color="#dc2626" />
                  </div>
                  <div className="chauffeur-details">
                    <div className="chauffeur-name-row">
                      <strong className="driver-name-highlight text-red">Dispatch Cancelled</strong>
                      <span className="sens-tag cancelled">SUPER ADMIN CANCELLED</span>
                    </div>
                    <div className="chauffeur-sub-row">
                      <span className="pending-sub text-red-dim">This hire request has been cancelled. No driver or vehicle is assigned.</span>
                    </div>
                  </div>
                  <span className="chauffeur-phone-pill cancelled">
                    <Phone size={14} /> Cancelled
                  </span>
                </div>
              ) : isDispatched ? (
                <div className="chauffeur-info-box assigned">
                  <div className="chauffeur-avatar-assigned">
                    <User size={22} color="#0f172a" />
                    <span className="chauffeur-online-dot" />
                  </div>
                  <div className="chauffeur-details">
                    <div className="chauffeur-name-row">
                      <strong className="driver-name-highlight">{driverName}</strong>
                      <span className="rating-tag-gold">★ 4.9★ Rating</span>
                      <span className="sens-tag assigned">SUPER ADMIN ASSIGNED</span>
                    </div>
                    <div className="chauffeur-sub-row">
                      <span className="driver-id-badge">
                        <ShieldCheck size={13} className="text-emerald" /> {driverId}
                      </span>
                      <span className="security-cleared-pill">🛡️ Chauffeur Verified</span>
                      <span className="sms-sent-tag">📲 Push Alert Sent</span>
                    </div>
                  </div>
                  <a 
                    href={`tel:${driverPhone.replace(/\s+/g, '')}`} 
                    className="chauffeur-phone-pill active" 
                    title="Call Assigned Chauffeur"
                  >
                    <Phone size={14} /> {driverPhone}
                  </a>
                </div>
              ) : (
                <div className="chauffeur-info-box pending">
                  <div className="chauffeur-avatar-placeholder">
                    <User size={22} color="#64748b" />
                  </div>
                  <div className="chauffeur-details">
                    <div className="chauffeur-name-row">
                      <strong className="pending-title">Awaiting Chauffeur Allocation</strong>
                      <span className="sens-tag pending">SUPER ADMIN</span>
                    </div>
                    <div className="chauffeur-sub-row">
                      <span className="pending-sub">Super Admin will assign your dedicated chauffeur upon booking clearance.</span>
                      <span className="security-pending-pill">⏳ Pending Confirmation</span>
                    </div>
                  </div>
                  <span className="chauffeur-phone-pill disabled">
                    <Phone size={14} /> Pending
                  </span>
                </div>
              )}

              {/* Assigned Vehicle Box */}
              <div className="assigned-vehicle-box">
                <span className="assigned-veh-sub">
                  {isCancelled ? 'REQUESTED VEHICLE (CANCELLED)' : isDispatched ? 'ALLOCATED FLEET ASSET' : 'REQUESTED VEHICLE'}
                </span>
                <div className="assigned-veh-title-row">
                  <h3>{vehicleModel}</h3>
                  {isCancelled ? (
                    <span className="license-plate-pill cancelled">
                      ❌ Booking Cancelled
                    </span>
                  ) : isDispatched ? (
                    <span className="license-plate-pill allocated">
                      🚘 {vehiclePlate}
                    </span>
                  ) : (
                    <span className="license-plate-pill pending">
                      ⏳ Plate Pending
                    </span>
                  )}
                </div>
                <div className="veh-specs-grid">
                  {isDispatched && !isCancelled && (
                    <>
                      <span className="veh-spec-item color-spec">
                        <span className="color-dot-indicator" style={{ backgroundColor: getColorHex(vehicleColor) }} />
                        Color: <strong>{vehicleColor}</strong>
                      </span>
                      <span className="veh-spec-item">
                        🏷️ Asset: <strong>{assetCode}</strong>
                      </span>
                    </>
                  )}
                  <span>● Premium Selected Fleet</span>
                  <span>👥 Capacity: 4 Passengers</span>
                  <span>🛋️ Luxury Nappa Leather & Dual A/C</span>
                  <span>📶 Complimentary Water & High-Speed WiFi</span>
                </div>
              </div>

              {/* LIVE MAP ROUTE PREVIEW COMPONENT SHOWING PICKUP & DROPOFF */}
              <LiveRouteMap
                pickup={activeBooking.pickupLocation}
                dropoff={activeBooking.dropoffLocation}
                distance={activeBooking.distance || activeBooking.distanceKm}
                pickupCoords={activeBooking.pickupCoords}
                dropoffCoords={activeBooking.dropoffCoords}
              />

              {/* Action Buttons Row */}
              <div className="allocation-actions-row">
                {isCancelled ? (
                  <button 
                    className="act-btn-yellow"
                    onClick={() => navigate('/hire')}
                    title="Book a new hire journey"
                  >
                    <Navigation size={16} /> Book New Luxury Chauffeur ➔
                  </button>
                ) : isDispatched ? (
                  <a 
                    href={`tel:${driverPhone.replace(/\s+/g, '')}`} 
                    className="act-btn-yellow" 
                    title={`Call ${driverName}`}
                  >
                    <Phone size={16} /> Contact Driver ({driverName.split(' ')[0]})
                  </a>
                ) : (
                  <button className="act-btn-grey disabled" title="Available after Super Admin assigns chauffeur">
                    <Phone size={16} /> Contact Driver (Pending)
                  </button>
                )}
                <button className="act-btn-grey">
                  <Share2 size={16} /> Share Ride Status
                </button>
                <button className="act-btn-red">
                  <AlertTriangle size={16} /> Emergency Support
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BOTTOM SECTION: TRAVEL ARCHIVES (PREVIOUS HIRE BOOKINGS HISTORY) */}
        <section className="prev-hire-archives-section">
          <div className="archives-header-row">
            <div>
              <span className="archives-sub-tag">TRAVEL ARCHIVES</span>
              <h2 className="archives-main-title">Previous Hire Bookings History</h2>
              <p className="archives-desc">
                Complete ledger of corporate and private chauffeurs deployed for your profile.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="archives-filter-tabs">
              <button
                className={`tab-btn ${filterTab === 'All' ? 'active' : ''}`}
                onClick={() => setFilterTab('All')}
              >
                All ({userHistoryList.length})
              </button>
              <button
                className={`tab-btn ${filterTab === 'Pending' ? 'active' : ''}`}
                onClick={() => setFilterTab('Pending')}
              >
                Pending / Active ({totalPending})
              </button>
              <button
                className={`tab-btn ${filterTab === 'Completed' ? 'active' : ''}`}
                onClick={() => setFilterTab('Completed')}
              >
                Completed ({totalCompleted})
              </button>
              <button
                className={`tab-btn ${filterTab === 'Cancelled' ? 'active' : ''}`}
                onClick={() => setFilterTab('Cancelled')}
              >
                Cancelled ({totalCancelled})
              </button>
            </div>
          </div>

          {/* History Cards List */}
          {userHistoryList.length === 0 ? (
            <div className="history-empty-placeholder">
              <Clock size={32} color="#94a3b8" />
              <p>No previous hire booking history found {user?.email ? `for ${user.email}` : ''}.</p>
              <span>Your past journeys, invoice receipts, and dispatch telemetry will be recorded here automatically once booked.</span>
            </div>
          ) : (
            <div className="history-cards-list">
              {filteredHistory.map((item) => (
                <div key={item.id} className="history-item-card">
                  <div className="history-card-left-icon">
                    <span className="car-square-icon">🚘</span>
                  </div>
                  
                  <div className="history-card-main-info">
                    <div className="history-title-line">
                      <strong className="veh-title">{item.vehicle}</strong>
                      {item.statusCode === 'cancelled' ? (
                        <span className="history-status-red">● {item.status}</span>
                      ) : item.statusCode === 'pending' ? (
                        <span className="history-status-yellow">● {item.status}</span>
                      ) : item.statusCode === 'active' ? (
                        <span className="history-status-blue">● {item.status}</span>
                      ) : (
                        <span className="history-status-green">● {item.status}</span>
                      )}
                      <span className="history-id">{item.id}</span>
                    </div>
                    <p className="history-route-text">
                      {item.pickupLocation} ➔ {item.dropoffLocation}
                    </p>
                    <div className="history-meta-row">
                      <span>📅 {item.date}</span>
                      <span>•</span>
                      <span>👤 {item.driver}</span>
                    </div>
                  </div>

                  <div className="history-card-right-fare">
                    <span className="fare-label">
                      {item.statusCode === 'completed' ? 'Settled Fare' : 'Estimated Fare'}
                    </span>
                    <strong className="fare-value">{item.fare}</strong>
                    <div className="history-actions">
                      <button 
                        className="invoice-btn"
                        onClick={() => navigate('/payment-history')}
                        title="View Tax Invoice in Payment History"
                      >
                        <FileText size={14} /> Invoice
                      </button>
                      <button className="rebook-btn" onClick={() => navigate('/hire')}>
                        <RotateCcw size={14} /> Rebook
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Archive Footer */}
          {userHistoryList.length > 0 && (
            <div className="archives-footer-bar">
              <span>Showing all {filteredHistory.length} journeys of your personal history</span>
              <button className="export-pdf-btn">
                <Download size={14} /> Export Annual Corporate Ledger (PDF)
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default PreviousHirePage;
