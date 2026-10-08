import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminAuthContext';
import hireApi from '../../../services/hireApi';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Navigation, 
  ShieldCheck, 
  Banknote,
  Search,
  Printer,
  Radio,
  Bell,
  Star,
  Plus,
  Compass,
  Zap,
  RotateCcw,
  Check,
  Send,
  Wifi,
  ChevronDown,
  Sparkles,
  PhoneCall,
  MessageSquare,
  Activity,
  Maximize2,
  Lock,
  Building2,
  CreditCard,
  Copy,
  Trash2
} from 'lucide-react';
import LeafletRouteMap from '../../Common/LeafletRouteMap';
import '../css/ExploreBookingModal.css';

const DEFAULT_VALUES = {
  assetPreview: 'Toyota Land Cruiser V8 (Prado Executive)',
  assetCode: '#V8-EXEC-01',
  driverName: '',
  driverId: 'DENO-DRV-0000001',
  driverPhone: '',
  vehicleNumber: '',
  vehicleColor: 'Pearl Metallic Black'
};

const ExploreBookingModal = ({ booking, onClose, onOpenManageDrivers }) => {
  const { updateBookingStatus, deleteBooking } = useSuperAdmin();

  // Normalize and extract all dynamic customer booking data with reliable fallbacks
  const data = {
    id: booking?.id || booking?.bookingId || 'DENO-000-000-001',
    ref: booking?.ref || (booking?.id ? (booking.id.startsWith('#') ? booking.id : `#${booking.id}`) : '#DENO-000-000-001'),
    customer: booking?.customer || booking?.fullName || booking?.name || 'Valued Guest',
    corporate: booking?.corporate || booking?.company || (booking?.accountTier && booking?.accountTier !== 'Individual / Guest' ? booking.accountTier : 'Private Executive Client'),
    pickupLocation: booking?.pickupLocation || 'Colombo International Airport (CMB)',
    pickupSub: booking?.pickupSub || (
      booking?.pickupLocation?.toLowerCase().includes('cinnamon') 
        ? 'Lobby Concourse • No. 77, Galle Road' 
        : booking?.pickupLocation?.toLowerCase().includes('airport') || booking?.pickupLocation?.toLowerCase().includes('bia')
        ? 'VIP Arrival Terminal 1 • Gate 4' 
        : 'Primary Passenger Pickup Terminal'
    ),
    dropoffLocation: booking?.dropoffLocation || "Earl's Regency Hotel, Kandy",
    dropoffSub: booking?.dropoffSub || (
      booking?.dropoffLocation?.toLowerCase().includes('kandy') 
        ? 'Tennekumbura (Via E04 Central Expressway)' 
        : booking?.dropoffLocation?.toLowerCase().includes('galle') 
        ? 'Southern Expressway E01 Corridor Hub' 
        : 'Designated Destination Reception'
    ),
    distance: booking?.distance || (booking?.distanceKm ? `${booking.distanceKm} km` : '45 km'),
    vehicleModel: booking?.assignedAssetPreview || booking?.vehicleModel || booking?.vehicle || 'Toyota Land Cruiser V8',
    vehiclePlate: booking?.assignedVehicleNumber || (booking?.vehiclePlate && booking?.vehiclePlate !== 'Pending Allocation' ? booking.vehiclePlate : ''),
    vehicleType: booking?.vehicleType || booking?.vehicleCategory || 'Prado Executive Class',
    scheduleDate: booking?.scheduleDate || booking?.hireDate || booking?.pickupDate || 'Today',
    scheduleTime: booking?.scheduleTime || booking?.hireTime || booking?.pickupTime || '08:30 AM',
    dropoffDate: booking?.dropoffDate || '',
    dropoffTime: booking?.dropoffTime || '',
    totalLKR: typeof booking?.totalLKR === 'number' 
      ? booking.totalLKR 
      : (typeof booking?.estimatedFare === 'string' ? (Number(booking.estimatedFare.replace(/[^0-9]/g, '')) || 0) : (booking?.totalAmount || 0)),
    totalUSD: booking?.totalUSD || Math.round(
      (typeof booking?.totalLKR === 'number' 
        ? booking.totalLKR 
        : (typeof booking?.estimatedFare === 'string' ? (Number(booking.estimatedFare.replace(/[^0-9]/g, '')) || 0) : 0)) / 330
    ),
    status: booking?.status || 'Pending Dispatch',
    contactPhone: booking?.contactPhone || booking?.phone || '',
    contactEmail: booking?.contactEmail || booking?.email || '',
    accountNumber: booking?.accountNumber || '',
    paymentStatus: booking?.paymentStatus || 'Advance Paid (50%)',
    specialNotes: booking?.specialNotes || booking?.description || booking?.specialNote || '',
    flightNo: booking?.flightNo || '',
    chauffeur: booking?.chauffeur || ''
  };

  // Generate initials for customer avatar badge
  const getInitials = (name) => {
    if (!name) return 'VG';
    const clean = name.replace(/^(Mr\.|Mrs\.|Dr\.|Ms\.)\s+/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Generate or determine customer Account Number & Tier badge
  const getAccountNumber = (b) => {
    if (b.accountNumber) return b.accountNumber;
    if (b.corporate && b.corporate !== 'Individual Guest' && b.corporate !== 'Individual' && b.corporate !== 'Private Executive Client') {
      const prefix = b.corporate.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
      return `#${prefix || 'CORP'}-LK-${b.id ? String(b.id).slice(-4) : '9021'}`;
    }
    return `#CUST-DENO-${b.id ? String(b.id).slice(-4) : '8492'}`;
  };

  const isCorporate = data.corporate && data.corporate !== 'Individual Guest' && data.corporate !== 'Individual' && data.corporate !== 'Private Executive Client';

  // 1. AUTO-MATCHED ASSET PREVIEW state
  const [assetPreview, setAssetPreview] = useState(
    booking?.assignedAssetPreview || booking?.vehicleModel || booking?.vehicle || DEFAULT_VALUES.assetPreview
  );
  const [assetCode, setAssetCode] = useState(booking?.assignedAssetCode || DEFAULT_VALUES.assetCode);

  // 2. DRIVER NAME state
  const [driverName, setDriverName] = useState(booking?.assignedDriverName || '');

  // 3. DRIVER ID state (Strictly non-editable, auto-generated starting with DENO-DRV-0000001)
  const [driverId, setDriverId] = useState(booking?.assignedDriverId || DEFAULT_VALUES.driverId);

  // 4. DRIVER CONTACT NUMBER state
  const [driverPhone, setDriverPhone] = useState(
    booking?.assignedDriverPhone ? booking.assignedDriverPhone.replace('+94 ', '').replace('+94', '').trim() : ''
  );

  // 5. VEHICLE NUMBER state
  const [vehicleNumber, setVehicleNumber] = useState(
    booking?.assignedVehicleNumber || (booking?.vehiclePlate && booking?.vehiclePlate !== 'Pending Allocation' ? booking.vehiclePlate : '')
  );

  // 6. VEHICLE COLOR state
  const [vehicleColor, setVehicleColor] = useState(
    booking?.assignedVehicleColor || booking?.vehicleColor || DEFAULT_VALUES.vehicleColor
  );
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  // Live Standby Drivers from Backend
  const [standbyDrivers, setStandbyDrivers] = useState([
    { fullName: 'Dinusha Chandima', driverId: 'DENO-DRV-0000001', phone: '+94 77 458 5471', rating: 4.9, licenseClass: 'Class A Heavy', assignedVehiclePlate: 'WP CAB - 8829' },
    { fullName: 'Rohan Wickremasinghe', driverId: 'DENO-DRV-0000002', phone: '+94 71 883 4920', rating: 4.9, licenseClass: 'VIP Protocol Chauffeur', assignedVehiclePlate: 'WP CAR - 4402' },
    { fullName: 'Kamal Bandara', driverId: 'DENO-DRV-0000003', phone: '+94 77 340 1822', rating: 4.8, licenseClass: 'Class A Heavy', assignedVehiclePlate: 'WP CBA - 7741' },
    { fullName: 'Nalaka Fernando', driverId: 'DENO-DRV-0000004', phone: '+94 77 459 9001', rating: 4.9, licenseClass: 'Hill Country Tour Specialist', assignedVehiclePlate: 'WP NB - 6190' }
  ]);

  // Checkbox state
  const [autoSmsAlert, setAutoSmsAlert] = useState(true);

  // Status and feedback states
  const [currentStatus, setCurrentStatus] = useState(booking?.status || 'Pending Dispatch');
  const [isDispatched, setIsDispatched] = useState(false);
  const [isCallingTest, setIsCallingTest] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [etaRemaining, setEtaRemaining] = useState('2h 18m Remaining');

  // Fetch real standby drivers from DB
  useEffect(() => {
    hireApi.getDrivers().then((res) => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setStandbyDrivers(res.data);
      }
    }).catch(() => {});
  }, []);

  // Reset form inputs or load existing assignment data whenever modal or active booking opens
  useEffect(() => {
    if (booking) {
      setAssetPreview(booking.assignedAssetPreview || booking.vehicleModel || booking.vehicle || DEFAULT_VALUES.assetPreview);
      setAssetCode(booking.assignedAssetCode || '#V8-EXEC-01');
      setDriverName(booking.assignedDriverName || '');
      setDriverId(booking.assignedDriverId || 'DENO-DRV-0000001');
      setDriverPhone(
        booking.assignedDriverPhone
          ? booking.assignedDriverPhone.replace('+94 ', '').replace('+94', '').trim()
          : ''
      );
      setVehicleNumber(
        booking.assignedVehicleNumber || 
        (booking.vehiclePlate && booking.vehiclePlate !== 'Pending Allocation' ? booking.vehiclePlate : '')
      );
      setVehicleColor(booking.assignedVehicleColor || booking.vehicleColor || 'Pearl Metallic Black');
      setCurrentStatus(booking.status || 'Pending Dispatch');
      setShowColorDropdown(false);
    }
  }, [booking]);

  const handleCopyEmail = (emailStr) => {
    if (!emailStr) return;
    navigator.clipboard.writeText(emailStr);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    const cleanPhone = driverPhone.trim();
    const formattedPhone = cleanPhone
      ? (cleanPhone.startsWith('+94') ? cleanPhone : `+94 ${cleanPhone.replace(/^0+/, '')}`)
      : (data.contactPhone || '+94 77 458 5471');

    const finalDriverName = driverName.trim() || 'Dinusha Chandima';
    const finalDriverId = driverId.trim() || 'DENO-DRV-0000001';
    const finalVehicleNumber = vehicleNumber.trim() || (data.vehiclePlate && data.vehiclePlate !== 'Pending Allocation' ? data.vehiclePlate : 'WP CAB - 8829');
    const finalVehicleColor = vehicleColor.trim() || 'Pearl Metallic Black';
    const finalAssetPreview = assetPreview.trim() || data.vehicleModel || 'Toyota Land Cruiser V8';
    const finalAssetCode = assetCode.trim() || '#V8-EXEC-01';

    const assignmentData = {
      assignedDriverName: finalDriverName,
      assignedDriverId: finalDriverId,
      assignedDriverPhone: formattedPhone,
      assignedVehicleNumber: finalVehicleNumber,
      assignedVehicleColor: finalVehicleColor,
      assignedAssetPreview: finalAssetPreview,
      assignedAssetCode: finalAssetCode,
      autoSmsAlert: autoSmsAlert,
      status: 'Confirmed / Active',
      dispatchConfirmed: true,
      dispatchedAt: 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      chauffeur: `${finalDriverName} (ID: ${finalDriverId})`,
      vehiclePlate: finalVehicleNumber,
      vehicleModel: finalAssetPreview
    };

    updateBookingStatus(data.id, 'Confirmed / Active', assignmentData);
    setCurrentStatus('Confirmed / Active');
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1400);
  };

  const handleCancelHire = () => {
    if (window.confirm(`Are you sure you want to cancel hire ${data.ref} for ${data.customer}?`)) {
      updateBookingStatus(data.id, 'Cancelled');
      setCurrentStatus('Cancelled');
      onClose();
    }
  };

  const handleDeleteBooking = () => {
    if (window.confirm(`Are you sure you want to permanently delete booking ${data.ref} (${data.customer}) from the database?`)) {
      deleteBooking(data.id || data.ref);
      onClose();
    }
  };

  const handleReallocateVehicle = () => {
    const fleetList = [
      { model: 'Toyota Land Cruiser V8 (Prado Executive)', plate: 'WP CAB - 8829', color: 'Pearl Metallic Black', id: 'DENO-DRV-0000001', driver: 'Dinusha Chandima', phone: '77 458 5471', code: '#V8-EXEC-01' },
      { model: 'Mercedes-Benz S-Class (Executive Sedan)', plate: 'WP CAR - 4402', color: 'Obsidian Black', id: 'DENO-DRV-0000002', driver: 'Rohan Wickremasinghe', phone: '71 883 4920', code: '#S-CLASS-02' },
      { model: 'Mitsubishi Montero Sport (Premium SUV)', plate: 'WP CBA - 7741', color: 'Metallic Silver', id: 'DENO-DRV-0000003', driver: 'Kamal Bandara', phone: '77 340 1822', code: '#MONTERO-05' },
      { model: 'Toyota HiAce Super Grandia (Executive Van)', plate: 'WP NB - 6190', color: 'Diamond White', id: 'DENO-DRV-0000004', driver: 'Nalaka Fernando', phone: '77 459 9001', code: '#GRANDIA-08' }
    ];
    const nextIdx = Math.floor(Math.random() * fleetList.length);
    const chosen = fleetList[nextIdx];
    setAssetPreview(chosen.model);
    setAssetCode(chosen.code);
    setVehicleNumber(chosen.plate);
    setVehicleColor(chosen.color);
    setDriverId(chosen.id);
    setDriverName(chosen.driver);
    setDriverPhone(chosen.phone);
  };

  const handleTestCall = () => {
    setIsCallingTest(true);
    setTimeout(() => {
      setIsCallingTest(false);
      alert(`📞 Calling ${data.customer} at ${data.contactPhone || '+94 77 920 1845'}... Line Connected!`);
    }, 900);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  // WhatsApp clean link
  const rawPhone = (data.contactPhone || '+94779201845').replace(/[^0-9]/g, '');

  return (
    <div className="deno-explore-overlay" role="dialog" aria-modal="true">
      <div className="deno-explore-modal-container">
        
        {/* ================= 1. TOP HEADER BAR ================= */}
        <div className="deno-explore-topbar">
          <div className="deno-explore-top-left">
            <div className="deno-explore-brand-badge">
              <Car size={18} color="#0b172a" />
            </div>
            <div className="deno-explore-header-titles">
              <span className="deno-explore-sub-brand">DENO CABS & TOURS</span>
              <h2 className="deno-explore-main-title">Hire Request & Booking Management</h2>
            </div>
          </div>

          <div className="deno-explore-top-center">
            <div className="deno-explore-search-shortcut">
              <Search size={14} />
              <span>⌘K / Ctrl+K</span>
            </div>
            <div className="deno-explore-telemetry-pill">
              <span className="telemetry-pulse-dot" />
              <span>Live Telemetry Feed 100%</span>
            </div>
            <div className="deno-explore-status-pill-top">
              <span className="status-top-dot" />
              <span>{currentStatus === 'Confirmed / Active' ? 'Confirmed & Dispatched' : currentStatus}</span>
            </div>
          </div>

          <div className="deno-explore-top-right">
            <div className="deno-explore-notif-btn">
              <Bell size={16} />
              <span className="notif-count-badge">3</span>
            </div>
            <div className="deno-explore-admin-profile">
              <div className="admin-av-badge">DC</div>
              <div className="admin-av-meta">
                <strong>Dinusha Chandima</strong>
                <span>Senior Operations Controller</span>
              </div>
            </div>
            <button className="deno-explore-close-btn" onClick={onClose} title="Close Overview">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================= 2. BREADCRUMBS & PRINT BAR ================= */}
        <div className="deno-explore-breadcrumb-bar">
          <div className="breadcrumb-left">
            <span className="bc-dim">Island Elite Dispatch</span>
            <span className="bc-sep">›</span>
            <span className="bc-dim">Hire Operations</span>
            <span className="bc-sep">›</span>
            <strong className="bc-ref">REF: {data.ref}</strong>
            <span className="corridor-tag">
              {data.distance ? `${data.distance.toUpperCase()} EXPRESS CORRIDOR` : 'E04 CENTRAL EXP CORRIDOR'}
            </span>
          </div>

          <div className="breadcrumb-right">
            <div className="auto-sync-status">
              <span className="sync-pulse-dot" />
              <span>Auto-Sync Pulse: <strong>0.4s</strong></span>
            </div>
            <button className="deno-btn-print-sheet" onClick={handlePrintSheet}>
              <Printer size={15} />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        {/* ================= 3. SCROLLABLE MAIN CONTENT ================= */}
        <div className="deno-explore-content-scroll">
          
          {/* ================= TOP CARD: CLEAR CUSTOMER DETAILS & APPROVED FARE ================= */}
          <div className="deno-explore-hero-card">
            {/* Left Column: Clear Customer VIP Profile */}
            <div className="hero-customer-col">
              <div className="customer-avatar-badge" title={`Customer: ${data.customer}`}>
                <span className="avatar-initials">{getInitials(data.customer)}</span>
                <span className="avatar-vip-tag">VIP</span>
              </div>

              <div className="customer-details-block">
                {/* 1. Customer Name & VIP Tier Badges */}
                <div className="customer-title-row">
                  <h3 className="customer-name-heading">{data.customer}</h3>
                  <span className="vip-badge-gold">
                    <Sparkles size={12} /> VIP Platinum
                  </span>
                  <span className="tier-badge-blue">
                    {isCorporate ? 'Corporate Tier1' : 'Verified Guest'}
                  </span>
                </div>

                {/* 2. Corporate Company & Account ID */}
                <div className="corporate-sub-row">
                  <Building2 size={14} className="icon-dim text-gold" />
                  <strong className="corporate-name-text">
                    {data.corporate || 'Individual Executive Client'}
                  </strong>
                  <span className="bullet-sep">•</span>
                  <span className="account-number">Account {getAccountNumber(data)}</span>
                </div>

                {/* 3. Customer Contact Details: Email & Phone Chips */}
                <div className="customer-contact-chips">
                  {/* Email Chip */}
                  <div 
                    className="contact-chip email-chip" 
                    onClick={() => handleCopyEmail(data.contactEmail || '')}
                    title="Click to copy Email"
                  >
                    <Mail size={13} className="chip-icon text-gold" />
                    <span className="chip-text-highlight">{data.contactEmail || 'No Email Provided'}</span>
                    {copiedEmail ? (
                      <span className="copy-badge-success"><Check size={11} /> Copied</span>
                    ) : (
                      <Copy size={11} className="chip-copy-icon" />
                    )}
                  </div>

                  {/* Phone Chip (Only customer's entered number with country code) */}
                  <div className="contact-chip phone-chip" title="Customer Contact Number">
                    <Phone size={13} className="chip-icon text-gold" />
                    <strong className="phone-primary-text">{data.contactPhone || 'No Phone Provided'}</strong>
                  </div>

                  {/* Quick Action Contact Buttons */}
                  <div className="quick-action-chips">
                    <button className="quick-btn-phone" onClick={handleTestCall} title="Call Customer Direct">
                      <PhoneCall size={14} />
                      <span>Call</span>
                    </button>
                    <a 
                      href={`https://wa.me/${rawPhone}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="quick-btn-whatsapp"
                      title="Open WhatsApp chat with Customer"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Total Approved Fare & Payment Status */}
            <div className="hero-fare-col">
              <div className="fare-header-row">
                <span className="fare-label">TOTAL APPROVED FARE</span>
                <span className={`fare-status-pill ${
                  (data.paymentStatus || '').toLowerCase().includes('paid') ? 'pill-paid' :
                  (data.paymentStatus || '').toLowerCase().includes('refund') ? 'pill-refund' : 'pill-advance'
                }`}>
                  <span className="fare-dot" /> {data.paymentStatus || 'Advance Paid (50%)'}
                </span>
              </div>

              <div className="fare-big-amount">
                <span className="fare-lkr">LKR {new Intl.NumberFormat('en-US').format(data.totalLKR)}</span>
                <span className="fare-usd">/ ${new Intl.NumberFormat('en-US').format(data.totalUSD || Math.round(data.totalLKR / 330))}.00</span>
              </div>

              <div className="fare-guarantee-note">
                <CheckCircle2 size={15} className="text-emerald" />
                <span>Taxes, Central Expressway Tolls & Transit Insurance included</span>
              </div>
            </div>
          </div>

          {/* ================= 4. ROUTE & FLEET SUMMARY 4-CARDS ================= */}
          <div className="deno-route-fleet-grid">
            {/* 1. Pickup Location */}
            <div className="summary-info-card">
              <div className="card-icon-circle amber-circle">
                <div className="inner-donut" />
              </div>
              <div className="card-info-texts">
                <span className="card-micro-label">PICKUP LOCATION</span>
                <strong className="card-main-title">{data.pickupLocation}</strong>
                <span className="card-sub-info">{data.pickupSub}</span>
              </div>
            </div>

            {/* 2. Drop-off Destination */}
            <div className="summary-info-card">
              <div className="card-icon-circle teal-circle">
                <MapPin size={16} />
              </div>
              <div className="card-info-texts">
                <span className="card-micro-label">DROP-OFF DESTINATION</span>
                <strong className="card-main-title">{data.dropoffLocation}</strong>
                <span className="card-sub-info">{data.dropoffSub}</span>
              </div>
            </div>

            {/* 3. Total Distance */}
            <div className="summary-info-card">
              <div className="card-icon-circle green-circle">
                <Navigation size={16} />
              </div>
              <div className="card-info-texts">
                <span className="card-micro-label">TOTAL DISTANCE</span>
                <div className="card-distance-row">
                  <strong className="card-distance-val">{data.distance || '145 km'}</strong>
                </div>
                <span className="card-sub-info">Inter-Provincial Hub</span>
              </div>
            </div>

            {/* 4. Selected Vehicle */}
            <div className="summary-info-card">
              <div className="card-icon-circle purple-circle">
                <Car size={16} />
              </div>
              <div className="card-info-texts">
                <span className="card-micro-label">SELECTED VEHICLE</span>
                <strong className="card-main-title">{data.vehicleModel}</strong>
                <span className="card-sub-info gold-text">{data.vehicleType || 'PRADO EXECUTIVE CLASS'}</span>
              </div>
            </div>
          </div>

          {/* ================= SCHEDULE DATES STRIP ================= */}
          <div className="deno-schedule-dates-bar">
            <div className="schedule-item">
              <Calendar size={16} className="text-gold" />
              <span className="sched-label">Pickup Date & Time:</span>
              <strong className="sched-val">{data.scheduleDate} • {data.scheduleTime}</strong>
            </div>

            <div className="schedule-item">
              <Calendar size={16} className="text-cyan" />
              <span className="sched-label">Drop-off Date & Time:</span>
              <strong className="sched-val">{data.dropoffDate || '14 Oct 2026'} • {data.dropoffTime || '06:00 PM'}</strong>
            </div>
          </div>

          {/* ================= SPECIAL PASSENGER INSTRUCTIONS (IF PRESENT) ================= */}
          {data.specialNotes && (
            <div className="deno-special-notes-card">
              <div className="notes-icon-badge">
                <Sparkles size={16} className="text-gold" />
              </div>
              <div className="notes-meta">
                <span className="notes-label">CUSTOMER SPECIAL INSTRUCTIONS & NOTES</span>
                <p className="notes-text">{data.specialNotes}</p>
                {data.flightNo && (
                  <span className="flight-tag-badge">✈️ Arrival Flight: <strong>{data.flightNo}</strong></span>
                )}
              </div>
            </div>
          )}

          {/* ================= HIGHLIGHTED VIP INCLUSIONS & EXTRAS ================= */}
          <div className="deno-vip-extras-card">
            <div className="extras-left">
              <div className="extras-icon-badge">
                <Plus size={18} />
              </div>
              <div className="extras-meta">
                <div className="extras-title-row">
                  <strong>Highlighted VIP Inclusions & Extras</strong>
                  <span className="active-pkg-pill">ACTIVE PACKAGE</span>
                </div>
                <p className="extras-desc">
                  Tailored corporate add-ons verified for booking contract {data.ref}
                </p>
              </div>
            </div>

            <div className="extras-chips-group">
              <div className="extra-chip">
                <Clock size={14} className="text-gold" />
                <span>+2 Extra Days (Extended Executive Standby)</span>
              </div>
              <div className="extra-chip">
                <Navigation size={14} className="text-gold" />
                <span>+50 Extra Kilometers (Hill Country Sightseeing Clearance)</span>
              </div>
              <div className="extra-chip">
                <Wifi size={14} className="text-cyan" />
                <span>Complimentary 5G Wi-Fi & Child Safety Seat</span>
              </div>
            </div>
          </div>

          {/* ================= 5. TWO COLUMN DISPATCH CONTROL PANEL ================= */}
          <div className="deno-dispatch-two-column-grid">
            
            {/* ================= LEFT COLUMN: LIVE INTERACTIVE ROUTE MAP ================= */}
            <div className="dispatch-panel-card route-map-panel">
              <div className="panel-header-row">
                <div className="panel-title-group">
                  <div className="radar-icon-wrap">
                    <Radio size={16} className="radar-pulse-icon" />
                  </div>
                  <div>
                    <h4 className="panel-main-heading">Live Interactive Route Map</h4>
                    <span className="panel-sub-heading">
                      {data.pickupLocation} ➔ {data.dropoffLocation} • Live Feed
                    </span>
                  </div>
                </div>
                <span className="transit-badge">
                  <span className="transit-dot" /> {data.distance || '145 km'} Transit
                </span>
              </div>

              {/* Interactive OpenStreetMap Leaflet Route Canvas */}
              <div className="interactive-map-wrapper" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <LeafletRouteMap
                  pickupLocation={data.pickupLocation}
                  dropoffLocation={data.dropoffLocation}
                  pickupCoords={booking?.pickupCoords}
                  dropoffCoords={booking?.dropoffCoords}
                  distance={data.distance}
                  height="260px"
                  theme="dark"
                  interactive={true}
                />
              </div>

              {/* Telemetry Matrix Grid */}
              <div className="telemetry-matrix-grid">
                <div className="telemetry-cell">
                  <span className="telem-label">GPS PRECISION</span>
                  <strong className="telem-val">± 1.2 meters</strong>
                </div>
                <div className="telemetry-cell">
                  <span className="telem-label">SIGNAL LATENCY</span>
                  <strong className="telem-val text-cyan">140 ms</strong>
                </div>
                <div className="telemetry-cell">
                  <span className="telem-label">WEATHER MATRIX</span>
                  <strong className="telem-val text-gold">28°C • Dry Road</strong>
                </div>
              </div>

              {/* Standby Drivers Available Strip */}
              <div className="standby-drivers-strip">
                <div className="standby-header-top">
                  <div className="standby-lead">
                    <User size={15} />
                    <span>Standby Chauffeurs Available:</span>
                  </div>
                  <div className="standby-actions-group">
                    <span className="standby-count">{standbyDrivers.length} Active</span>
                    {onOpenManageDrivers && (
                      <button
                        type="button"
                        className="btn-quick-add-driver-pill"
                        onClick={onOpenManageDrivers}
                        title="Add or Manage Drivers in Registry"
                      >
                        <Plus size={12} /> Add / Manage
                      </button>
                    )}
                  </div>
                </div>
                <div className="standby-list">
                  {standbyDrivers.slice(0, 6).map((drv) => (
                    <span 
                      key={drv.driverId || drv.fullName}
                      className={`driver-pill ${driverName === drv.fullName ? 'active-pill' : ''}`}
                      onClick={() => {
                        setDriverName(drv.fullName);
                        setDriverId(drv.driverId || 'DENO-DRV-0000001');
                        setDriverPhone((drv.phone || '').replace('+94 ', '').replace('+94', '').trim());
                        if (drv.assignedVehiclePlate) {
                          setVehicleNumber(drv.assignedVehiclePlate);
                        }
                      }}
                      title={`Assign ${drv.fullName} (${drv.driverId})`}
                    >
                      {drv.fullName.split(' ')[0]} ({drv.rating || 4.9}★ • {drv.driverId})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN: DRIVER & VEHICLE ASSIGNMENT FORM ================= */}
            <div className="dispatch-panel-card assignment-form-panel">
              <div className="panel-header-row">
                <div className="panel-title-group">
                  <div className="form-icon-wrap">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="panel-main-heading">Driver & Vehicle Assignment Form</h4>
                    <span className="panel-sub-heading">Direct dispatch parameter configuration & verification</span>
                  </div>
                </div>
                <span className="ready-match-badge">
                  <span className="ready-dot" /> Ready for Assignment / Live Dispatch
                </span>
              </div>

              {/* 1. AUTO-MATCHED ASSET PREVIEW */}
              <div className="asset-preview-editable-wrapper">
                <div className="asset-input-icon-box">
                  <Car size={18} className="text-gold" />
                </div>
                <div className="asset-input-text-col">
                  <span className="asset-sub-title">AUTO-MATCHED ASSET PREVIEW (CLICK TO EDIT)</span>
                  <input
                    type="text"
                    value={assetPreview}
                    onChange={(e) => setAssetPreview(e.target.value)}
                    placeholder="e.g. Toyota Land Cruiser V8 (Prado Executive)"
                    className="asset-editable-input"
                    title="Asset Name"
                  />
                </div>
                <input
                  type="text"
                  value={assetCode}
                  onChange={(e) => setAssetCode(e.target.value)}
                  placeholder="#CODE"
                  className="asset-code-editable-input"
                  title="Asset Tag Code"
                />
              </div>

              <form onSubmit={handleConfirmDispatch} className="assignment-form-body">
                
                {/* 2. DRIVER NAME */}
                <div className="form-field-wrapper">
                  <div className="field-label-row">
                    <label className="field-label">
                      <User size={14} /> DRIVER NAME
                    </label>
                    <span className="rating-badge-gold">
                      <Star size={12} fill="#ffb800" /> 4.9★ Verified
                    </span>
                  </div>
                  <div className="field-input-box">
                    <div className="driver-avatar-thumb">
                      <User size={14} />
                    </div>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Dinusha Chandima"
                      className="field-text-input"
                      title="Driver Full Name"
                      required
                    />
                  </div>
                </div>

                {/* 3. DRIVER ID (EDITABLE / AUTO-GENERATED) */}
                <div className="form-field-wrapper">
                  <div className="field-label-row">
                    <label className="field-label">
                      <ShieldCheck size={14} className="text-gold" /> DRIVER ID / REGISTRY CODE
                    </label>
                    <button
                      type="button"
                      className="btn-auto-gen-id"
                      onClick={() => {
                        const randNum = String(Math.floor(1 + Math.random() * 9999999)).padStart(7, '0');
                        setDriverId(`DENO-DRV-${randNum}`);
                      }}
                      title="Generate new Driver ID format"
                    >
                      <Sparkles size={11} /> Auto Gen ID
                    </button>
                  </div>
                  <div className="field-input-box driver-id-input-box" title="Driver Registry ID">
                    <CheckCircle2 size={16} className="text-emerald check-icon-prefix" />
                    <input
                      type="text"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      placeholder="e.g. DENO-DRV-0000001"
                      className="field-text-input monospace editable-driver-id"
                      title="Driver Registration ID"
                      required
                    />
                  </div>
                  <span className="field-micro-hint">
                    Official registry code • Starting format DENO-DRV-0000001 (Fully editable)
                  </span>
                </div>

                {/* 4. DRIVER CONTACT NUMBER */}
                <div className="form-field-wrapper">
                  <label className="field-label">
                    <Phone size={14} /> DRIVER CONTACT NUMBER
                  </label>
                  <div className="phone-input-combo">
                    <div className="phone-prefix-tag">
                      <span>🇱🇰 +94</span>
                    </div>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="e.g. 77 458 5471"
                      className="field-text-input phone-number-input"
                      title="Driver Contact Phone"
                      required
                    />
                    <button
                      type="button"
                      className="btn-test-call"
                      onClick={handleTestCall}
                      disabled={isCallingTest}
                      title="Test Voice Call to Chauffeur"
                    >
                      <PhoneCall size={14} />
                      <span>{isCallingTest ? 'Connecting...' : 'Test Call'}</span>
                    </button>
                  </div>
                </div>

                {/* 5. VEHICLE NUMBER & VEHICLE COLOR */}
                <div className="form-two-cols-grid">
                  {/* Vehicle Number */}
                  <div className="form-field-wrapper">
                    <label className="field-label">
                      <span className="field-icon-num">123</span> VEHICLE NUMBER
                    </label>
                    <div className="vehicle-plate-input-wrap">
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g. WP CAB - 8829"
                        className="vehicle-plate-input"
                        title="Vehicle Registration Plate Number"
                        required
                      />
                    </div>
                  </div>

                  {/* Vehicle Color with Dropdown INSIDE the box */}
                  <div className="form-field-wrapper">
                    <label className="field-label">
                      <span className="text-cyan">🎨</span> VEHICLE COLOR
                    </label>

                    <div className="vehicle-color-input-container">
                      <div className="field-input-box color-input-box">
                        <div 
                          className="color-dot-swatch"
                          style={{
                            backgroundColor: vehicleColor.toLowerCase().includes('white') ? '#ffffff' :
                              vehicleColor.toLowerCase().includes('silver') ? '#94a3b8' :
                              vehicleColor.toLowerCase().includes('blue') ? '#0284c7' :
                              vehicleColor.toLowerCase().includes('gold') ? '#ffb800' : 
                              vehicleColor.toLowerCase().includes('grey') || vehicleColor.toLowerCase().includes('gray') ? '#64748b' : '#0f172a'
                          }}
                        />
                        <input
                          type="text"
                          value={vehicleColor}
                          onChange={(e) => setVehicleColor(e.target.value)}
                          placeholder="e.g. Pearl Metallic Black"
                          className="field-text-input color-text-field"
                          title="Vehicle Color"
                        />
                        <button
                          type="button"
                          className="color-box-dropdown-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowColorDropdown(!showColorDropdown);
                          }}
                          title="Choose preset vehicle color"
                        >
                          <ChevronDown size={14} className={`color-box-chevron ${showColorDropdown ? 'open' : ''}`} />
                        </button>
                      </div>

                      {/* Presets Dropdown positioned directly beneath input box */}
                      {showColorDropdown && (
                        <div className="color-presets-dropdown">
                          {[
                            { name: 'Pearl Metallic Black', hex: '#0f172a' },
                            { name: 'Diamond White', hex: '#ffffff' },
                            { name: 'Obsidian Black', hex: '#000000' },
                            { name: 'Metallic Silver', hex: '#94a3b8' },
                            { name: 'Deep Navy Blue', hex: '#0284c7' },
                            { name: 'Imperial Gold', hex: '#ffb800' },
                            { name: 'Midnight Grey', hex: '#475569' }
                          ].map((col) => (
                            <button
                              key={col.name}
                              type="button"
                              className={`color-preset-item ${vehicleColor === col.name ? 'active' : ''}`}
                              onClick={() => {
                                setVehicleColor(col.name);
                                setShowColorDropdown(false);
                              }}
                            >
                              <span className="preset-color-dot" style={{ backgroundColor: col.hex }} />
                              <span>{col.name}</span>
                              {vehicleColor === col.name && <Check size={12} className="preset-check-icon" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 6. Auto SMS Push Checkbox */}
                <label className="checkbox-sms-label">
                  <input
                    type="checkbox"
                    checked={autoSmsAlert}
                    onChange={(e) => setAutoSmsAlert(e.target.checked)}
                  />
                  <span>Auto-transmit instant push SMS dispatch alert to Chauffeur upon submission</span>
                </label>

                {/* 7. Form Action Buttons */}
                <div className="form-actions-stack">
                  <div className="primary-actions-row">
                    <button
                      type="submit"
                      className="btn-confirm-dispatch-main"
                      disabled={isDispatched}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 size={18} /> Booking Dispatched Successfully!
                        </>
                      ) : (
                        <>
                          <Zap size={18} /> Confirm & Dispatch Booking
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn-reallocate-vehicle"
                      onClick={handleReallocateVehicle}
                      title="Auto-switch to another available fleet vehicle"
                    >
                      <RotateCcw size={16} />
                      <span>Reallocate Vehicle</span>
                    </button>
                  </div>

                  <div className="secondary-actions-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-cancel-hire-action"
                      onClick={handleCancelHire}
                      style={{ flex: 1 }}
                    >
                      <X size={15} />
                      <span>Cancel Hire</span>
                    </button>

                    <button
                      type="button"
                      className="btn-delete-hire-modal"
                      onClick={handleDeleteBooking}
                      title="Permanently remove this booking from database"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#ef4444',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreBookingModal;
