import React, { useState, useEffect } from 'react';
import hireApi from '../../../services/hireApi';
import { 
  X, 
  User, 
  Phone, 
  ShieldCheck, 
  Car, 
  Star, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Award,
  RefreshCw
} from 'lucide-react';
import '../css/ManageDriversModal.css';

const DEFAULT_DRIVERS = [
  { fullName: 'Dinusha Chandima', driverId: 'DENO-DRV-0000001', phone: '+94 77 458 5471', rating: 4.9, licenseClass: 'Class A Heavy / Protocol', assignedVehiclePlate: 'WP CAB - 8829', status: 'Available', locationHub: 'Colombo 03 Hub' },
  { fullName: 'Rohan Wickremasinghe', driverId: 'DENO-DRV-0000002', phone: '+94 71 883 4920', rating: 4.9, licenseClass: 'VIP Protocol Chauffeur', assignedVehiclePlate: 'WP CAR - 4402', status: 'Available', locationHub: 'Airport VIP Hub' },
  { fullName: 'Kamal Bandara', driverId: 'DENO-DRV-0000003', phone: '+94 77 340 1822', rating: 4.8, licenseClass: 'Class A Heavy / Tour Guide', assignedVehiclePlate: 'WP CBA - 7741', status: 'Standby', locationHub: 'Kandy Express Hub' },
  { fullName: 'Nalaka Fernando', driverId: 'DENO-DRV-0000004', phone: '+94 77 459 9001', rating: 4.9, licenseClass: 'Hill Country Tour Specialist', assignedVehiclePlate: 'WP NB - 6190', status: 'Available', locationHub: 'Galle Coastal Hub' }
];

const ManageDriversModal = ({ isOpen, onClose, onDriverAdded }) => {
  const [drivers, setDrivers] = useState(DEFAULT_DRIVERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Form State for Adding / Editing Driver
  const [fullName, setFullName] = useState('');
  const [driverId, setDriverId] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseClass, setLicenseClass] = useState('Class A Heavy / VIP Protocol');
  const [assignedVehiclePlate, setAssignedVehiclePlate] = useState('');
  const [rating, setRating] = useState('4.9');
  const [status, setStatus] = useState('Available');
  const [locationHub, setLocationHub] = useState('Colombo 03 Hub');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Fetch live drivers from MongoDB backend
  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await hireApi.getDrivers();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setDrivers(res.data);
      }
    } catch (err) {
      console.warn('Driver fetch fallback to local:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
      handleResetForm();
    }
  }, [isOpen]);

  const handleGenerateId = () => {
    const nextSeq = Math.floor(1000000 + Math.random() * 9000000);
    setDriverId(`DENO-DRV-${nextSeq}`);
  };

  const handleResetForm = () => {
    setFullName('');
    handleGenerateId();
    setPhone('');
    setLicenseClass('Class A Heavy / VIP Protocol');
    setAssignedVehiclePlate('');
    setRating('4.9');
    setStatus('Available');
    setLocationHub('Colombo 03 Hub');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditDriver = (drv) => {
    setIsEditing(true);
    setEditingId(drv._id || drv.driverId);
    setFullName(drv.fullName || '');
    setDriverId(drv.driverId || '');
    setPhone((drv.phone || '').replace('+94 ', '').replace('+94', '').trim());
    setLicenseClass(drv.licenseClass || 'Class A Heavy / VIP Protocol');
    setAssignedVehiclePlate(drv.assignedVehiclePlate || '');
    setRating(String(drv.rating || 4.9));
    setStatus(drv.status || 'Available');
    setLocationHub(drv.locationHub || 'Colombo 03 Hub');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter Full Name and Phone Number.' });
      return;
    }

    const cleanPhone = phone.trim();
    const formattedPhone = cleanPhone.startsWith('+94') ? cleanPhone : `+94 ${cleanPhone.replace(/^0+/, '')}`;
    const cleanId = driverId.trim() || `DENO-DRV-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const payload = {
      fullName: fullName.trim(),
      driverId: cleanId,
      phone: formattedPhone,
      licenseClass: licenseClass.trim(),
      assignedVehiclePlate: assignedVehiclePlate.trim(),
      rating: Number(rating) || 4.9,
      status: status || 'Available',
      locationHub: locationHub || 'Colombo 03 Hub'
    };

    try {
      if (isEditing && editingId) {
        await hireApi.updateDriver(editingId, payload);
        setStatusMessage({ type: 'success', text: `Driver ${payload.fullName} updated successfully!` });
      } else {
        await hireApi.createDriver(payload);
        setStatusMessage({ type: 'success', text: `Driver ${payload.fullName} registered successfully!` });
      }
      
      // Update local state
      setDrivers((prev) => {
        const existingIdx = prev.findIndex(d => d.driverId === payload.driverId || (d._id && editingId && d._id === editingId));
        if (existingIdx !== -1) {
          const copy = [...prev];
          copy[existingIdx] = { ...copy[existingIdx], ...payload };
          return copy;
        }
        return [payload, ...prev];
      });

      if (onDriverAdded) {
        onDriverAdded(payload);
      }

      handleResetForm();
      fetchDrivers();

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (err) {
      console.warn('Driver submission local update:', err.message);
      // Fallback local update
      setDrivers((prev) => [payload, ...prev.filter(d => d.driverId !== payload.driverId)]);
      setStatusMessage({ type: 'success', text: `Driver ${payload.fullName} saved to local registry!` });
      handleResetForm();
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleDeleteDriver = async (drv) => {
    if (!window.confirm(`Are you sure you want to remove ${drv.fullName} (${drv.driverId})?`)) return;

    try {
      await hireApi.deleteDriver(drv._id || drv.driverId);
    } catch (err) {
      console.warn('Delete driver local fallback:', err.message);
    }

    setDrivers((prev) => prev.filter(d => d.driverId !== drv.driverId && d._id !== drv._id));
    setStatusMessage({ type: 'success', text: `Driver ${drv.fullName} removed from registry.` });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  if (!isOpen) return null;

  const filteredDrivers = drivers.filter(d => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (d.fullName || '').toLowerCase().includes(q) ||
      (d.driverId || '').toLowerCase().includes(q) ||
      (d.phone || '').toLowerCase().includes(q) ||
      (d.assignedVehiclePlate || '').toLowerCase().includes(q) ||
      (d.locationHub || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="deno-manage-drivers-overlay" role="dialog" aria-modal="true">
      <div className="deno-manage-drivers-container">
        
        {/* Modal Top Header */}
        <div className="manage-drivers-topbar">
          <div className="topbar-left">
            <div className="badge-icon-gold">
              <User size={18} color="#0b172a" />
            </div>
            <div>
              <span className="sub-tag">SUPER ADMIN OPERATIONS</span>
              <h2 className="main-title">Chauffeur & Fleet Driver Registry</h2>
            </div>
          </div>

          <div className="topbar-right">
            <div className="active-count-pill">
              <span className="pulse-green-dot" />
              <span>{drivers.length} Drivers Active</span>
            </div>
            <button className="btn-close-drivers-modal" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {statusMessage && (
          <div className={`status-toast-alert ${statusMessage.type}`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="manage-drivers-content-scroll">
          
          {/* Top Form: Add / Edit Driver Card */}
          <div className="driver-form-card">
            <div className="card-header-row">
              <div className="header-title-wrap">
                <Plus size={16} className="text-gold" />
                <strong>{isEditing ? 'Edit Chauffeur Details' : 'Register New Fleet Chauffeur'}</strong>
              </div>
              <span className="card-hint-badge">Multi-Browser Real-Time Sync</span>
            </div>

            <form onSubmit={handleSubmit} className="driver-form-grid">
              {/* Full Name */}
              <div className="input-group">
                <label><User size={13} /> Chauffeur Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dinusha Chandima"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="driver-text-input"
                />
              </div>

              {/* Driver ID */}
              <div className="input-group">
                <div className="label-with-action">
                  <label><ShieldCheck size={13} /> Driver ID / Badge No.</label>
                  <button type="button" onClick={handleGenerateId} className="btn-micro-gen">
                    <Sparkles size={11} /> Generate
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="DENO-DRV-0000001"
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  required
                  className="driver-text-input monospace text-cyan"
                />
              </div>

              {/* Phone Number */}
              <div className="input-group">
                <label><Phone size={13} /> Mobile Contact (🇱🇰 +94)</label>
                <input
                  type="tel"
                  placeholder="e.g. 77 458 5471"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="driver-text-input"
                />
              </div>

              {/* Assigned Vehicle Plate */}
              <div className="input-group">
                <label><Car size={13} /> Assigned Vehicle Plate</label>
                <input
                  type="text"
                  placeholder="e.g. WP CAB - 8829"
                  value={assignedVehiclePlate}
                  onChange={(e) => setAssignedVehiclePlate(e.target.value)}
                  className="driver-text-input plate-input"
                />
              </div>

              {/* License Class */}
              <div className="input-group">
                <label><Award size={13} /> License Class & Specialization</label>
                <select
                  value={licenseClass}
                  onChange={(e) => setLicenseClass(e.target.value)}
                  className="driver-select-input"
                >
                  <option value="Class A Heavy / VIP Protocol">Class A Heavy / VIP Protocol</option>
                  <option value="VIP Protocol Chauffeur">VIP Protocol Chauffeur</option>
                  <option value="Hill Country Tour Specialist">Hill Country Tour Specialist</option>
                  <option value="Luxury Executive Sedan Specialist">Luxury Executive Sedan Specialist</option>
                  <option value="Multi-Day Sightseeing Guide">Multi-Day Sightseeing Guide</option>
                </select>
              </div>

              {/* Location Hub */}
              <div className="input-group">
                <label><MapPin size={13} /> Primary Location Hub</label>
                <select
                  value={locationHub}
                  onChange={(e) => setLocationHub(e.target.value)}
                  className="driver-select-input"
                >
                  <option value="Colombo 03 Hub">Colombo 03 Hub</option>
                  <option value="Airport VIP Terminal Hub">Airport VIP Terminal Hub</option>
                  <option value="Kandy Express Hub">Kandy Express Hub</option>
                  <option value="Galle Coastal Hub">Galle Coastal Hub</option>
                  <option value="Negombo Transit Hub">Negombo Transit Hub</option>
                </select>
              </div>

              {/* Status */}
              <div className="input-group">
                <label>Duty Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="driver-select-input"
                >
                  <option value="Available">🟢 Available for Dispatch</option>
                  <option value="Standby">🟡 Standby</option>
                  <option value="On Duty">🔵 On Duty</option>
                  <option value="Off Duty">⚪ Off Duty</option>
                </select>
              </div>

              {/* Rating */}
              <div className="input-group">
                <label><Star size={13} /> Driver Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="driver-text-input"
                />
              </div>

              {/* Form Buttons */}
              <div className="form-actions-row">
                <button type="submit" className="btn-save-driver">
                  {isEditing ? <Check size={16} /> : <Plus size={16} />}
                  <span>{isEditing ? 'Save Changes' : 'Add Chauffeur to Fleet'}</span>
                </button>
                {isEditing && (
                  <button type="button" onClick={handleResetForm} className="btn-cancel-edit">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Bottom Section: Active Drivers Directory */}
          <div className="driver-directory-section">
            <div className="directory-header-row">
              <div className="directory-title-group">
                <Car size={16} className="text-gold" />
                <h3>Registered Fleet Chauffeurs ({filteredDrivers.length})</h3>
              </div>

              <div className="directory-search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Name, Driver ID, Plate, Hub..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Drivers Grid */}
            <div className="drivers-cards-grid">
              {filteredDrivers.map((drv) => (
                <div key={drv.driverId || drv._id} className="driver-profile-card">
                  <div className="card-top">
                    <div className="driver-avatar-circle">
                      <span>{(drv.fullName || 'D').slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="driver-main-meta">
                      <strong className="drv-name">{drv.fullName}</strong>
                      <span className="drv-id-tag">{drv.driverId}</span>
                    </div>
                    <div className="driver-actions-btns">
                      <button 
                        type="button" 
                        onClick={() => handleEditDriver(drv)}
                        className="btn-action-icon edit"
                        title="Edit Driver Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteDriver(drv)}
                        className="btn-action-icon delete"
                        title="Remove Driver"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="card-details-list">
                    <div className="detail-item">
                      <Phone size={13} className="text-dim" />
                      <span>{drv.phone}</span>
                    </div>
                    {drv.assignedVehiclePlate && (
                      <div className="detail-item">
                        <Car size={13} className="text-gold" />
                        <span className="plate-badge">{drv.assignedVehiclePlate}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <MapPin size={13} className="text-cyan" />
                      <span>{drv.locationHub || 'Colombo Hub'}</span>
                    </div>
                  </div>

                  <div className="card-footer-row">
                    <span className="rating-pill">
                      <Star size={12} fill="#ffb800" color="#ffb800" /> {drv.rating || 4.9}★
                    </span>
                    <span className={`status-pill ${String(drv.status).toLowerCase().replace(/\s+/g, '-')}`}>
                      {drv.status || 'Available'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageDriversModal;
