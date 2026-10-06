import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  SlidersHorizontal, 
  Download, 
  Plus, 
  ArrowRight, 
  ArrowUpRight,
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Car,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import '../css/SuperAdminTable.css';

const SuperAdminTable = ({ 
  bookings, 
  onExploreBooking, 
  onSimulateHire 
}) => {
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Pending' | 'Confirmed' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and Search logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
      // Status Filter
      if (filterStatus === 'Pending' && !item.status.toLowerCase().includes('pending')) {
        return false;
      }
      if (filterStatus === 'Confirmed' && !item.status.toLowerCase().includes('confirmed')) {
        return false;
      }
      if (filterStatus === 'Cancelled' && !item.status.toLowerCase().includes('cancel')) {
        return false;
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = (item.ref || '').toLowerCase().includes(q);
        const matchesCustomer = (item.customer || '').toLowerCase().includes(q);
        const matchesCorporate = (item.corporate || '').toLowerCase().includes(q);
        const matchesPickup = (item.pickupLocation || '').toLowerCase().includes(q);
        const matchesDropoff = (item.dropoffLocation || '').toLowerCase().includes(q);
        const matchesVehicle = (item.vehicleModel || '').toLowerCase().includes(q);
        const matchesPlate = (item.vehiclePlate || '').toLowerCase().includes(q);

        if (!matchesRef && !matchesCustomer && !matchesCorporate && !matchesPickup && !matchesDropoff && !matchesVehicle && !matchesPlate) {
          return false;
        }
      }

      return true;
    });
  }, [bookings, filterStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / itemsPerPage));
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  // Export to CSV functionality
  const handleExportCSV = () => {
    const headers = ['Booking Ref', 'Customer', 'Corporate', 'Pickup', 'Destination', 'Distance', 'Vehicle', 'Plate', 'Date', 'Time', 'Amount LKR', 'Amount USD', 'Status'];
    const rows = filteredBookings.map((b) => [
      b.ref,
      `"${b.customer}"`,
      `"${b.corporate || ''}"`,
      `"${b.pickupLocation}"`,
      `"${b.dropoffLocation}"`,
      b.distance,
      `"${b.vehicleModel}"`,
      b.vehiclePlate,
      b.scheduleDate,
      b.scheduleTime,
      b.totalLKR,
      b.totalUSD,
      b.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Deno_Cabs_Dispatch_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const lower = (status || '').toLowerCase();
    if (lower.includes('pending')) {
      return (
        <span className="deno-status-pill status-pending">
          <span className="status-dot dot-pending" />
          Pending Dispatch
        </span>
      );
    }
    if (lower.includes('confirmed') || lower.includes('active')) {
      return (
        <span className="deno-status-pill status-confirmed">
          <span className="status-dot dot-confirmed" />
          Confirmed / Active
        </span>
      );
    }
    if (lower.includes('cancel')) {
      return (
        <span className="deno-status-pill status-cancelled">
          Cancelled
        </span>
      );
    }
    return (
      <span className="deno-status-pill status-pending">
        {status}
      </span>
    );
  };

  return (
    <div className="deno-admin-dispatch-section">
      {/* Filter and Action Bar matching screenshot */}
      <div className="deno-admin-control-bar">
        {/* Status Filter Tabs */}
        <div className="deno-admin-tabs-group">
          {['All', 'Pending', 'Confirmed', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              className={`deno-status-tab-btn ${filterStatus === tab ? 'active' : ''}`}
              onClick={() => {
                setFilterStatus(tab);
                setCurrentPage(1);
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="deno-admin-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search Reference, Client, Route..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="deno-admin-search-input"
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="deno-admin-action-buttons">
          <button 
            className="deno-btn-control filter-btn"
            onClick={() => {
              // Toggle simple reset or quick filter
              if (searchQuery || filterStatus !== 'All') {
                setSearchQuery('');
                setFilterStatus('All');
              }
            }}
            title="Reset or Adjust Filters"
          >
            <SlidersHorizontal size={15} />
            <span>Filter</span>
          </button>

          <button 
            className="deno-btn-control export-btn" 
            onClick={handleExportCSV}
            title="Export filtered records to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button 
            className="deno-btn-simulate-hire"
            onClick={onSimulateHire}
            title="Create live test hire booking"
          >
            <Plus size={16} />
            <span>Simulate Inbound Hire</span>
          </button>
        </div>
      </div>

      {/* Main Dispatch Table */}
      <div className="deno-admin-table-container">
        <div className="deno-admin-table-scroll">
          <table className="deno-dispatch-table">
            <thead>
              <tr>
                <th className="th-ref">BOOKING REF</th>
                <th className="th-customer">CUSTOMER & CORPORATE</th>
                <th className="th-route">PICKUP ROUTE</th>
                <th className="th-vehicle">VEHICLE MODEL</th>
                <th className="th-date">SCHEDULE DATE</th>
                <th className="th-amount">TOTAL AMOUNT</th>
                <th className="th-status">STATUS</th>
                <th className="th-action text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="deno-empty-table-cell">
                    <div className="empty-state-box">
                      {bookings.length === 0 ? (
                        <>
                          <p style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '1rem', marginBottom: '4px' }}>
                            No dispatch bookings in the platform ledger yet.
                          </p>
                          <small style={{ color: '#94a3b8', fontSize: '0.82rem', display: 'block', marginBottom: '14px' }}>
                            Real-time customer bookings submitted via the web app will automatically appear here.
                          </small>
                          <button 
                            className="empty-reset-btn"
                            onClick={onSimulateHire}
                            style={{ background: 'var(--deno-gold-primary)', color: '#0b172a', fontWeight: 800 }}
                          >
                            + Place Test Booking
                          </button>
                        </>
                      ) : (
                        <>
                          <p>No dispatch bookings found matching your search or filter.</p>
                          <button 
                            className="empty-reset-btn"
                            onClick={() => {
                              setFilterStatus('All');
                              setSearchQuery('');
                            }}
                          >
                            Reset Filters
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((row) => (
                  <tr key={row.id} className="deno-table-row">
                    {/* 1. Booking Ref */}
                    <td className="td-ref">
                      <span className="booking-ref-gold">{row.ref}</span>
                    </td>

                    {/* 2. Customer & Corporate */}
                    <td className="td-customer">
                      <div className="cell-customer-meta">
                        <strong className="customer-name">{row.customer}</strong>
                        <span className="corporate-name">{row.corporate || 'Individual Guest'}</span>
                      </div>
                    </td>

                    {/* 3. Pickup Route */}
                    <td className="td-route">
                      <div className="cell-route-meta">
                        <span className="pickup-text">{row.pickupLocation}</span>
                        <span className="dropoff-text">
                          <span className="route-arrow-icon">🚖</span> {row.dropoffLocation} {row.distance && `(${row.distance})`}
                        </span>
                      </div>
                    </td>

                    {/* 4. Vehicle Model */}
                    <td className="td-vehicle">
                      <div className="cell-vehicle-meta">
                        <span className="vehicle-name">{row.vehicleModel}</span>
                        <span className="vehicle-plate">{row.vehiclePlate}</span>
                      </div>
                    </td>

                    {/* 5. Schedule Date */}
                    <td className="td-date">
                      <div className="cell-date-meta">
                        <span className="date-day">{row.scheduleDate}</span>
                        <span className="date-time">{row.scheduleTime}</span>
                      </div>
                    </td>

                    {/* 6. Total Amount */}
                    <td className="td-amount">
                      <div className="cell-amount-meta">
                        <strong className="amount-lkr">LKR {new Intl.NumberFormat('en-US').format(row.totalLKR)}</strong>
                        <span className="amount-usd">≈ ${new Intl.NumberFormat('en-US').format(row.totalUSD)}.00</span>
                      </div>
                    </td>

                    {/* 7. Status */}
                    <td className="td-status">
                      {getStatusBadge(row.status)}
                    </td>

                    {/* 8. Action */}
                    <td className="td-action text-right">
                      <button
                        className="deno-explore-btn"
                        onClick={() => onExploreBooking(row)}
                        title="View manifest, driver assignment & route telemetry"
                      >
                        <span>Explore</span>
                        <ArrowRight size={14} className="explore-arrow" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination matching image */}
        <div className="deno-admin-table-footer">
          <span className="deno-entries-counter">
            Showing {paginatedBookings.length} of {filteredBookings.length} entries
          </span>

          <div className="deno-pagination-controls">
            <button
              className="pagination-btn nav-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`pagination-btn num-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}

            <button
              className="pagination-btn nav-btn"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminTable;
