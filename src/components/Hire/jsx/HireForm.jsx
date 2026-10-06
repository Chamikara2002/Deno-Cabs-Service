import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { MapPin, Calendar, Clock, Car, UserCheck, CreditCard, CheckCircle, ArrowRight, ShieldAlert, Navigation } from 'lucide-react';
import LocationSearchInput from '../../Common/LocationSearchInput';
import LeafletRouteMap from '../../Common/LeafletRouteMap';
import { calculateDrivingRoute } from '../../../services/mapService';
import '../css/HireForm.css';

const HIRE_VEHICLE_OPTIONS = [
  { id: 'sedan_vip', name: 'Mercedes-Benz E-Class VIP', category: 'Luxury Sedan', pricePerKm: 350, baseFare: 4500, image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600' },
  { id: 'suv_prado', name: 'Toyota Land Cruiser Prado V8', category: 'Luxury SUV', pricePerKm: 420, baseFare: 6000, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600' },
  { id: 'van_vip', name: 'Toyota KDH VIP Chauffeur Van', category: 'Executive Van', pricePerKm: 380, baseFare: 5500, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600' },
  { id: 'city_prius', name: 'Toyota Prius Hybrid', category: 'Premium Economy', pricePerKm: 220, baseFare: 3000, image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600' }
];

const HireForm = () => {
  const navigate = useNavigate();
  const { user, triggerLoginRequiredAlert, addHireBooking } = useAuth();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [selectingTarget, setSelectingTarget] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(HIRE_VEHICLE_OPTIONS[0]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [flightNo, setFlightNo] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [calculatedKm, setCalculatedKm] = useState(45);

  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Auto update route distance whenever coordinates or names change
  const handleCoordsUpdate = (pCoord, dCoord) => {
    if (pCoord && dCoord) {
      calculateDrivingRoute(pCoord, dCoord).then(res => {
        if (res?.distanceKm) {
          setCalculatedKm(res.distanceKm);
        }
      });
    }
  };

  // Calculate estimated distance and fare
  const estimatedKm = calculatedKm || 45;
  const estimatedFare = selectedVehicle.baseFare + (estimatedKm * selectedVehicle.pricePerKm);

  const handleHireSubmit = (e) => {
    e.preventDefault();

    // CRITICAL REQUIREMENT: Check user login status
    if (!user) {
      // Show popup "Please Login Or Register then Try again" -> clicking OK takes to Login
      triggerLoginRequiredAlert();
      return;
    }

    if (!pickup || !dropoff || !date || !time) {
      alert('Please complete all pickup, drop-off, date and time details.');
      return;
    }

    // Process hire booking
    const createdBooking = addHireBooking({
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      hireDate: date,
      hireTime: time,
      scheduleDate: date,
      scheduleTime: time,
      vehicle: selectedVehicle.name,
      vehicleModel: selectedVehicle.name,
      vehicleCategory: selectedVehicle.category,
      estimatedDistance: `${estimatedKm} km`,
      distance: `${estimatedKm} km`,
      distanceKm: `${estimatedKm} km`,
      estimatedFare: `LKR ${estimatedFare.toLocaleString()}`,
      totalLKR: estimatedFare,
      totalUSD: Math.round(estimatedFare / 330),
      passengers: passengerCount,
      flightNo,
      specialNote,
      specialNotes: specialNote,
      customer: user?.fullName || 'Valued Guest',
      fullName: user?.fullName || 'Valued Guest',
      email: user?.email || '',
      contactEmail: user?.email || '',
      phone: user?.phone || '',
      contactPhone: user?.phone || '',
      status: 'Pending Approval',
      dispatchConfirmed: false
    });

    setBookingSuccess(createdBooking);
  };

  return (
    <div className="hire-form-section">
      <div className="hire-form-container">
        {bookingSuccess ? (
          <div className="hire-success-card">
            <div className="hire-success-icon-badge">
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h2 className="hire-success-title">Hire Request Confirmed!</h2>
            <p className="hire-success-desc">
              Your luxury chauffeur hire has been successfully created. Our dispatch team is assigning your vehicle telemetry.
            </p>

            <div className="hire-success-details-grid">
              <div className="hire-success-detail-item">
                <span>Booking Reference:</span>
                <strong>{bookingSuccess.ref || (bookingSuccess.id?.startsWith('#') ? bookingSuccess.id : `#${bookingSuccess.id}`)}</strong>
              </div>
              <div className="hire-success-detail-item">
                <span>Vehicle Reserved:</span>
                <strong>{bookingSuccess.vehicle}</strong>
              </div>
              <div className="hire-success-detail-item">
                <span>Pickup Location:</span>
                <strong>{bookingSuccess.pickupLocation}</strong>
              </div>
              <div className="hire-success-detail-item">
                <span>Drop-off Destination:</span>
                <strong>{bookingSuccess.dropoffLocation}</strong>
              </div>
              <div className="hire-success-detail-item">
                <span>Scheduled Date & Time:</span>
                <strong>{bookingSuccess.hireDate} at {bookingSuccess.hireTime}</strong>
              </div>
              <div className="hire-success-detail-item">
                <span>Total Estimated Fare:</span>
                <strong className="hire-success-fare">{bookingSuccess.estimatedFare}</strong>
              </div>
            </div>

            <div className="hire-success-actions-row">
              <button 
                className="hire-success-track-btn" 
                onClick={() => navigate('/previous-hire')}
              >
                <Navigation size={16} /> Track Status in Previous Hire ➔
              </button>
              <button
                className="hire-success-reset-btn"
                onClick={() => {
                  setBookingSuccess(null);
                  setPickup('');
                  setDropoff('');
                  setDate('');
                  setTime('');
                }}
              >
                Place Another Hire
              </button>
            </div>
          </div>
        ) : (
          <div className="hire-form-layout">
            {/* Left: Interactive Form */}
            <div className="hire-form-card">
              <div className="hire-form-header">
                <h3>Book Your Chauffeur Hire</h3>
                <p>Select your route, timing, and luxury vehicle class.</p>
              </div>

              {!user && (
                <div className="hire-guest-notice" onClick={triggerLoginRequiredAlert}>
                  <ShieldAlert size={18} className="hire-notice-icon" />
                  <span>
                    Note: You are currently browsing as guest. Clicking Place Hire will prompt you to <strong>Login or Register</strong>.
                  </span>
                </div>
              )}

              <form onSubmit={handleHireSubmit}>
                <div className="hire-form-locations-box" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                  <LocationSearchInput
                    label="PICKUP LOCATION"
                    type="pickup"
                    value={pickup}
                    onChange={(val) => setPickup(val)}
                    onSelectCoordinate={(coord) => {
                      setPickupCoords(coord);
                      setPickup(coord.name);
                      handleCoordsUpdate(coord, dropoffCoords);
                    }}
                    onPickOnMap={() => setSelectingTarget(selectingTarget === 'pickup' ? null : 'pickup')}
                    isSelectingOnMap={selectingTarget === 'pickup'}
                    placeholder="Search Airport, Hotel, City or Address in Sri Lanka..."
                    required
                  />

                  <LocationSearchInput
                    label="DROP-OFF DESTINATION"
                    type="dropoff"
                    value={dropoff}
                    onChange={(val) => setDropoff(val)}
                    onSelectCoordinate={(coord) => {
                      setDropoffCoords(coord);
                      setDropoff(coord.name);
                      handleCoordsUpdate(pickupCoords, coord);
                    }}
                    onPickOnMap={() => setSelectingTarget(selectingTarget === 'dropoff' ? null : 'dropoff')}
                    isSelectingOnMap={selectingTarget === 'dropoff'}
                    placeholder="Search Destination, Landmark, Beach or City..."
                    required
                  />
                </div>

                {/* Real-time Interactive OpenStreetMap Route View */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Navigation size={13} color="#f59e0b" />
                    OpenStreetMap Live Route & Distance Telemetry
                  </label>
                  <LeafletRouteMap
                    pickupLocation={pickup}
                    dropoffLocation={dropoff}
                    pickupCoords={pickupCoords}
                    dropoffCoords={dropoffCoords}
                    selectingTarget={selectingTarget}
                    onLocationSelected={(loc) => {
                      if (loc.target === 'pickup') {
                        setPickup(loc.name);
                        setPickupCoords({ lat: loc.lat, lng: loc.lng, name: loc.name });
                        handleCoordsUpdate({ lat: loc.lat, lng: loc.lng }, dropoffCoords);
                      } else if (loc.target === 'dropoff') {
                        setDropoff(loc.name);
                        setDropoffCoords({ lat: loc.lat, lng: loc.lng, name: loc.name });
                        handleCoordsUpdate(pickupCoords, { lat: loc.lat, lng: loc.lng });
                      }
                      setSelectingTarget(null);
                    }}
                    height="200px"
                    theme="light"
                    interactive={true}
                  />
                </div>

                <div className="hire-form-grid-2">
                  <div className="hire-input-group">
                    <label>PICKUP DATE</label>
                    <div className="hire-input-field">
                      <Calendar size={18} className="hire-field-icon" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="hire-input-group">
                    <label>PICKUP TIME</label>
                    <div className="hire-input-field">
                      <Clock size={18} className="hire-field-icon" />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="hire-form-grid-2">
                  <div className="hire-input-group">
                    <label>PASSENGERS</label>
                    <select
                      className="hire-select-field"
                      value={passengerCount}
                      onChange={(e) => setPassengerCount(Number(e.target.value))}
                    >
                      <option value={1}>1 Passenger</option>
                      <option value={2}>2 Passengers</option>
                      <option value={3}>3 Passengers</option>
                      <option value={4}>4 Passengers (Sedan Limit)</option>
                      <option value={6}>6 Passengers (SUV/Van)</option>
                      <option value={9}>9+ Passengers (VIP Coach)</option>
                    </select>
                  </div>

                  <div className="hire-input-group">
                    <label>FLIGHT NUMBER (OPTIONAL)</label>
                    <input
                      type="text"
                      className="hire-simple-input"
                      placeholder="e.g. UL-504 (Airport Pickups)"
                      value={flightNo}
                      onChange={(e) => setFlightNo(e.target.value)}
                    />
                  </div>
                </div>

                {/* Vehicle Selection Cards */}
                <div className="hire-vehicle-picker-section">
                  <label className="hire-picker-label">CHOOSE FLEET CLASS</label>
                  <div className="hire-vehicle-options-grid">
                    {HIRE_VEHICLE_OPTIONS.map((veh) => (
                      <div
                        key={veh.id}
                        className={`hire-vehicle-card-choice ${selectedVehicle.id === veh.id ? 'active' : ''}`}
                        onClick={() => setSelectedVehicle(veh)}
                      >
                        <img src={veh.image} alt={veh.name} className="hire-choice-img" />
                        <div className="hire-choice-info">
                          <span className="hire-choice-cat">{veh.category}</span>
                          <strong className="hire-choice-name">{veh.name}</strong>
                          <span className="hire-choice-rate">LKR {veh.pricePerKm}/km</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="hire-form-submit-btn">
                  <Car size={20} /> Place Hire Request <ArrowRight size={20} />
                </button>
              </form>
            </div>

            {/* Right: Booking Summary Estimator */}
            <div className="hire-summary-card">
              <h4 className="hire-summary-title">Fare & Service Summary</h4>
              <div className="hire-summary-vehicle-preview">
                <img src={selectedVehicle.image} alt={selectedVehicle.name} className="hire-preview-img" />
                <div className="hire-preview-text">
                  <span className="hire-badge-pill">{selectedVehicle.category}</span>
                  <strong>{selectedVehicle.name}</strong>
                </div>
              </div>

              <div className="hire-summary-breakdown">
                <div className="hire-summary-row">
                  <span>Base Booking Charge:</span>
                  <strong>LKR {selectedVehicle.baseFare.toLocaleString()}</strong>
                </div>
                <div className="hire-summary-row">
                  <span>Est. Distance ({estimatedKm} km):</span>
                  <strong>LKR {(estimatedKm * selectedVehicle.pricePerKm).toLocaleString()}</strong>
                </div>
                <div className="hire-summary-row">
                  <span>Punctual Chauffeur & Tolls:</span>
                  <strong className="hire-free-text">INCLUDED</strong>
                </div>
                <div className="hire-summary-divider" />
                <div className="hire-summary-row hire-total-row">
                  <span>Total Estimated Fare:</span>
                  <strong className="hire-total-amount">LKR {estimatedFare.toLocaleString()}</strong>
                </div>
              </div>

              <div className="hire-summary-trust-perks">
                <div className="hire-perk"><UserCheck size={16} /> Uniformed Licensed Driver</div>
                <div className="hire-perk"><CreditCard size={16} /> Pay via Cash or Card on Trip</div>
                <div className="hire-perk"><CheckCircle size={16} /> Free Flight Delay Waiting</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HireForm;
