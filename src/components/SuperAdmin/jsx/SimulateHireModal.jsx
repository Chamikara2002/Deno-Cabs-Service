import React, { useState } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminAuthContext';
import { 
  X, 
  Plus, 
  Car, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Banknote, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import '../css/SimulateHireModal.css';

const PRESET_VEHICLES = [
  { model: 'Toyota Land Cruiser V8', plate: 'WP CAB - 8829', type: 'Luxury SUV', baseRate: 115000 },
  { model: 'Mercedes-Benz S-Class', plate: 'WP CAR - 4402', type: 'Executive Sedan', baseRate: 98000 },
  { model: 'Mitsubishi Montero Sport', plate: 'WP CBA - 7741', type: 'Premium SUV', baseRate: 64000 },
  { model: 'Toyota HiAce Super Grandia', plate: 'WP NB - 6190', type: 'Executive Van', baseRate: 82000 },
  { model: 'BMW 7 Series Executive', plate: 'WP CAG - 5510', type: 'Luxury Sedan', baseRate: 120000 }
];

const SimulateHireModal = ({ isOpen, onClose }) => {
  const { addSimulatedHire } = useSuperAdmin();

  const [customer, setCustomer] = useState('Kasun Jayasinghe');
  const [corporate, setCorporate] = useState('Ceylon Global Logistics');
  const [pickupLocation, setPickupLocation] = useState('Kingsbury Hotel, Colombo 01');
  const [dropoffLocation, setDropoffLocation] = useState('Anantara Peace Haven, Tangalle');
  const [distance, setDistance] = useState('195 km');
  const [selectedVehicleIdx, setSelectedVehicleIdx] = useState(0);
  const [scheduleDate, setScheduleDate] = useState('16 Oct 2026');
  const [scheduleTime, setScheduleTime] = useState('07:30 AM');
  const [totalLKR, setTotalLKR] = useState(115000);
  const [status, setStatus] = useState('Pending Dispatch');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVehicleSelect = (idx) => {
    setSelectedVehicleIdx(idx);
    setTotalLKR(PRESET_VEHICLES[idx].baseRate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const vehicle = PRESET_VEHICLES[selectedVehicleIdx];

    addSimulatedHire({
      customer,
      corporate,
      pickupLocation,
      dropoffLocation,
      distance,
      vehicleModel: vehicle.model,
      vehiclePlate: vehicle.plate,
      vehicleType: vehicle.type,
      scheduleDate,
      scheduleTime,
      totalLKR,
      status
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="deno-admin-modal-overlay">
      <div className="deno-admin-modal-container simulate-modal">
        <div className="deno-admin-modal-header">
          <div className="deno-modal-title-group">
            <div className="deno-modal-icon-badge gold-glow">
              <Plus size={20} />
            </div>
            <div>
              <h3 className="deno-modal-title">Simulate Inbound Hire Booking</h3>
              <p className="deno-modal-subtitle">Inject live booking into Dispatch & Management console</p>
            </div>
          </div>
          <button className="deno-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="deno-otp-success-screen">
            <div className="deno-otp-success-icon">
              <CheckCircle2 size={48} />
            </div>
            <h3>Inbound Hire Dispatched!</h3>
            <p>New booking has been pushed to the live management dashboard.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="simulate-modal-form">
            <div className="simulate-grid-2">
              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <User size={14} /> Passenger / Client Name
                </label>
                <input
                  type="text"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  required
                  className="deno-admin-input"
                />
              </div>

              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">Corporate / Organization</label>
                <input
                  type="text"
                  value={corporate}
                  onChange={(e) => setCorporate(e.target.value)}
                  className="deno-admin-input"
                />
              </div>
            </div>

            <div className="simulate-grid-2">
              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <MapPin size={14} /> Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  required
                  className="deno-admin-input"
                />
              </div>

              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <MapPin size={14} /> Destination & Est. Distance
                </label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  required
                  className="deno-admin-input"
                />
              </div>
            </div>

            <div className="deno-admin-form-group">
              <label className="deno-admin-form-label">
                <Car size={14} /> Assigned Fleet Vehicle
              </label>
              <div className="simulate-vehicle-chips">
                {PRESET_VEHICLES.map((v, i) => (
                  <button
                    key={v.model}
                    type="button"
                    className={`vehicle-chip-btn ${selectedVehicleIdx === i ? 'active' : ''}`}
                    onClick={() => handleVehicleSelect(i)}
                  >
                    <strong>{v.model}</strong>
                    <small>{v.plate}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="simulate-grid-3">
              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <Calendar size={14} /> Schedule Date
                </label>
                <input
                  type="text"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="deno-admin-input"
                />
              </div>

              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <Clock size={14} /> Time
                </label>
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="deno-admin-input"
                />
              </div>

              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <Banknote size={14} /> Amount (LKR)
                </label>
                <input
                  type="number"
                  value={totalLKR}
                  onChange={(e) => setTotalLKR(e.target.value)}
                  className="deno-admin-input"
                />
              </div>
            </div>

            <div className="deno-admin-modal-actions">
              <button type="button" className="deno-admin-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="deno-admin-btn-primary">
                <Sparkles size={16} /> Dispatch Inbound Hire
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SimulateHireModal;
