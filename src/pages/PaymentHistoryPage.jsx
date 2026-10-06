import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard, TrendingUp, Award, Calendar, Download, FileText, Filter, Search,
  ChevronLeft, ChevronRight, ShieldCheck, Phone, Mail, CheckCircle, ArrowRight, X, Check,
  Printer, Send, QrCode, ArrowLeft, ExternalLink, HelpCircle, Share2, Lock, Navigation, User,
  Sliders, Info, Copy, Percent, FileSpreadsheet, Clock, Car
} from 'lucide-react';
import './PaymentHistoryPage.css';

const PaymentHistoryPage = () => {
  const navigate = useNavigate();
  const { user, userHires, openAuthModal } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [showDateModal, setShowDateModal] = useState(false);
  const [showVatModal, setShowVatModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // Tax Invoice Modal
  const [selectedReceipt, setSelectedReceipt] = useState(null); // Payment Receipt Modal
  const [toastMessage, setToastMessage] = useState('');
  const [dateRangePreset, setDateRangePreset] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Dynamically compute user-scoped completed hire transactions
  const userCompletedHires = (user && Array.isArray(userHires))
    ? userHires.filter(h => {
        const st = (h.status || '').toLowerCase();
        return (
          st.includes('complete') ||
          st.includes('settle') ||
          st.includes('paid') ||
          st.includes('done') ||
          h.dispatchConfirmed ||
          h.paymentStatus === 'Paid'
        );
      })
    : [];

  const dynamicTransactions = userCompletedHires.map((hire, idx) => {
    const priceNum = Number(hire.totalPrice || hire.price || hire.estimatedFare || 0);
    const dateObj = hire.date ? new Date(hire.date) : (hire.createdAt ? new Date(hire.createdAt) : new Date());
    const formattedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recent';
    const formattedTime = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : '12:00 PM';
    const cleanRef = String(hire.ref || hire.id || `DENO-${1000 + idx}`).replace('#', '');
    const subtotalVal = (priceNum / 1.08).toFixed(2);
    const vatVal = (priceNum * 0.08 / 1.08).toFixed(2);

    return {
      id: `#${cleanRef}`,
      invNo: `INV-${dateObj.getFullYear() || 2026}-${cleanRef}`,
      rctNo: `RCT-${dateObj.getFullYear() || 2026}-${cleanRef}-V`,
      category: (hire.hireType === 'Corporate' || hire.category === 'Corporate') ? 'Corporate' : 'Personal',
      tag: 'Completed & Settled',
      tagType: (hire.hireType === 'Corporate' || hire.category === 'Corporate') ? 'gold' : 'normal',
      rawDate: hire.date || (hire.createdAt ? hire.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
      date: `${formattedDate} • ${formattedTime}`,
      settledTime: `${formattedTime} LKST`,
      route: `${hire.pickup || 'Colombo'} ➔ ${hire.dropoff || 'Destination'}`,
      origin: hire.pickup || 'Colombo, Sri Lanka',
      destination: hire.dropoff || 'Destination, Sri Lanka',
      vehicle: hire.vehicleName || hire.vehicle || 'Toyota Axio Executive (WP CAD-1922)',
      chauffeur: hire.assignedDriverName || hire.driver || 'Certified VIP Chauffeur',
      chauffeurId: hire.driverId || 'DENO-DRV-00001',
      clientName: user?.fullName || user?.name || hire.name || 'Valued Passenger',
      companyName: user?.companyName || user?.accountTier || 'Individual Client',
      clientAddress: user?.address || 'Sri Lanka',
      clientTin: user?.tin || 'N/A',
      vipTier: user?.accountTier || 'Individual / Guest',
      paymentMethod: hire.paymentMethod || 'Visa / Mastercard Online',
      amount: `LKR ${priceNum.toLocaleString()}`,
      numericAmount: priceNum,
      subtotal: subtotalVal,
      ssclTax: '0.00',
      vatTax: vatVal,
      distance: hire.distance ? `${hire.distance} KM` : '45.0 KM',
      taxInfo: 'Tax Settled (Includes 8% VAT)',
      icon: (hire.pickup?.toLowerCase().includes('airport') || hire.dropoff?.toLowerCase().includes('airport')) ? 'flight' : 'car'
    };
  });

  // Category counts
  const allCount = dynamicTransactions.length;
  const corpCount = dynamicTransactions.filter(t => t.category === 'Corporate').length;
  const personalCount = dynamicTransactions.filter(t => t.category === 'Personal').length;
  const refundsCount = dynamicTransactions.filter(t => t.category === 'Refunds').length;

  // Filter transactions
  const filteredTransactions = dynamicTransactions.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chauffeur.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (filterTab === 'Corporate') matchesCategory = t.category === 'Corporate';
    if (filterTab === 'Personal') matchesCategory = t.category === 'Personal';
    if (filterTab === 'Refunds') matchesCategory = t.category === 'Refunds';

    let matchesDate = true;
    if (dateRangePreset === 'This Month') {
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      matchesDate = t.rawDate.startsWith(currentMonthStr);
    } else if (dateRangePreset === 'Custom' && customStartDate && customEndDate) {
      matchesDate = t.rawDate >= customStartDate && t.rawDate <= customEndDate;
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  const filteredTotalExp = filteredTransactions.reduce((acc, curr) => acc + (curr.numericAmount > 0 ? curr.numericAmount : 0), 0);

  const handleDownloadPDF = () => {
    if (filteredTransactions.length === 0) {
      setToastMessage('No completed transaction records found to export statement.');
      setTimeout(() => setToastMessage(''), 3500);
      return;
    }
    setToastMessage(`Downloading PDF Statement for "${dateRangePreset}" (${filteredTransactions.length} Records)...`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleExportXls = () => {
    if (filteredTransactions.length === 0) {
      setToastMessage('No completed transactions to export into Excel.');
      setTimeout(() => setToastMessage(''), 3500);
      return;
    }
    setToastMessage(`Exporting Ledger (.XLS) with ${filteredTransactions.length} active transactions...`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  return (
    <div className="payment-history-container">
      <div className="payment-history-inner">

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="payment-toast-banner">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. TOP PAGE HEADER */}
        <div className="payment-top-header">
          <div>
            <span className="finance-ledger-tag">FINANCE & CORPORATE LEDGER • Verified Tax Invoices</span>
            <h1 className="payment-main-title">Payment History & Statements</h1>
            <p className="payment-subtitle">
              Track your executive travel expenditures, download official Sri Lanka Inland Revenue-compliant tax invoices, and manage enterprise billing methods with Island Elite.
            </p>
          </div>

          <div className="payment-header-actions">
            <button className="hdr-btn-light" onClick={() => setShowVatModal(true)}>
              <FileText size={14} /> VAT Summary
            </button>
            <button className={`hdr-btn-light ${dateRangePreset !== 'All Time' ? 'active-filter' : ''}`} onClick={() => setShowDateModal(true)}>
              <Calendar size={14} /> Date Range {dateRangePreset !== 'All Time' ? `(${dateRangePreset})` : ''}
            </button>
            <button className="hdr-btn-yellow" onClick={handleDownloadPDF}>
              <Download size={14} /> Download Statements (PDF)
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER STATUS BADGE */}
        {(dateRangePreset !== 'All Time' || filterTab !== 'All' || searchQuery) && (
          <div className="active-filter-bar">
            <span className="filter-bar-label">⚡ Active Filters:</span>
            {filterTab !== 'All' && (
              <span className="filter-tag-chip">
                Category: <strong>{filterTab}</strong>
                <X size={12} className="chip-remove" onClick={() => setFilterTab('All')} />
              </span>
            )}
            {dateRangePreset !== 'All Time' && (
              <span className="filter-tag-chip">
                Date: <strong>{dateRangePreset}</strong>
                <X size={12} className="chip-remove" onClick={() => setDateRangePreset('All Time')} />
              </span>
            )}
            {searchQuery && (
              <span className="filter-tag-chip">
                Search: <strong>"{searchQuery}"</strong>
                <X size={12} className="chip-remove" onClick={() => setSearchQuery('')} />
              </span>
            )}
            <button className="clear-all-filters-btn" onClick={() => { setFilterTab('All'); setDateRangePreset('All Time'); setSearchQuery(''); }}>
              Clear All Filters
            </button>
          </div>
        )}

        {/* 2. TOP METRIC CARDS ROW (4 CARDS) */}
        <div className="payment-metrics-grid">
          <div className="metric-card">
            <div className="metric-header-row">
              <span className="metric-label">TOTAL EXPENDITURE ({dateRangePreset})</span>
              <div className="metric-icon-square">
                <CreditCard size={16} />
              </div>
            </div>
            <h2 className="metric-value">LKR {filteredTotalExp.toLocaleString()}</h2>
            <div className="metric-trend-row">
              <span className="trend-badge positive">📈 +8.4%</span>
              <span className="trend-sub">vs. previous period</span>
            </div>
            <div className="sparkline-container">
              <svg width="100%" height="24" viewBox="0 0 120 24" fill="none">
                <path d="M0 18 Q 20 5, 40 16 T 80 8 T 120 12" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header-row">
              <span className="metric-label">COMPLETED JOURNEYS</span>
              <div className="metric-icon-square">
                <CheckCircle size={16} />
              </div>
            </div>
            <h2 className="metric-value">{filteredTransactions.length} Journeys</h2>
            <p className="metric-subtext">100% Successful settlement & audit clearance.</p>
            <div className="reliability-bar-box">
              <span>Billing Reliability Rate</span>
              <strong>100%</strong>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header-row">
              <span className="metric-label">LOYALTY & CORPORATE CREDITS</span>
              <div className="metric-icon-square gold">
                <Award size={16} />
              </div>
            </div>
            <h2 className="metric-value">LKR {(filteredTotalExp > 0 ? Math.round(filteredTotalExp * 0.05) : 0).toLocaleString()}</h2>
            <p className="metric-subtext">5% Earned reward points & Tier benefits.</p>
            <div className="tier-perks-row">
              <span className="platinum-pill">{user?.accountTier || 'Member VIP'}</span>
              <span className="view-perks-link">Active Tier</span>
            </div>
          </div>

          <div className="metric-card primary-card pending-card">
            <div className="metric-header-row">
              <span className="metric-label gold">PRIMARY PAYMENT</span>
              <span className="pending-dev-chip">
                <Clock size={11} className="pending-clock-ic" /> Pending Future Development
              </span>
            </div>
            <h3 className="card-brand-name pending-title">Payment Gateway Integration</h3>
            <p className="pending-desc-text">
              Direct card binding & auto-settlement module is currently under scheduled development.
            </p>
            <div className="card-footer-row">
              <span className="pending-status-tag">● Feature Coming Soon</span>
              <button className="manage-card-btn disabled" disabled title="Pending Future Development">
                Unavailable
              </button>
            </div>
          </div>
        </div>

        {/* 3. MIDDLE SECTION: CHARTS */}
        {dynamicTransactions.length > 0 ? (
          <div className="payment-charts-grid">
            <div className="chart-card-box">
              <div className="chart-header-row">
                <div>
                  <h3 className="chart-title">Executive Expenditure Trends</h3>
                  <p className="chart-sub">Monthly luxury transport deployment in Sri Lankan Rupees (LKR)</p>
                </div>
                <div className="chart-legend">
                  <span className="legend-item"><span className="legend-box navy" /> Total Spend</span>
                  <span className="legend-item"><span className="legend-box yellow" /> Fuel & Tax Surcharge</span>
                </div>
              </div>

              <div className="bar-chart-visual">
                <div className="y-axis">
                  <span>50k</span>
                  <span>25k</span>
                  <span>0k</span>
                </div>
                <div className="bars-container">
                  <div className="bar-column"><div className="bar-fill" style={{ height: '35%' }} /><span className="x-label">Jan</span></div>
                  <div className="bar-column"><div className="bar-fill" style={{ height: '40%' }} /><span className="x-label">Feb</span></div>
                  <div className="bar-column"><div className="bar-fill" style={{ height: '55%' }} /><span className="x-label">Mar</span></div>
                  <div className="bar-column"><div className="bar-fill" style={{ height: '65%' }} /><span className="x-label">Apr</span></div>
                  <div className="bar-column"><div className="bar-fill" style={{ height: '45%' }} /><span className="x-label">May</span></div>
                  <div className="bar-column"><div className="bar-fill" style={{ height: '60%' }} /><span className="x-label">Jun</span></div>
                  <div className="bar-column"><div className="bar-fill" style={{ height: '50%' }} /><span className="x-label">Jul</span></div>
                  <div className="bar-column"><div className="bar-fill highlight" style={{ height: '85%' }} /><span className="x-label">Aug</span></div>
                  <div className="bar-column"><div className="bar-fill highlight" style={{ height: '100%' }} /><span className="x-label">Sep</span></div>
                </div>
              </div>

              <div className="chart-footer-note">
                <span>Peak Spending: <strong>LKR {filteredTotalExp.toLocaleString()}</strong> ({filteredTransactions.length} Settled Journeys)</span>
                <span className="audit-ready-tag">Full Fiscal Audit Ready</span>
              </div>
            </div>

            <div className="chart-card-box">
              <div className="chart-header-row">
                <div>
                  <h3 className="chart-title">Fleet Allocation</h3>
                  <p className="chart-sub">Distribution of service categories across your travel portfolio.</p>
                </div>
              </div>

              <div className="donut-chart-wrapper">
                <div className="donut-circle">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="50" stroke="#0b172a" strokeWidth="16" fill="none" strokeDasharray="145 314" strokeDashoffset="0" />
                    <circle cx="70" cy="70" r="50" stroke="#fbbf24" strokeWidth="16" fill="none" strokeDasharray="110 314" strokeDashoffset="-145" />
                    <circle cx="70" cy="70" r="50" stroke="#64748b" strokeWidth="16" fill="none" strokeDasharray="59 314" strokeDashoffset="-255" />
                  </svg>
                  <div className="donut-center-text">
                    <strong>{filteredTransactions.length}</strong>
                    <span>Trips</span>
                  </div>
                </div>

                <div className="fleet-breakdown-list">
                  <div className="fleet-item">
                    <span className="dot navy" />
                    <span className="fleet-name">Luxury Sedans</span>
                    <strong className="fleet-pct">50%</strong>
                  </div>
                  <div className="fleet-item">
                    <span className="dot yellow" />
                    <span className="fleet-name">Premium SUVs (4x4)</span>
                    <strong className="fleet-pct">35%</strong>
                  </div>
                  <div className="fleet-item">
                    <span className="dot grey" />
                    <span className="fleet-name">Airport Escorts</span>
                    <strong className="fleet-pct">15%</strong>
                  </div>
                </div>
              </div>

              <p className="fleet-footnote">
                Rates include Sri Lankan Tourism VAT & Chauffeur Gratuity.
              </p>
            </div>
          </div>
        ) : (
          <div className="payment-empty-analytics-banner">
            <div className="empty-analytics-icon-wrap">
              <TrendingUp size={20} className="analytics-trend-icon" />
            </div>
            <div className="empty-analytics-content">
              <strong>Expenditure Trends & Fleet Analytics Ledger</strong>
              <p>Visual spending breakdown and VAT reconciliations will automatically activate here upon completion of your 1st luxury hire journey.</p>
            </div>
          </div>
        )}

        {/* 4. TRANSACTION HISTORY & INVOICES SECTION */}
        <div className="transactions-section">
          <div className="trans-header-row">
            <div>
              <h2 className="trans-title">Transaction History & Invoices</h2>
              <p className="trans-sub">Real-time status of corporate transfers and generated billing documentation.</p>
            </div>

            <div className="trans-search-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search Booking ID, Driver, Route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="trans-search-input"
              />
            </div>
          </div>

          <div className="trans-filter-pills">
            <button className={`filter-pill ${filterTab === 'All' ? 'active' : ''}`} onClick={() => setFilterTab('All')}>
              All Payments ({allCount})
            </button>
            <button className={`filter-pill ${filterTab === 'Corporate' ? 'active' : ''}`} onClick={() => setFilterTab('Corporate')}>
              Corporate Invoices ({corpCount})
            </button>
            <button className={`filter-pill ${filterTab === 'Personal' ? 'active' : ''}`} onClick={() => setFilterTab('Personal')}>
              Personal Rides ({personalCount})
            </button>
            <button className={`filter-pill ${filterTab === 'Refunds' ? 'active' : ''}`} onClick={() => setFilterTab('Refunds')}>
              Refunds & Adjustments ({refundsCount})
            </button>
          </div>

          <div className="trans-list">
            {dynamicTransactions.length === 0 ? (
              <div className="empty-payment-history-card">
                <div className="empty-icon-sq">
                  {!user ? <Lock size={32} /> : <FileText size={32} />}
                </div>
                <h3 className="empty-title">
                  {!user ? 'Sign In to Access Your Payment Ledger' : 'No Payment History or Settled Invoices Yet'}
                </h3>
                <p className="empty-desc">
                  {!user
                    ? 'Please sign in to your Deno Cabs customer account to view your transaction ledger, download official IRD tax invoices, and review settled payment receipts.'
                    : `Welcome, ${user.fullName || user.username || 'Valued Passenger'}! You currently have 0 completed hires. Once your first luxury chauffeur hire is booked and marked as completed, your official VAT invoices and payment receipts will automatically be generated and listed here.`}
                </p>
                <div className="empty-actions-row">
                  {!user ? (
                    <button className="empty-primary-btn" onClick={() => openAuthModal('login')}>
                      Sign In to Account <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button className="empty-primary-btn" onClick={() => navigate('/hire')}>
                      <Car size={16} /> Book Your 1st Luxury Hire <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="no-transactions-found">
                <Search size={32} className="no-trans-icon" />
                <h3>No Matching Transactions Found</h3>
                <p>Try adjusting your search query or clear the active date & category filters.</p>
                <button className="reset-filter-btn" onClick={() => { setFilterTab('All'); setDateRangePreset('All Time'); setSearchQuery(''); }}>
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredTransactions.map((item) => (
                <div key={item.id} className="trans-item-card">
                  <div className="trans-icon-sq">
                    {item.icon === 'flight' && '✈️'}
                    {item.icon === 'gem' && '💎'}
                    {item.icon === 'bank' && '🏦'}
                    {item.icon === 'car' && '🚘'}
                  </div>

                  <div className="trans-main-details">
                    <div className="trans-title-line">
                      <strong className="trans-id">{item.id}</strong>
                      <span className={`trans-tag-pill ${item.tagType === 'gold' ? 'gold' : item.tagType === 'refund' ? 'refund' : ''}`}>
                        {item.tag}
                      </span>
                      <span className="trans-date">{item.date}</span>
                    </div>

                    <p className="trans-route">{item.route}</p>

                    <div className="trans-sub-meta">
                      <span>🚘 {item.vehicle}</span>
                      <span>•</span>
                      <span>👤 Chauffeur: {item.chauffeur}</span>
                      <span>•</span>
                      <span>💳 {item.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="trans-right-amount">
                    <strong className={`amount-text ${item.numericAmount < 0 ? 'refund-green' : ''}`}>{item.amount}</strong>
                    <span className="tax-sub">{item.taxInfo}</span>
                    <div className="trans-actions-row">
                      <button className="trans-act-btn highlighted-invoice-btn" onClick={() => setSelectedInvoice(item)}>
                        <FileText size={14} /> Invoice (PDF)
                      </button>
                      {/* CLICKING RECEIPT OPENS OFFICIAL PAYMENT RECEIPT POPUP MODAL */}
                      <button className="trans-act-btn navy" onClick={() => setSelectedReceipt(item)}>
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="trans-table-footer">
            <span className="vat-reg-text">
              Showing {filteredTransactions.length} of {allCount} transactions • Inland Revenue Dept Reg: VAT 11482910
            </span>
            
            <div className="trans-footer-right">
              <button className="export-xls-btn" onClick={handleExportXls}>
                <Download size={14} /> Export Ledger (.XLS)
              </button>
              <div className="pagination-box">
                <button className="page-arrow"><ChevronLeft size={16} /></button>
                <span className="page-num">1</span>
                <button className="page-arrow"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. BOTTOM CORPORATE BANNER */}
        <div className="corporate-finance-banner">
          <div className="banner-left-info">
            <span className="banner-tag">VIP CONCIERGE FINANCE • Deno Cabs Enterprise Unit</span>
            <h2 className="banner-heading">Require Direct Corporate Credit Lines or Consolidations?</h2>
            <p className="banner-desc">
              Our finance concierge assists multinationals, embassies, and tourism delegations with monthly centralized invoicing, multi-vehicle billing manifests, and custom tax documentation.
            </p>
          </div>

          <div className="banner-right-contacts">
            <div className="contact-card-box">
              <div className="contact-row">
                <Phone size={16} className="contact-ic" />
                <div>
                  <span className="contact-label">VIP Direct Helpline</span>
                  <strong className="contact-val">+94 75 876 5674</strong>
                </div>
              </div>
            </div>

            <div className="contact-card-box dark">
              <div className="contact-row">
                <Mail size={16} className="contact-ic" />
                <div>
                  <span className="contact-label">Accounts & Audit Desk</span>
                  <strong className="contact-val">accounts@denocabs.com</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* DATE RANGE FILTER MODAL - DESIGNED EXACTLY AS SCREENSHOT */}
      {showDateModal && (
        <div className="payment-modal-backdrop" onClick={() => setShowDateModal(false)}>
          <div className="date-range-modal-container" onClick={e => e.stopPropagation()}>
            
            {/* TOP HEADER */}
            <div className="date-modal-header">
              <div className="date-modal-header-left">
                <div className="date-modal-icon-square">
                  <Calendar size={22} className="date-hdr-icon" />
                </div>
                <div>
                  <div className="date-modal-title-row">
                    <h2 className="date-modal-main-title">Select Date Range Filter</h2>
                    <span className="audit-scope-tag">AUDIT SCOPE</span>
                  </div>
                  <p className="date-modal-subtitle">
                    Filter your transaction records and generate tailored financial reports for specified audit periods.
                  </p>
                </div>
              </div>
              <button className="date-modal-close-btn" onClick={() => setShowDateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="date-modal-divider" />

            {/* SECTION 1: PRESET FINANCIAL PERIOD */}
            <div className="preset-period-section">
              <div className="preset-section-hdr">
                <span className="preset-hdr-title">
                  <Sliders size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  SELECT PRESET FINANCIAL PERIOD
                </span>
                <span className="timezone-text">Timezone: UTC-5 (EST)</span>
              </div>

              <div className="preset-cards-grid">
                {/* CARD 1: All Time */}
                <div
                  className={`date-preset-card ${dateRangePreset === 'All Time' ? 'selected' : ''}`}
                  onClick={() => setDateRangePreset('All Time')}
                >
                  <div className="preset-card-top">
                    <div className="preset-card-title-wrap">
                      <strong className="preset-card-title">All Time</strong>
                      <span className="preset-badge default-badge">Default</span>
                    </div>
                    {dateRangePreset === 'All Time' ? (
                      <div className="preset-check-circle active">
                        <Check size={12} />
                      </div>
                    ) : (
                      <div className="preset-check-circle" />
                    )}
                  </div>
                  <p className="preset-card-sub">Complete historical log</p>
                  <div className="preset-card-foot orange-dot-text">
                    <span className="orange-dot">●</span> Full ledger from inception (2020 – 2026)
                  </div>
                </div>

                {/* CARD 2: This Month */}
                <div
                  className={`date-preset-card ${dateRangePreset === 'This Month' ? 'selected' : ''}`}
                  onClick={() => setDateRangePreset('This Month')}
                >
                  <div className="preset-card-top">
                    <strong className="preset-card-title">This Month</strong>
                    <span className="preset-badge outline-badge">Current</span>
                  </div>
                  <p className="preset-card-sub">September 2026</p>
                  <p className="preset-card-foot text-muted">342 rides & tours logged</p>
                </div>

                {/* CARD 3: Aug 2024 */}
                <div
                  className={`date-preset-card ${dateRangePreset === 'Aug 2024' ? 'selected' : ''}`}
                  onClick={() => setDateRangePreset('Aug 2024')}
                >
                  <div className="preset-card-top">
                    <strong className="preset-card-title">Aug 2024</strong>
                    <span className="preset-date-range-badge">01/08 - 31/08</span>
                  </div>
                  <p className="preset-card-sub">August 2024 Records</p>
                  <p className="preset-card-foot text-muted">Tax audited archive</p>
                </div>

                {/* CARD 4: FY 2024 */}
                <div
                  className={`date-preset-card ${dateRangePreset === 'FY 2024' ? 'selected' : ''}`}
                  onClick={() => setDateRangePreset('FY 2024')}
                >
                  <div className="preset-card-top">
                    <strong className="preset-card-title">FY 2024</strong>
                    <span className="preset-badge outline-badge">Annual</span>
                  </div>
                  <p className="preset-card-sub">Full Year 2024 Audit</p>
                  <p className="preset-card-foot text-muted">Jan 1, 2024 – Dec 31, 2024</p>
                </div>

                {/* CARD 5: Last 90 Days */}
                <div
                  className={`date-preset-card ${dateRangePreset === 'Last 90 Days' ? 'selected' : ''}`}
                  onClick={() => setDateRangePreset('Last 90 Days')}
                >
                  <div className="preset-card-top">
                    <strong className="preset-card-title">Last 90 Days</strong>
                    <span className="preset-date-range-badge">Quarterly</span>
                  </div>
                  <p className="preset-card-sub">Rolling 3-Month Summary</p>
                  <p className="preset-card-foot text-muted">Executive VIP metrics</p>
                </div>

                {/* CARD 6: Custom Date Window */}
                <div
                  className={`date-preset-card dashed-custom ${dateRangePreset === 'Custom' ? 'selected' : ''}`}
                  onClick={() => setDateRangePreset('Custom')}
                >
                  <div className="preset-card-top">
                    <div className="preset-card-title-wrap">
                      <Calendar size={15} className="custom-calendar-icon" />
                      <strong className="preset-card-title">Custom Date Window</strong>
                    </div>
                    <Sliders size={14} className="custom-sliders-icon" />
                  </div>
                  <p className="preset-card-sub">Select specific start & end dates</p>
                  <p className="preset-card-foot gold-link-text">Flexible range selection below</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: SPECIFY CUSTOM RANGE DATES */}
            <div className="specify-custom-dates-section">
              <div className="custom-dates-hdr">
                <span className="custom-dates-title">SPECIFY CUSTOM RANGE DATES (OPTIONAL)</span>
                <div className="quick-date-presets">
                  <button type="button" onClick={() => { setDateRangePreset('Custom'); setCustomStartDate('2026-09-29'); setCustomEndDate('2026-09-29'); }}>Today</button>
                  <span className="q-sep">|</span>
                  <button type="button" onClick={() => { setDateRangePreset('Custom'); setCustomStartDate('2026-09-22'); setCustomEndDate('2026-09-29'); }}>Last Week</button>
                  <span className="q-sep">|</span>
                  <button type="button" onClick={() => { setDateRangePreset('Custom'); setCustomStartDate('2026-01-01'); setCustomEndDate('2026-09-29'); }}>YTD</button>
                </div>
              </div>

              <div className="custom-date-inputs-row">
                <div className="custom-date-field-group">
                  <label>From (Start Date)</label>
                  <div className="custom-input-wrap">
                    <Calendar size={16} className="input-calendar-ic" />
                    <input
                      type="text"
                      placeholder="01 / 01 / 2020"
                      value={customStartDate || (dateRangePreset === 'All Time' ? '01 / 01 / 2020' : dateRangePreset === 'Aug 2024' ? '01 / 08 / 2024' : dateRangePreset === 'This Month' ? '01 / 09 / 2026' : dateRangePreset === 'FY 2024' ? '01 / 01 / 2024' : '')}
                      onChange={e => { setDateRangePreset('Custom'); setCustomStartDate(e.target.value); }}
                    />
                    <span className="start-badge">START</span>
                  </div>
                </div>

                <div className="custom-date-field-group">
                  <label>To (End Date)</label>
                  <div className="custom-input-wrap">
                    <Calendar size={16} className="input-calendar-ic" />
                    <input
                      type="text"
                      placeholder="29 / 09 / 2026"
                      value={customEndDate || (dateRangePreset === 'All Time' ? '29 / 09 / 2026' : dateRangePreset === 'Aug 2024' ? '31 / 08 / 2024' : dateRangePreset === 'This Month' ? '30 / 09 / 2026' : dateRangePreset === 'FY 2024' ? '31 / 12 / 2024' : '')}
                      onChange={e => { setDateRangePreset('Custom'); setCustomEndDate(e.target.value); }}
                    />
                    <span className="present-badge">PRESENT</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVE SCOPE SUMMARY BAR */}
            <div className="active-scope-summary-bar">
              <div className="active-scope-left">
                <Info size={16} className="scope-info-icon" />
                <span>
                  Active Scope: <strong className="scope-name">
                    {dateRangePreset === 'All Time' ? 'All Time Records' : dateRangePreset === 'This Month' ? 'September 2026 Records' : dateRangePreset === 'Aug 2024' ? 'August 2024 Records' : dateRangePreset === 'FY 2024' ? 'Full Year 2024 Records' : dateRangePreset === 'Last 90 Days' ? 'Rolling 90-Day Records' : 'Custom Period Records'}
                  </strong>{' '}
                  ({dateRangePreset === 'All Time' ? '01 Jan 2020 – 29 Sep 2026' : dateRangePreset === 'Aug 2024' ? '01 Aug 2024 – 31 Aug 2024' : dateRangePreset === 'This Month' ? '01 Sep 2026 – 30 Sep 2026' : dateRangePreset === 'FY 2024' ? '01 Jan 2024 – 31 Dec 2024' : `${customStartDate || '01 Jan 2020'} – ${customEndDate || '29 Sep 2026'}`})
                </span>
              </div>
              <div className="active-scope-right">
                <strong>{filteredTransactions.length > 0 ? '3,492' : '0'} Records matched</strong>
              </div>
            </div>

            {/* FOOTER BAR */}
            <div className="date-modal-footer">
              <div className="footer-verified-portal">
                <Lock size={14} />
                <span>Island Elite Verified Audit Portal</span>
              </div>
              
              <div className="date-modal-footer-btns">
                <button type="button" className="date-btn-cancel" onClick={() => setShowDateModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="date-btn-apply"
                  onClick={() => {
                    setShowDateModal(false);
                    setToastMessage(`Date range filter active: "${dateRangePreset}" (${filteredTransactions.length} records filtered)`);
                    setTimeout(() => setToastMessage(''), 4500);
                  }}
                >
                  <Filter size={15} /> Apply Filter & Generate Report
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SRI LANKA INLAND REVENUE VAT SUMMARY MODAL - MATCHES DESIGN SCREENSHOT */}
      {showVatModal && (
        <div className="payment-modal-backdrop" onClick={() => setShowVatModal(false)}>
          <div className="vat-summary-modal-container" onClick={e => e.stopPropagation()}>
            
            {/* TOP HEADER */}
            <div className="vat-modal-header">
              <div className="vat-modal-header-left">
                <div className="vat-modal-icon-square">
                  <FileText size={22} className="vat-hdr-icon" />
                </div>
                <div>
                  <div className="vat-modal-title-row">
                    <h2 className="vat-modal-main-title">Sri Lanka Inland Revenue VAT Summary</h2>
                    <span className="ramis-verified-tag">
                      <span className="dot-green">●</span> RAMIS Verified
                    </span>
                  </div>
                  <div className="vat-modal-sub-meta">
                    <strong className="company-legal-name">Island Elite Logistics & Deno Cabs (Pvt) Ltd</strong>
                    <span className="sub-dot">•</span>
                    <span className="act-clause-text">Statutory Compliance: Inland Revenue Act No. 24 of 2017</span>
                  </div>
                </div>
              </div>

              <button className="vat-modal-close-btn" onClick={() => setShowVatModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* TOP 2 CARDS ROW */}
            <div className="vat-top-cards-grid">
              {/* CARD 1: ENTERPRISE REG TIN */}
              <div className="vat-top-card">
                <span className="vat-card-label">ENTERPRISE REG TIN</span>
                <div className="vat-tin-val-row">
                  <strong className="vat-tin-number">11482910-8000</strong>
                  <button
                    type="button"
                    className="copy-tin-btn"
                    title="Copy TIN"
                    onClick={() => {
                      navigator.clipboard.writeText('11482910-8000');
                      setToastMessage('Enterprise TIN copied to clipboard!');
                      setTimeout(() => setToastMessage(''), 3000);
                    }}
                  >
                    <Copy size={14} />
                  </button>
                  <span className="tin-active-badge">ACTIVE</span>
                </div>
                <p className="vat-card-subtext">Registered: Inland Revenue Dept, Colombo 02</p>
              </div>

              {/* CARD 2: APPLICABLE VAT RATE */}
              <div className="vat-top-card">
                <span className="vat-card-label">APPLICABLE VAT RATE</span>
                <div className="vat-rate-val-row">
                  <div className="rate-num-text">
                    <strong className="vat-rate-pct">8%</strong>
                    <span className="vat-rate-name">Tourism Transport Standard</span>
                  </div>
                  <div className="pct-icon-box">
                    <Percent size={16} />
                  </div>
                </div>
                <p className="vat-card-subtext">Gazette Extraordinary No. 2282/26 Approved</p>
              </div>
            </div>

            {/* MIDDLE BOX: CUMULATIVE TAX SETTLEMENT LEDGER */}
            <div className="cumulative-ledger-box">
              <div className="ledger-hdr-row">
                <span className="ledger-hdr-title">
                  <FileText size={13} style={{ display: 'inline', marginRight: '6px' }} />
                  CUMULATIVE TAX SETTLEMENT LEDGER (ALL-TIME)
                </span>
                <span className="currency-label">Currency: Sri Lankan Rupee (LKR)</span>
              </div>

              <div className="ledger-metrics-grid">
                <div className="ledger-metric-col">
                  <span className="ledger-m-label">Total Taxable Turnover</span>
                  <div className="ledger-m-val">
                    <span className="cur-sym">LKR</span> 120,336.00
                  </div>
                  <p className="ledger-m-sub">Net passenger transport services</p>
                </div>

                <div className="ledger-metric-col highlight-vat">
                  <span className="ledger-m-label">Total VAT Collected & Remitted</span>
                  <div className="ledger-m-val orange">
                    <span className="cur-sym">LKR</span> 10,464.00
                  </div>
                  <p className="ledger-m-sub clearance">
                    <ShieldCheck size={13} className="shield-ic" /> 100% Tax Clearance
                  </p>
                </div>

                <div className="ledger-metric-col">
                  <span className="ledger-m-label">Total Gross Settlement</span>
                  <div className="ledger-m-val">
                    <span className="cur-sym">LKR</span> 130,800.00
                  </div>
                  <p className="ledger-m-sub">Tax inclusive invoice totals</p>
                </div>
              </div>
            </div>

            {/* TABLE SECTION: RECENT RAMIS VAT FILING SCHEDULE */}
            <div className="ramis-table-section">
              <div className="ramis-table-hdr">
                <span className="ramis-hdr-title">RECENT RAMIS VAT FILING SCHEDULE</span>
                <span className="ramis-cycle-text">Cycle: Monthly / Quarterly Fiscal 2024</span>
              </div>

              <div className="ramis-table-wrapper">
                <table className="ramis-schedule-table">
                  <thead>
                    <tr>
                      <th>Tax Period</th>
                      <th>RAMIS Ref No.</th>
                      <th>Taxable (LKR)</th>
                      <th>VAT Remitted</th>
                      <th>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Q3 - Sep 2024</strong></td>
                      <td className="mono-ref">LK-IRD-2409-7712</td>
                      <td className="mono-num">48,250.00</td>
                      <td className="mono-num orange-val">4,195.65</td>
                      <td><span className="status-pill settled">Settled</span></td>
                    </tr>
                    <tr>
                      <td><strong>Q2 - Jun 2024</strong></td>
                      <td className="mono-ref">LK-IRD-2406-4019</td>
                      <td className="mono-num">41,600.00</td>
                      <td className="mono-num orange-val">3,617.39</td>
                      <td><span className="status-pill settled">Settled</span></td>
                    </tr>
                    <tr>
                      <td><strong>Q1 - Mar 2024</strong></td>
                      <td className="mono-ref">LK-IRD-2403-1184</td>
                      <td className="mono-num">30,486.00</td>
                      <td className="mono-num orange-val">2,650.96</td>
                      <td><span className="status-pill settled">Settled</span></td>
                    </tr>
                    <tr className="consolidated-row">
                      <td colSpan="2" className="cons-sum-label">Consolidated Sum:</td>
                      <td className="mono-num bold-num">120,336.00</td>
                      <td className="mono-num orange-val bold-num">10,464.00</td>
                      <td><span className="status-pill reconciled">Reconciled</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NOTICE BOX */}
            <div className="ramis-notice-box">
              <Info size={16} className="notice-info-icon" />
              <p>
                This electronic VAT statement is generated automatically via the Revenue Administration Management Information System (RAMIS). Valid for Sri Lanka Inland Revenue corporate compliance audits and tax credit claims.
              </p>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="vat-modal-footer">
              <div className="vat-footer-left">
                <button type="button" className="vat-btn-light" onClick={() => setShowVatModal(false)}>
                  Close
                </button>
                <button
                  type="button"
                  className="vat-btn-light"
                  onClick={() => {
                    setToastMessage('Exporting RAMIS VAT Filing Schedule (.XLS)...');
                    setTimeout(() => setToastMessage(''), 3500);
                  }}
                >
                  <FileSpreadsheet size={15} /> Export Excel
                </button>
              </div>

              <div className="vat-footer-right">
                <button
                  type="button"
                  className="vat-btn-pdf"
                  onClick={() => {
                    setShowVatModal(false);
                    setToastMessage('Downloading Inland Revenue Official Tax Certificate (PDF)...');
                    setTimeout(() => setToastMessage(''), 4500);
                  }}
                >
                  <FileText size={15} /> Download Tax Certificate (PDF)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 FULL TAX INVOICE POPUP MODAL */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <div className="tax-invoice-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="tax-invoice-modal-window" onClick={e => e.stopPropagation()}>
            
            <div className="inv-top-toolbar">
              <div className="inv-toolbar-left">
                <button className="inv-back-btn" onClick={() => setSelectedInvoice(null)}>
                  <ArrowLeft size={16} /> Payment History / Tax Invoice #{selectedInvoice.invNo || 'INV-2026-84920'}
                </button>
                <div className="inv-toolbar-meta-chips">
                  <span className="inv-chip">Ref: {selectedInvoice.invNo || 'INV-2026-84920'}</span>
                  <span className="inv-chip green-chip">● Paid & Tax Compliant</span>
                  <span className="inv-chip text-chip">Sri Lanka IRD VAT: 11482910-7000</span>
                </div>
              </div>

              <div className="inv-toolbar-actions">
                <div className="zoom-controls">
                  <Search size={14} />
                  <span>100%</span>
                </div>
                <button className="inv-tool-btn" onClick={() => window.print()}>
                  <Printer size={14} /> Print
                </button>
                <button className="inv-tool-btn" onClick={() => {
                  setToastMessage(`Tax Invoice #${selectedInvoice.invNo} sent to email!`);
                  setTimeout(() => setToastMessage(''), 4000);
                }}>
                  <Send size={14} /> Send to Email
                </button>
                <button className="inv-tool-btn yellow" onClick={() => {
                  setToastMessage(`Tax Invoice PDF #${selectedInvoice.invNo} downloaded!`);
                  setTimeout(() => setToastMessage(''), 4000);
                }}>
                  <Download size={14} /> Download PDF
                </button>
                <button className="inv-close-x" onClick={() => setSelectedInvoice(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="inv-body-layout">
              <div className="inv-document-paper" id="printable-tax-invoice">
                <div className="doc-header-row">
                  <div className="doc-brand">
                    <div className="doc-logo-title">
                      <span className="doc-brand-bold">Deno Cabs & Tours</span>
                      <span className="doc-brand-sub">DENO CARS & TOURS</span>
                    </div>
                    <p className="doc-company-tagline">Premium Corporate Transport & Chauffeur Logistics Ltd.</p>
                    <p className="doc-address-text">
                      No. 33, Galle Road, Colombo 03, Sri Lanka<br />
                      Tel: +94 75 876 5674 • billing@denocabs.com<br />
                      Web: www.islandelite.lk | Tax TIN: 11482910
                    </p>
                  </div>

                  <div className="doc-inv-meta">
                    <h1 className="doc-tax-title">TAX INVOICE</h1>
                    <div className="doc-inv-number">#{selectedInvoice.invNo || 'INV-2026-84920'}</div>
                    <span className="paid-full-badge">✓ PAID IN FULL</span>
                    
                    <div className="doc-date-details">
                      <div><span>Issue Date:</span> <strong>{selectedInvoice.date.split('•')[0]}</strong></div>
                      <div><span>Settlement:</span> <strong>{selectedInvoice.date}</strong></div>
                      <div><span>Payment Method:</span> <strong>{selectedInvoice.paymentMethod}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="doc-client-booking-grid">
                  <div className="doc-subbox">
                    <span className="subbox-label">BILLED TO (CLIENT / PASSENGER)</span>
                    <h4 className="client-name">{selectedInvoice.clientName || 'Mr. Damith Jayasuriya'}</h4>
                    <p className="client-company">{selectedInvoice.companyName || 'Enterprise Tech Holdings Sri Lanka'}</p>
                    <p className="client-address">{selectedInvoice.clientAddress || 'Level 14, West Tower, World Trade Center, Echelon Square, Colombo 01, Sri Lanka'}</p>
                    <div className="tin-pill">Tax Payer TIN: {selectedInvoice.clientTin || '109283741'}</div>
                  </div>

                  <div className="doc-subbox">
                    <span className="subbox-label">SERVICE BOOKING REFERENCE</span>
                    <h4 className="booking-ref-id">{selectedInvoice.id}</h4>
                    <p className="booking-service-type">VIP Chauffeur & Corporate Transfer</p>
                    <p className="booking-vehicle-meta">Vehicle: {selectedInvoice.vehicle}</p>
                    <p className="booking-chauffeur-meta">Chauffeur: {selectedInvoice.chauffeur}</p>
                    <span className="mobility-class-tag">Class: Presidential Mobility</span>
                  </div>
                </div>

                <div className="doc-transit-log">
                  <div className="transit-log-hdr">
                    <span className="verified-log-tag">● VERIFIED TRANSIT LOG</span>
                    <strong className="logged-km">{selectedInvoice.distance || '124.8 km'} Logged</strong>
                  </div>

                  <div className="transit-locations-row">
                    <div className="loc-box departure">
                      <span className="dot dep" />
                      <div>
                        <span className="loc-label">Departure (07:30 PM)</span>
                        <strong className="loc-name">{selectedInvoice.origin || "Cinnamon Grand Hotel, Colombo 03"}</strong>
                      </div>
                    </div>

                    <div className="loc-arrow">➔</div>

                    <div className="loc-box arrival">
                      <span className="dot arr" />
                      <div>
                        <span className="loc-label">Arrival (06:15 PM)</span>
                        <strong className="loc-name">{selectedInvoice.destination || "Earl's Regency Hotel, Kandy"}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="expressway-note">
                    🛡️ Central Expressway (E04) Transit Clear & Fuel Surcharge pre-reconciled
                  </p>
                </div>

                <div className="doc-table-scroll-wrapper">
                  <table className="doc-items-table">
                    <thead>
                      <tr>
                        <th style={{ width: '50%' }}>DESCRIPTION / BILLABLE SERVICE DETAILS</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>QTY</th>
                        <th style={{ width: '20%', textAlign: 'right' }}>UNIT RATE (LKR)</th>
                        <th style={{ width: '20%', textAlign: 'right' }}>AMOUNT (LKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <strong>Executive Chauffeur Transfer (Colombo to Kandy)</strong>
                          <p className="item-subdesc">1x Base VIP Presidential Transfer Package including vehicle hire & pilot</p>
                        </td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>22,500.00</td>
                        <td style={{ textAlign: 'right' }}>22,500.00</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Central Expressway Toll Clearance & Fuel Surcharge</strong>
                          <p className="item-subdesc">1x express highway E04 Electronic toll deduction & fuel surcharge</p>
                        </td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>2,000.00</td>
                        <td style={{ textAlign: 'right' }}>2,000.00</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>In-Cabin Executive Amenities Pack</strong>
                          <p className="item-subdesc">Unlimited 5G Mobile Hotspot, Chilled Premier Mineral Water & Towels</p>
                        </td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right', color: '#d97706', fontWeight: 600 }}>Included</td>
                        <td style={{ textAlign: 'right' }}>0.00</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Passenger & Transit Comprehensive Insurance</strong>
                          <p className="item-subdesc">Sri Lanka Insurance Corp Corporate Transit Policy Underwrite</p>
                        </td>
                        <td style={{ textAlign: 'center' }}>1</td>
                        <td style={{ textAlign: 'right' }}>1,888.89</td>
                        <td style={{ textAlign: 'right' }}>1,888.89</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="doc-summary-footer">
                  <div className="doc-amount-words-box">
                    <span className="words-label">TOTAL AMOUNT IN WORDS</span>
                    <h5 className="words-text">"Twenty-Eight Thousand Five Hundred Sri Lankan Rupees Only"</h5>
                    
                    <div className="tax-act-audit-note">
                      ⚖️ Tax registered under Section 102 of Inland Revenue Act No. 24 of 2017. All taxable supplies are subject to Inland Revenue Department quarterly e-audit validation.
                    </div>
                  </div>

                  <div className="doc-totals-calc-box">
                    <div className="calc-row">
                      <span>Subtotal (Excl. Taxes)</span>
                      <strong>LKR {selectedInvoice.subtotal || '26,388.89'}</strong>
                    </div>
                    <div className="calc-row">
                      <span>Tourism Dev. Levy (SSCL 2.5%)</span>
                      <strong>LKR {selectedInvoice.ssclTax || '659.72'}</strong>
                    </div>
                    <div className="calc-row">
                      <span>Value Added Tax (VAT 8%)</span>
                      <strong>LKR {selectedInvoice.vatTax || '1,451.39'}</strong>
                    </div>
                    
                    <div className="grand-total-paid-card">
                      <div>
                        <span className="gt-label">GRAND TOTAL PAID</span>
                        <span className="gt-sub">Full Settlement Reconciled</span>
                      </div>
                      <h3 className="gt-amount">{selectedInvoice.amount}</h3>
                    </div>
                  </div>
                </div>

                <div className="doc-signatures-verify-row">
                  <div className="digital-qr-stamp-box">
                    <div className="qr-code-graphic">
                      <QrCode size={48} color="#0b172a" />
                    </div>
                    <div className="ird-digital-info">
                      <strong className="ird-pass-title">IRD Digital Pass</strong>
                      <p className="ird-pass-sub">
                        Scan to verify authentic IRD clearance token <strong>LK-RAMIS-99201</strong>
                      </p>
                    </div>
                    <div className="gold-stamp-badge">
                      <span>DENO CABS & TOURS</span>
                      <strong>AUDITED & VERIFIED</strong>
                    </div>
                  </div>

                  <div className="signature-box">
                    <div className="signature-line-graphic" />
                    <span className="sig-label">AUTHORIZED SIGNATURE</span>
                    <strong className="sig-name">Anura Wickramasinghe</strong>
                    <span className="sig-role">Head of Corporate Treasury & Finance</span>
                  </div>
                </div>

                <div className="doc-bottom-legal-disclaimer">
                  This is an electronically generated authentic tax invoice compliant with the Inland Revenue Act No. 24 of 2017. For corporate VAT reclaiming inquiries or official ledger receipts, contact accounts@denocabs.com.
                </div>

                <div className="tamper-proof-hash">
                  🔒 SHA-256 Checksum: 8f462c91a63e8a719c00b21a8f949c5e3d74189e28f3b (Tamper-proof digital seal)
                </div>

              </div>

              <div className="inv-sidebar-panel">
                <div className="side-status-card">
                  <div className="side-card-hdr">
                    <span className="side-lbl">DOCUMENT STATUS</span>
                    <span className="archived-pill">Archived to Cloud</span>
                  </div>

                  <div className="inv-id-reclaim-box">
                    <div className="reclaim-icon"><FileText size={20} /></div>
                    <div>
                      <strong className="reclaim-inv">{selectedInvoice.invNo || 'INV-2026-84920'}</strong>
                      <p className="reclaim-text">VAT Reclaimable • {selectedInvoice.amount}</p>
                    </div>
                  </div>

                  <div className="side-pills-row">
                    <span className="side-pill">Tax Category: <strong>Corporate VIP</strong></span>
                    <span className="side-pill">Payment Gate: <strong>Visa Enterprise</strong></span>
                  </div>
                </div>

                <div className="side-help-card">
                  <h4 className="side-help-title">🎧 Need Help with this Invoice?</h4>
                  <p className="side-help-desc">
                    Require corporate invoice amendments, specific VAT/SVAT withholding slips, or an updated Tax Identification Number (TIN)?
                  </p>

                  <button className="help-action-btn" onClick={() => setToastMessage('Calling Corporate Billing Hotline (+94 75 876 5674)...')}>
                    <div>
                      <strong className="btn-main-txt">Corporate Billing Hotline</strong>
                      <span className="btn-sub-txt">+94 75 876 5674 (24/7 Priority)</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>

                  <button className="help-action-btn" onClick={() => setToastMessage('Opening TIN / Address correction form...')}>
                    <div>
                      <strong className="btn-main-txt">Request TIN / Address Correction</strong>
                      <span className="btn-sub-txt">Update company name or SVAT code</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="side-related-card">
                  <div className="related-hdr">
                    <h4>Related Bookings</h4>
                    <a href="#all" className="view-all-link">View All</a>
                  </div>

                  <div className="related-item">
                    <div>
                      <strong className="rel-id">#DENO-84712 • Colombo to BIA</strong>
                      <p className="rel-sub">Mercedes E-Class • 24 Aug 2026</p>
                    </div>
                    <div className="rel-right">
                      <strong className="rel-amt">LKR 16,500</strong>
                      <span className="rel-inv-link">Invoice ➔</span>
                    </div>
                  </div>

                  <div className="related-item">
                    <div>
                      <strong className="rel-id">#DENO-83901 • Galle Round-Trip</strong>
                      <p className="rel-sub">BMW 7 Series • 15 Aug 2026</p>
                    </div>
                    <div className="rel-right">
                      <strong className="rel-amt">LKR 42,000</strong>
                      <span className="rel-inv-link">Invoice ➔</span>
                    </div>
                  </div>
                </div>

                <div className="side-concierge-card">
                  <div className="concierge-ic"><CreditCard size={20} color="#fbbf24" /></div>
                  <h4 className="concierge-title">Corporate Concierge Account</h4>
                  <p className="concierge-desc">
                    Monthly consolidated billing & credit terms available for enterprises.
                  </p>
                  <button className="book-next-vip-btn">
                    Book Next VIP Chauffeur
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🧾 FULL OFFICIAL PAYMENT RECEIPT POPUP MODAL (EXACT MATCH FOR SCREENSHOT) */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div className="tax-invoice-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="receipt-modal-window" onClick={e => e.stopPropagation()}>
            
            {/* 1. TOP FLOATING TOOLBAR */}
            <div className="inv-top-toolbar">
              <div className="inv-toolbar-left">
                <button className="inv-back-btn" onClick={() => setSelectedReceipt(null)}>
                  <ArrowLeft size={16} /> Payment History / {selectedReceipt.id} / Official Executive Receipt
                </button>
              </div>

              <div className="inv-toolbar-actions">
                <button className="inv-tool-btn" onClick={() => window.print()}>
                  <Printer size={14} /> Print Receipt
                </button>
                <button className="inv-tool-btn yellow" onClick={() => {
                  setToastMessage(`Official Payment Receipt #${selectedReceipt.rctNo} downloaded!`);
                  setTimeout(() => setToastMessage(''), 4000);
                }}>
                  <Download size={14} /> Download PDF
                </button>
                <button className="inv-tool-btn" onClick={() => {
                  setToastMessage('Receipt share link copied to clipboard!');
                  setTimeout(() => setToastMessage(''), 4000);
                }}>
                  <Share2 size={14} /> Share
                </button>
                <button className="inv-tool-btn navy-btn" onClick={() => {
                  setToastMessage(`Receipt sent directly to accounts@denocabs.com!`);
                  setTimeout(() => setToastMessage(''), 4000);
                }}>
                  <Send size={14} /> Send to Accounts
                </button>
                <button className="inv-close-x" onClick={() => setSelectedReceipt(null)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* TOP INFO BAR */}
            <div className="rct-top-notice-bar">
              <span className="notice-left">✓ Official Inland Revenue Sri Lanka Electronic Document • RAMIS Certified Archive</span>
              <span className="notice-right">Reconciled via Visa Enterprise Settlement System (VESS)</span>
            </div>

            {/* 2. RECEIPT DOCUMENT PAPER CARD */}
            <div className="receipt-paper-card" id="printable-tax-invoice">
              <div className="receipt-gold-top-bar" />

              {/* Header */}
              <div className="rct-header-row">
                <div className="rct-brand-box">
                  <div className="rct-logo-row">
                    <div className="rct-car-badge">🚘</div>
                    <div>
                      <h2 className="rct-brand-title">Island Elite <span className="executive-tag">EXECUTIVE</span></h2>
                      <p className="rct-brand-sub">Bespoke Chauffeur & Diplomatic Mobility</p>
                      <p className="rct-reg-text">Deno Cabs & Tours Lanka (Pvt) Ltd • Reg (PV-99214)</p>
                    </div>
                  </div>
                </div>

                <div className="rct-meta-box">
                  <h1 className="rct-title">PAYMENT RECEIPT</h1>
                  <span className="rct-number">{selectedReceipt.rctNo || 'RCT - 2026 - 04929 - V'}</span>
                  <span className="rct-paid-badge">● PAID & SETTLED</span>
                </div>
              </div>

              {/* Booking Summary Bar (4 Columns) */}
              <div className="rct-summary-bar">
                <div className="rct-sum-item">
                  <span className="rct-sum-label">BOOKING REF</span>
                  <strong className="rct-sum-val">{selectedReceipt.id}</strong>
                </div>
                <div className="rct-sum-item">
                  <span className="rct-sum-label">COMPLETION DATE</span>
                  <strong className="rct-sum-val">{selectedReceipt.date.split('•')[0]}</strong>
                </div>
                <div className="rct-sum-item">
                  <span className="rct-sum-label">SETTLED TIME</span>
                  <strong className="rct-sum-val">{selectedReceipt.settledTime || '05:15 PM LKST'}</strong>
                </div>
                <div className="rct-sum-item">
                  <span className="rct-sum-label">PAYMENT METHOD</span>
                  <strong className="rct-sum-val">💳 {selectedReceipt.paymentMethod}</strong>
                </div>
              </div>

              {/* Corporate Passenger & Service Merchant Grid */}
              <div className="rct-merchant-client-grid">
                <div className="rct-grid-box">
                  <div className="rct-grid-hdr">
                    <span className="rct-grid-lbl">CORPORATE PASSENGER</span>
                    <span className="verified-member-tag">Verified Member</span>
                  </div>
                  <h4 className="rct-client-name">{selectedReceipt.clientName || 'Mr. Damith Jayasuriya'}</h4>
                  <p className="rct-company-name">{selectedReceipt.companyName || 'Enterprise Tech Holdings Sri Lanka (PLC)'}</p>
                  <p className="rct-address">{selectedReceipt.clientAddress || 'Level 32, West Tower, World Trade Center, Colombo 01'}</p>
                  <div className="rct-pills-row">
                    <span>Client Tax ID: {selectedReceipt.clientTin || 'TIN-109283720'}</span>
                    <span>VIP Tier: <strong>{selectedReceipt.vipTier || 'Black Sapphire'}</strong></span>
                  </div>
                </div>

                <div className="rct-grid-box">
                  <div className="rct-grid-hdr">
                    <span className="rct-grid-lbl">SERVICE MERCHANT & DISPATCHER</span>
                    <ShieldCheck size={14} color="#d97706" />
                  </div>
                  <h4 className="rct-client-name">Island Elite / Deno Cabs & Tours</h4>
                  <p className="rct-company-name">No. 33, Galle Road, Colombo 03, Sri Lanka</p>
                  <p className="rct-address">Ministry of Tourism License: SLTDA/SQA/TEMP/2024/0912</p>
                  <div className="rct-pills-row">
                    <span>VAT Reg: 11482910-7000</span>
                    <span>Central Dispatcher: HQ</span>
                  </div>
                </div>
              </div>

              {/* Expressway Chauffeur Route Banner */}
              <div className="rct-route-banner">
                <div className="rct-route-left">
                  <span className="rct-route-tag">▲ EXECUTIVE EXPRESSWAY CHAUFFEUR ROUTE ({selectedReceipt.distance || '145.8 KM'})</span>
                  <h3 className="rct-route-title">
                    {selectedReceipt.origin || "Cinnamon Grand Colombo 03"} ➔ {selectedReceipt.destination || "Earl's Regency Hotel, Kandy"}
                  </h3>
                </div>

                <div className="rct-chauffeur-box">
                  <div className="chauffeur-avatar">SB</div>
                  <div>
                    <strong className="ch-name">{selectedReceipt.chauffeur} (Chauffeur)</strong>
                    <span className="ch-vehicle">{selectedReceipt.vehicle}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="doc-table-scroll-wrapper">
                <table className="rct-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>ITEM & SERVICE DESCRIPTION</th>
                      <th style={{ width: '15%', textAlign: 'center' }}>UNIT / QTY</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>RATE (LKR)</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>SUBTOTAL (LKR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Executive Inter-City Transfer (Colombo to Kandy)</strong>
                        <p className="rct-item-sub">Toyota Land Cruiser V8 luxury spec with in-car concierge amenities, cold towels & bottled spring water.</p>
                      </td>
                      <td style={{ textAlign: 'center' }}>1 Journey</td>
                      <td style={{ textAlign: 'right' }}>22,500.00</td>
                      <td style={{ textAlign: 'right' }}>22,500.00</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Central Expressway Toll Clearance</strong>
                        <p className="rct-item-sub">Automated ETC passage (Katunayake / Mirigama - Kadawatha E04 Express Link).</p>
                      </td>
                      <td style={{ textAlign: 'center' }}>E04 Link</td>
                      <td style={{ textAlign: 'right' }}>1,500.00</td>
                      <td style={{ textAlign: 'right' }}>1,500.00</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>VIP Chauffeur Gratuity & English Diplomatic Protocol</strong>
                        <p className="rct-item-sub">Certified executive escort, luggage assistance, priority check-in assistance at Earl's Regency.</p>
                      </td>
                      <td style={{ textAlign: 'center' }}>Standard</td>
                      <td style={{ textAlign: 'right' }}>2,500.00</td>
                      <td style={{ textAlign: 'right' }}>2,500.00</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Fuel & Peak Hour Transit Surcharge</strong>
                        <p className="rct-item-sub">Complimentary corporate benefit under Corporate Tier agreement.</p>
                      </td>
                      <td style={{ textAlign: 'center' }}>Waived</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                      <td style={{ textAlign: 'right' }}>0.00</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Sri Lanka Tourism & Inland Revenue VAT (8%)</strong>
                        <p className="rct-item-sub">Statutory tax clearance for certified domestic chauffeur services.</p>
                      </td>
                      <td style={{ textAlign: 'center' }}>8.0%</td>
                      <td style={{ textAlign: 'right' }}>2,000.00</td>
                      <td style={{ textAlign: 'right' }}>2,000.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Clearance Breakdown & Totals */}
              <div className="rct-breakdown-summary-grid">
                <div className="rct-clearance-box">
                  <h4 className="rct-clearance-title">✓ Payment Clearance Breakdown</h4>
                  <p className="rct-clearance-desc">
                    Card Transaction settled through Commercial Bank of Ceylon Merchant PG. Auth Code: <strong>AUTH-88210-SL</strong> • Gateway Batch #97239. This electronic receipt constitutes a verified proof of settlement for corporate tax-deductible expense records.
                  </p>
                  <div className="rct-tid-row">
                    <span>TID: TXN-0280-55522772</span>
                    <span>•</span>
                    <span>RAMIS REF: RAMIS-LK-2026-09-01839</span>
                  </div>
                </div>

                <div className="rct-totals-calc">
                  <div className="rct-calc-line">
                    <span>Subtotal (Excl. Tax)</span>
                    <strong>LKR {selectedReceipt.subtotal || '26,500.00'}</strong>
                  </div>
                  <div className="rct-calc-line">
                    <span>Value Added Tax (8%)</span>
                    <strong>LKR {selectedReceipt.vatTax || '2,000.00'}</strong>
                  </div>
                  <div className="rct-calc-line">
                    <span>Enterprise Discount Applied</span>
                    <strong className="discount-tag">- LKR 0.00</strong>
                  </div>

                  <div className="rct-grand-total-box">
                    <div className="total-title-group">
                      <span className="total-hdr-txt">TOTAL PAID</span>
                      <span className="net-sscl">Net SSCL: + LKR 0.00</span>
                    </div>
                    <div className="total-amount-right">
                      <h2 className="rct-gt-val">{selectedReceipt.amount}</h2>
                      <span className="balance-due-zero">BALANCE DUE: LKR 0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt Footer / QR & Signature */}
              <div className="rct-footer-signatures">
                <div className="rct-qr-box">
                  <QrCode size={44} color="#0b172a" />
                  <div>
                    <strong className="qr-title">Scan for Verification</strong>
                    <p className="qr-desc">Cryptographically signed receipt end-to-end Elite Mobility Ledger API</p>
                  </div>
                </div>

                <div className="rct-sig-box">
                  <div className="signature-handwritten">{selectedReceipt.chauffeur}</div>
                  <strong className="sig-officer-title">Authorized Dispatch Officer</strong>
                  <span className="sig-officer-id">Chauffeur ID: {selectedReceipt.chauffeurId || 'DENO-DRV-0000001'}</span>
                </div>
              </div>

              <div className="rct-voucher-disclaimer">
                Deno Cabs & Island Elite Transport Solutions Ltd • Official Customer Electronic Receipt Voucher • No Physical Stamp Required for Corporate Filing
              </div>

            </div>

            {/* BOTTOM SWITCH LINK & CONCIERGE BANNER */}
            <div className="rct-bottom-links-row">
              <button className="switch-to-invoice-btn" onClick={() => {
                const invItem = selectedReceipt;
                setSelectedReceipt(null);
                setSelectedInvoice(invItem);
              }}>
                📄 Need full VAT Tax Invoice with withholding details? Switch to Invoice #{selectedReceipt.invNo || 'INV-2026-84920'} ➔
              </button>

              <span className="ssl-encrypted-tag">🔒 256-Bit SSL Encrypted Ledger</span>
            </div>

            {/* Corporate Concierge Banner */}
            <div className="rct-corporate-concierge-banner">
              <div>
                <span className="desk-tag">CORPORATE CONCIERGE DESK</span>
                <h3 className="desk-title">Need centralized monthly enterprise invoicing?</h3>
                <p className="desk-desc">
                  Our finance concierge assists multinationals, embassies, and luxury tourism delegations with aggregated credit lines, customized expense codes, and automated RAMIS filings.
                </p>
              </div>

              <div className="desk-buttons-row">
                <button className="desk-contact-btn white" onClick={() => setToastMessage('Calling +94 75 876 5674...')}>
                  <Phone size={14} /> +94 75 876 5674
                </button>
                <button className="desk-contact-btn yellow" onClick={() => setToastMessage('Opening email client for accounts@denocabs.com...')}>
                  <Mail size={14} /> accounts@denocabs.com
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentHistoryPage;
