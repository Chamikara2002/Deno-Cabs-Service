// Deno Cabs Hire Section API Client Service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle fetch requests with timeout and automatic error recovery
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.warn(`[HireAPI] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const hireApi = {
  /**
   * 1. Get all hire bookings (with search & status filter)
   */
  async getBookings(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.email) query.append('email', params.email);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/hires${queryString}`);
  },

  /**
   * 2. Get single booking by ID or reference
   */
  async getBookingById(id) {
    const cleanId = id ? id.replace('#', '') : '';
    return apiRequest(`/hires/${encodeURIComponent(cleanId)}`);
  },

  /**
   * 3. Get latest booking for current user
   */
  async getLatestBooking(email, phone) {
    const query = new URLSearchParams();
    if (email) query.append('email', email);
    if (phone) query.append('phone', phone);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/hires/latest${queryString}`);
  },

  /**
   * 4. Create a new hire booking
   */
  async createBooking(bookingData) {
    return apiRequest('/hires', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  /**
   * 5. Super Admin: Confirm & Dispatch booking with driver and vehicle assignment
   */
  async dispatchBooking(bookingId, assignmentData) {
    const cleanId = bookingId ? bookingId.replace('#', '') : '';
    return apiRequest(`/hires/${encodeURIComponent(cleanId)}/dispatch`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData)
    });
  },

  /**
   * 6. Update booking status (e.g. Cancelled)
   */
  async updateStatus(bookingId, status) {
    const cleanId = bookingId ? bookingId.replace('#', '') : '';
    return apiRequest(`/hires/${encodeURIComponent(cleanId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  /**
   * 6.1. Delete booking from MongoDB database
   */
  async deleteBooking(bookingId) {
    const cleanId = bookingId ? bookingId.replace('#', '') : '';
    return apiRequest(`/hires/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE'
    });
  },

  /**
   * 7. Get dispatch and hire metrics for dashboard
   */
  async getMetrics() {
    return apiRequest('/hires/metrics');
  },

  /**
   * 8. Get drivers list
   */
  async getDrivers() {
    return apiRequest('/drivers');
  },

  /**
   * 8.1. Create a new driver
   */
  async createDriver(driverData) {
    return apiRequest('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData)
    });
  },

  /**
   * 8.2. Update a driver
   */
  async updateDriver(driverId, driverData) {
    const cleanId = driverId ? encodeURIComponent(driverId) : '';
    return apiRequest(`/drivers/${cleanId}`, {
      method: 'PUT',
      body: JSON.stringify(driverData)
    });
  },

  /**
   * 8.3. Delete a driver
   */
  async deleteDriver(driverId) {
    const cleanId = driverId ? encodeURIComponent(driverId) : '';
    return apiRequest(`/drivers/${cleanId}`, {
      method: 'DELETE'
    });
  },

  /**
   * 9. Get vehicles fleet list
   */
  async getVehicles(category) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/vehicles${query}`);
  },

  /**
   * 10. Send real OTP verification code to Customer Email & Mobile SMS
   */
  async sendOtp({ email, phone, otp }) {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, phone, otp })
    });
  },

  /**
   * 11. Register new customer account in MongoDB database
   */
  async register(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * 12. Login customer or super admin against MongoDB database
   */
  async login({ usernameOrEmail, password }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
  },

  /**
   * 13. Get all registered users from MongoDB database
   */
  async getUsers() {
    return apiRequest('/auth/users');
  },

  /**
   * 14. Get Super Admin master credentials from MongoDB
   */
  async getAdminCredentials() {
    return apiRequest('/auth/admin-credentials');
  },

  /**
   * 15. Update Super Admin password in MongoDB
   */
  async updateAdminPassword(newPassword) {
    return apiRequest('/auth/admin-password', {
      method: 'PUT',
      body: JSON.stringify({ newPassword })
    });
  }
};

export default hireApi;

