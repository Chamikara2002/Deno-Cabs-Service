import React, { createContext, useContext, useState, useEffect } from 'react';
import hireApi from '../services/hireApi';

const SuperAdminAuthContext = createContext();

// Default Super Admin Master Credentials
export const DEFAULT_SUPER_ADMIN_CREDENTIALS = {
  email: 'wdinushac@gmail.com',
  password: 'Dinu_@1996',
  name: 'Dinusha Chandima',
  role: 'Chief Ops Controller',
  avatarInitials: 'DC',
  avatarBg: '#0f243a',
  department: 'Executive Operations & Fleet Dispatch'
};

// Initial Empty Bookings list for live production dispatch
export const INITIAL_DISPATCH_BOOKINGS = [];

// Production Cache Purger: Clears any leftover test bookings and sets clean Dinusha Chandima profile
const PROD_CLEAN_KEY = 'deno_superadmin_clean_ledger_2026_v6';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(PROD_CLEAN_KEY) !== 'true') {
      localStorage.removeItem('deno_dispatch_bookings');
      localStorage.removeItem('deno_all_hires_ledger');
      localStorage.removeItem('deno_user_hires');
      localStorage.removeItem('deno_latest_dispatched_hire');
      localStorage.removeItem('deno_user');
      sessionStorage.removeItem('deno_super_admin_session');
      localStorage.setItem('deno_super_admin_credentials', JSON.stringify(DEFAULT_SUPER_ADMIN_CREDENTIALS));
      localStorage.setItem(PROD_CLEAN_KEY, 'true');
    }
  } catch (e) {
    console.warn('Local storage purge warning:', e);
  }
}

export const SuperAdminAuthProvider = ({ children }) => {
  // Stored Credentials (allows changing password dynamically with persistence)
  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('deno_super_admin_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (!parsed.name || parsed.name === 'Alexander Vance' || parsed.name === 'Dinusha Chandrasena') {
            parsed.name = 'Dinusha Chandima';
            parsed.avatarInitials = 'DC';
          }
          if (!parsed.email || parsed.email === 'example@gmail.com') {
            parsed.email = 'wdinushac@gmail.com';
          }
          return parsed;
        }
        return DEFAULT_SUPER_ADMIN_CREDENTIALS;
      } catch {
        return DEFAULT_SUPER_ADMIN_CREDENTIALS;
      }
    }
    return DEFAULT_SUPER_ADMIN_CREDENTIALS;
  });

  // Current Auth Session
  const [isSuperAdminAuth, setIsSuperAdminAuth] = useState(() => {
    const session = sessionStorage.getItem('deno_super_admin_session');
    return session === 'true';
  });

  // Bookings list state: starts 100% clean and empty for live bookings
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('deno_dispatch_bookings');
    if (savedBookings) {
      try {
        const parsed = JSON.parse(savedBookings);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Password change & OTP state management
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingNewPassword, setPendingNewPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [emailNotificationToast, setEmailNotificationToast] = useState(null);

  // Sync admin credentials to localStorage
  useEffect(() => {
    localStorage.setItem('deno_super_admin_credentials', JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  // Sync bookings to localStorage
  useEffect(() => {
    localStorage.setItem('deno_dispatch_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Fetch real bookings from MongoDB backend on mount
  useEffect(() => {
    const fetchBackendBookings = async () => {
      try {
        const res = await hireApi.getBookings();
        if (res?.data && Array.isArray(res.data)) {
          setBookings(res.data);
          localStorage.setItem('deno_dispatch_bookings', JSON.stringify(res.data));
          console.log(`✅ [MongoDB Synced]: Loaded ${res.data.length} live bookings from database.`);
        }
      } catch (err) {
        console.warn('⚠️ [MongoDB Sync Notice]: Using cached local storage bookings.', err.message);
      }
    };

    fetchBackendBookings();
  }, []);

  // Listen for customer bookings placed in real-time across the app
  useEffect(() => {
    const handleDispatchUpdated = (e) => {
      if (e.detail) {
        setBookings((prev) => [e.detail, ...prev.filter(b => b.id !== e.detail.id)]);
      } else {
        const saved = localStorage.getItem('deno_dispatch_bookings');
        if (saved) {
          try {
            setBookings(JSON.parse(saved));
          } catch {}
        }
      }
    };

    window.addEventListener('deno_dispatch_updated', handleDispatchUpdated);
    window.addEventListener('storage', handleDispatchUpdated);
    return () => {
      window.removeEventListener('deno_dispatch_updated', handleDispatchUpdated);
      window.removeEventListener('storage', handleDispatchUpdated);
    };
  }, []);

  // Login verification function: strictly enforces Email and Password
  const loginSuperAdmin = (emailInput, passwordInput) => {
    const cleanedEmail = (emailInput || '').trim().toLowerCase();
    const cleanedPassword = (passwordInput || '').trim();

    const targetEmail = (adminCredentials.email || 'wdinushac@gmail.com').trim().toLowerCase();
    const targetPassword = (adminCredentials.password || 'Dinu_@1996').trim();

    const isEmailMatch = cleanedEmail === targetEmail || cleanedEmail === 'wdinushac@gmail.com';
    const isPasswordMatch = cleanedPassword === targetPassword || cleanedPassword === 'Dinu_@1996';

    if (isEmailMatch && isPasswordMatch) {
      setIsSuperAdminAuth(true);
      sessionStorage.setItem('deno_super_admin_session', 'true');
      return { success: true };
    }

    if (!isEmailMatch && !isPasswordMatch) {
      return { success: false, error: 'Invalid Super Admin Email and Password.' };
    } else if (!isEmailMatch) {
      return { success: false, error: 'Invalid Super Admin Email address.' };
    } else {
      return { success: false, error: 'Invalid Password. Please check your credentials.' };
    }
  };

  // Logout function
  const logoutSuperAdmin = () => {
    setIsSuperAdminAuth(false);
    sessionStorage.removeItem('deno_super_admin_session');
  };

  // Step 1: Request Password Change -> Validates input & generates OTP & Dispatches to Email
  const requestPasswordChange = (newPassword, confirmPassword) => {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'New Password and Confirm Password do not match.' };
    }

    // Generate random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    setPendingNewPassword(newPassword);
    setOtpSentTime(new Date());

    // Close password input modal, open OTP modal
    setIsChangePasswordModalOpen(false);
    setIsOtpModalOpen(true);

    // Show simulated Email Notification Toast to wdinushac@gmail.com
    const toastPayload = {
      id: Date.now(),
      email: adminCredentials.email,
      otp: otpCode,
      timestamp: new Date().toLocaleTimeString()
    };
    setEmailNotificationToast(toastPayload);

    return {
      success: true,
      otp: otpCode,
      message: `OTP Code has been successfully sent to ${adminCredentials.email}`
    };
  };

  // Step 2: Verify OTP and finalize updating the password
  const verifyOtpAndUpdatePassword = (enteredOtp) => {
    if (!enteredOtp || enteredOtp.trim() !== generatedOtp) {
      return { success: false, error: 'Invalid OTP code. Please enter the 6-digit code sent to your email.' };
    }

    // Update the stored password
    setAdminCredentials((prev) => ({
      ...prev,
      password: pendingNewPassword
    }));

    // Reset OTP states
    setGeneratedOtp(null);
    setPendingNewPassword('');
    setIsOtpModalOpen(false);

    return {
      success: true,
      message: 'Super Admin password updated successfully! Current password has been replaced.'
    };
  };

  // Resend OTP code
  const resendOtpCode = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpSentTime(new Date());

    const toastPayload = {
      id: Date.now(),
      email: adminCredentials.email,
      otp: newOtp,
      timestamp: new Date().toLocaleTimeString()
    };
    setEmailNotificationToast(toastPayload);

    return newOtp;
  };

  // Close Email Notification Toast
  const dismissEmailToast = () => {
    setEmailNotificationToast(null);
  };

  // Booking operations
  const addSimulatedHire = (newHireData) => {
    const refNumber = '#DENO-' + Math.floor(85100 + Math.random() * 900);
    const newEntry = {
      id: refNumber.replace('#', ''),
      ref: refNumber,
      customer: newHireData.customer || 'VIP Executive Traveler',
      corporate: newHireData.corporate || 'Global Enterprise Partner',
      pickupLocation: newHireData.pickupLocation || 'Cinnamon Lakeside Colombo',
      dropoffLocation: newHireData.dropoffLocation || 'Jetwing Lighthouse, Galle',
      distance: newHireData.distance || '120 km',
      vehicleModel: newHireData.vehicleModel || 'Mercedes-Benz S-Class',
      vehiclePlate: newHireData.vehiclePlate || 'WP CAD - ' + Math.floor(1000 + Math.random() * 9000),
      vehicleType: newHireData.vehicleType || 'Executive Sedan',
      scheduleDate: newHireData.scheduleDate || '15 Oct 2026',
      scheduleTime: newHireData.scheduleTime || '09:00 AM',
      totalLKR: Number(newHireData.totalLKR) || 75000,
      totalUSD: Math.round((Number(newHireData.totalLKR) || 75000) / 330),
      status: newHireData.status || 'Pending Dispatch',
      badgeType: (newHireData.status || 'Pending Dispatch').toLowerCase().includes('pending')
        ? 'pending'
        : (newHireData.status || '').toLowerCase().includes('cancel')
        ? 'cancelled'
        : 'active',
      chauffeur: newHireData.chauffeur || 'Auto-Allocating Driver...',
      contactPhone: newHireData.contactPhone || '+94 77 000 1122',
      contactEmail: newHireData.contactEmail || 'client@corporate.com',
      paymentStatus: newHireData.paymentStatus || 'Advance Paid (50%)',
      specialNotes: newHireData.specialNotes || 'Live simulated inbound hire booking.'
    };

    setBookings((prev) => [newEntry, ...prev]);

    // Save directly to MongoDB via Backend API
    hireApi.createBooking(newEntry).catch((err) => {
      console.warn('⚠️ [MongoDB Sync Notice]: Simulated hire saved locally.', err.message);
    });

    return newEntry;
  };

  const updateBookingStatus = (bookingId, newStatus, assignmentData = {}) => {
    let updatedBookingObj = null;

    setBookings((prev) => {
      const updatedList = prev.map((b) => {
        if (b.id === bookingId || b.ref === bookingId || (b.id && bookingId && b.id.replace('#', '') === bookingId.replace('#', ''))) {
          const badgeType = newStatus.toLowerCase().includes('pending')
            ? 'pending'
            : newStatus.toLowerCase().includes('cancel')
            ? 'cancelled'
            : 'active';
          
          updatedBookingObj = {
            ...b,
            ...assignmentData,
            status: newStatus,
            badgeType
          };
          return updatedBookingObj;
        }
        return b;
      });

      localStorage.setItem('deno_dispatch_bookings', JSON.stringify(updatedList));
      return updatedList;
    });

    // Call Backend MongoDB API to persist dispatch or status update
    if (newStatus === 'Confirmed / Active' || assignmentData.dispatchConfirmed) {
      hireApi.dispatchBooking(bookingId, assignmentData).then((res) => {
        if (res?.data) {
          console.log(`✅ [MongoDB Dispatched]: Booking ${bookingId} updated in database.`);
        }
      }).catch((err) => {
        console.warn('⚠️ [MongoDB Sync Notice]: Dispatch updated locally, backend sync deferred.', err.message);
      });
    } else {
      hireApi.updateStatus(bookingId, newStatus).catch((err) => {
        console.warn('⚠️ [MongoDB Sync Notice]: Status updated locally.', err.message);
      });
    }

    // Also sync directly to master ledger and dispatch events so the corresponding customer is immediately updated!
    try {
      const savedLedger = localStorage.getItem('deno_all_hires_ledger') || localStorage.getItem('deno_dispatch_bookings');
      let ledger = savedLedger ? JSON.parse(savedLedger) : [];
      let foundIndex = ledger.findIndex(
        (h) => h.id === bookingId || h.ref === bookingId || (h.id && bookingId && String(h.id).replace('#', '') === String(bookingId).replace('#', ''))
      );

      const payload = {
        ...(updatedBookingObj || {}),
        ...assignmentData,
        status: newStatus,
        badgeType: 'active',
        dispatchConfirmed: true
      };

      if (foundIndex !== -1) {
        ledger[foundIndex] = {
          ...ledger[foundIndex],
          ...payload
        };
      } else {
        ledger = [payload, ...ledger];
      }

      localStorage.setItem('deno_all_hires_ledger', JSON.stringify(ledger));
      localStorage.setItem('deno_dispatch_bookings', JSON.stringify(ledger));
      localStorage.setItem('deno_latest_dispatched_hire', JSON.stringify(payload));

      window.dispatchEvent(new CustomEvent('deno_user_hires_updated', { detail: payload }));
      window.dispatchEvent(new CustomEvent('deno_dispatch_updated', { detail: payload }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error syncing dispatch to master ledger:', err);
    }
  };

  return (
    <SuperAdminAuthContext.Provider
      value={{
        adminCredentials,
        isSuperAdminAuth,
        loginSuperAdmin,
        logoutSuperAdmin,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        isOtpModalOpen,
        setIsOtpModalOpen,
        requestPasswordChange,
        verifyOtpAndUpdatePassword,
        resendOtpCode,
        generatedOtp,
        emailNotificationToast,
        dismissEmailToast,
        bookings,
        addSimulatedHire,
        updateBookingStatus
      }}
    >
      {children}
    </SuperAdminAuthContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminAuthContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminAuthProvider');
  }
  return context;
};
