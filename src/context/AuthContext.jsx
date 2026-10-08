import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SUPER_ADMIN_CREDENTIALS } from './SuperAdminAuthContext';
import hireApi from '../services/hireApi';

const AuthContext = createContext();

const INITIAL_REGISTERED_USERS = [];

// Production Cache Purger: Clears any leftover test bookings and purges stale mock user sessions
const PROD_CLEAN_KEY = 'deno_superadmin_clean_ledger_2026_v7';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(PROD_CLEAN_KEY) !== 'true') {
      localStorage.removeItem('deno_dispatch_bookings');
      localStorage.removeItem('deno_all_hires_ledger');
      localStorage.removeItem('deno_user_hires');
      localStorage.removeItem('deno_latest_dispatched_hire');
      localStorage.removeItem('deno_user'); // Clear stale mock user login session!
      sessionStorage.removeItem('deno_super_admin_session');
      localStorage.setItem('deno_super_admin_credentials', JSON.stringify(DEFAULT_SUPER_ADMIN_CREDENTIALS));
      localStorage.setItem(PROD_CLEAN_KEY, 'true');
    }
  } catch (e) {
    console.warn('Local storage purge warning:', e);
  }
}

// Legacy mock user emails to purge
const DEMO_USER_EMAILS = ['damith.j@enterprisetech.lk', 'kasun@denocabs.com', 'example@gmail.com'];

// Helper to strictly filter bookings for a specific user profile
const filterUserBookings = (currentUser, list) => {
  if (!currentUser || !currentUser.email) return [];
  const userEmail = (currentUser.email || '').toLowerCase().trim();
  const userId = currentUser.id || currentUser._id;
  if (!Array.isArray(list)) return [];
  
  return list.filter((b) => {
    if (!b) return false;
    const bEmail = (
      b.contactEmail || 
      b.email || 
      b.customerEmail || 
      b.customer?.email || 
      (typeof b.customer === 'string' && b.customer.includes('@') ? b.customer : '')
    ).toLowerCase().trim();
    const bUid = b.userId || b.customerId;
    return (bEmail && bEmail === userEmail) || (bUid && userId && String(bUid) === String(userId));
  });
};

export const AuthProvider = ({ children }) => {
  // Stored registered users list (purged of any legacy demo users)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('deno_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(u => u && u.email && !DEMO_USER_EMAILS.includes(u.email.toLowerCase()) && u.fullName !== 'Alexander Vance');
        }
        return [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Initial logged-in user state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('deno_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (
          !parsed || 
          !parsed.email || 
          parsed.email === 'example@gmail.com' || 
          parsed.fullName === 'Alexander Vance' ||
          DEMO_USER_EMAILS.includes(parsed.email.toLowerCase())
        ) {
          localStorage.removeItem('deno_user');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Super Admin session sync
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    return sessionStorage.getItem('deno_super_admin_session') === 'true';
  });

  // Auth modal control
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  // Pre-fill email for quick register switch
  const [prefilledEmail, setPrefilledEmail] = useState('');

  // Pre-filled Google account data for seamless registration
  const [googlePrefill, setGooglePrefill] = useState(null);

  // Popup alert for mandatory login before Hire placement
  const [loginAlertModal, setLoginAlertModal] = useState({
    isOpen: false,
    message: 'Please Login Or Register then Try again',
    onConfirm: null
  });

  // Master platform ledger of all bookings
  const [allHiresLedger, setAllHiresLedger] = useState(() => {
    try {
      const saved = localStorage.getItem('deno_all_hires_ledger') || localStorage.getItem('deno_dispatch_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // User-scoped hires (Strictly isolated to active logged-in user)
  const [userHires, setUserHires] = useState(() => {
    const savedUser = localStorage.getItem('deno_user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const savedLedger = localStorage.getItem('deno_all_hires_ledger') || localStorage.getItem('deno_dispatch_bookings');
    let ledgerList = [];
    try {
      if (savedLedger) {
        ledgerList = JSON.parse(savedLedger);
      }
    } catch {}
    return filterUserBookings(parsedUser, ledgerList);
  });

  // Sync registered users to localStorage
  useEffect(() => {
    localStorage.setItem('deno_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Sync user state
  useEffect(() => {
    if (user) {
      localStorage.setItem('deno_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('deno_user');
    }
  }, [user]);

  // Dynamically recompute user-scoped hires whenever active user or master ledger changes
  useEffect(() => {
    const scoped = filterUserBookings(user, allHiresLedger);
    setUserHires(scoped);
    if (user?.email) {
      localStorage.setItem(`deno_user_hires_${user.email.toLowerCase().trim()}`, JSON.stringify(scoped));
      localStorage.setItem('deno_user_hires', JSON.stringify(scoped));
    } else {
      localStorage.removeItem('deno_user_hires');
    }
  }, [user, allHiresLedger]);

  // Fetch real registered users and bookings from MongoDB backend on mount
  useEffect(() => {
    const fetchBackendData = async () => {
      // 1. Fetch Users from MongoDB
      try {
        const userRes = await hireApi.getUsers();
        if (userRes?.data && Array.isArray(userRes.data)) {
          const dbUsers = userRes.data;

          // Check if localStorage has any user that is not yet in MongoDB (e.g. registered in offline mode or edge)
          const localSaved = localStorage.getItem('deno_registered_users');
          if (localSaved) {
            try {
              const localUsers = JSON.parse(localSaved);
              if (Array.isArray(localUsers)) {
                for (const lUser of localUsers) {
                  if (
                    lUser && 
                    lUser.email && 
                    !DEMO_USER_EMAILS.includes(lUser.email.toLowerCase()) && 
                    lUser.fullName !== 'Alexander Vance'
                  ) {
                    const existsInDb = dbUsers.some(
                      (u) => u.email.toLowerCase() === lUser.email.toLowerCase()
                    );
                    if (!existsInDb && lUser.password) {
                      // Auto-sync offline created user to MongoDB!
                      hireApi.register(lUser).catch(() => {});
                    }
                  }
                }
              }
            } catch {}
          }

          setRegisteredUsers(dbUsers);
          localStorage.setItem('deno_registered_users', JSON.stringify(dbUsers));
          console.log(`✅ [MongoDB Synced]: Loaded ${dbUsers.length} registered users from database.`);
        }
      } catch (err) {
        console.warn('⚠️ [MongoDB Sync Notice - Users]: Using cached local storage users.', err.message);
      }

      // 2. Fetch Bookings from MongoDB
      try {
        const res = await hireApi.getBookings();
        if (res?.data && Array.isArray(res.data)) {
          const dbBookings = res.data;
          setAllHiresLedger(dbBookings);
          localStorage.setItem('deno_all_hires_ledger', JSON.stringify(dbBookings));
          localStorage.setItem('deno_dispatch_bookings', JSON.stringify(dbBookings));
          console.log(`✅ [MongoDB Synced]: Loaded ${dbBookings.length} bookings from database.`);
        }
      } catch (err) {
        console.warn('⚠️ [MongoDB Sync Notice - Bookings]: Using cached local storage bookings.', err.message);
      }
    };

    fetchBackendData();
  }, []);

  // Listen for real-time dispatch and ledger updates
  useEffect(() => {
    const handleLedgerUpdated = (e) => {
      try {
        const savedLedger = localStorage.getItem('deno_all_hires_ledger') || localStorage.getItem('deno_dispatch_bookings');
        let currentLedger = savedLedger ? JSON.parse(savedLedger) : [];

        if (e?.detail && e.detail.id) {
          const detailItem = e.detail;
          const idx = currentLedger.findIndex(
            (b) => b.id === detailItem.id || b.ref === detailItem.ref || (b.id && detailItem.id && String(b.id).replace('#', '') === String(detailItem.id).replace('#', ''))
          );
          if (idx !== -1) {
            currentLedger[idx] = { ...currentLedger[idx], ...detailItem };
          } else {
            currentLedger = [detailItem, ...currentLedger];
          }
          localStorage.setItem('deno_all_hires_ledger', JSON.stringify(currentLedger));
          localStorage.setItem('deno_dispatch_bookings', JSON.stringify(currentLedger));
        }

        setAllHiresLedger(currentLedger);
      } catch (err) {
        console.warn('Error handling ledger update:', err);
      }
    };

    window.addEventListener('deno_user_hires_updated', handleLedgerUpdated);
    window.addEventListener('deno_dispatch_updated', handleLedgerUpdated);
    window.addEventListener('storage', handleLedgerUpdated);

    return () => {
      window.removeEventListener('deno_user_hires_updated', handleLedgerUpdated);
      window.removeEventListener('deno_dispatch_updated', handleLedgerUpdated);
      window.removeEventListener('storage', handleLedgerUpdated);
    };
  }, []);

  // Get current active Super Admin credentials
  const getSuperAdminCredentials = () => {
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
  };

  // Unified Login Handler for both Normal Customers and Super Admin (Cross-Browser MongoDB Sync)
  const login = async ({ usernameOrEmail, password }) => {
    const input = (usernameOrEmail || '').trim();
    const inputPwd = (password || '').trim();

    if (!input || !inputPwd) {
      return { success: false, error: 'Please enter both Email/Username and Password.' };
    }

    // 1. Try real MongoDB Authentication first
    try {
      const res = await hireApi.login({ usernameOrEmail: input, password: inputPwd });
      if (res?.success && res.user) {
        if (res.isSuperAdmin) {
          sessionStorage.setItem('deno_super_admin_session', 'true');
          setIsSuperAdmin(true);
          setUser(res.user);
          setIsAuthModalOpen(false);
          return { success: true, isSuperAdmin: true, user: res.user };
        } else {
          setUser(res.user);
          setIsSuperAdmin(false);
          sessionStorage.removeItem('deno_super_admin_session');
          setIsAuthModalOpen(false);

          // Update local state and localStorage
          setRegisteredUsers((prev) => {
            const exists = prev.some((u) => u.email.toLowerCase() === res.user.email.toLowerCase());
            const updated = exists 
              ? prev.map((u) => (u.email.toLowerCase() === res.user.email.toLowerCase() ? { ...u, ...res.user } : u))
              : [res.user, ...prev];
            localStorage.setItem('deno_registered_users', JSON.stringify(updated));
            return updated;
          });

          return { success: true, isSuperAdmin: false, user: res.user };
        }
      }
    } catch (apiErr) {
      const errMsg = apiErr.message || '';
      if (
        errMsg.includes('not found') || 
        errMsg.includes('No customer account') || 
        errMsg.includes('No account found') || 
        errMsg.includes('not registered')
      ) {
        return {
          success: false,
          notRegistered: true,
          typedEmail: input,
          error: `No customer account registered under "${input}". Please register first to continue.`
        };
      }
      if (errMsg.includes('Incorrect password') || errMsg.includes('Invalid password')) {
        return {
          success: false,
          error: 'Incorrect password. Please check your password and try again.'
        };
      }
    }

    // 2. Fallback to Local Verification if backend is offline
    const adminCreds = getSuperAdminCredentials();
    const isSuperAdminInput = 
      input.toLowerCase() === adminCreds.email.toLowerCase() ||
      input.toLowerCase() === 'wdinushac@gmail.com' ||
      input.toLowerCase() === 'super_admin' ||
      input.toLowerCase() === 'admin';

    if (isSuperAdminInput) {
      if (inputPwd === adminCreds.password || inputPwd === 'Dinu_@1996') {
        sessionStorage.setItem('deno_super_admin_session', 'true');
        setIsSuperAdmin(true);

        const superAdminUserObj = {
          id: 'admin_master',
          fullName: adminCreds.name || 'Dinusha Chandima',
          username: 'super_admin',
          email: adminCreds.email || 'wdinushac@gmail.com',
          role: 'Super Admin',
          accountTier: 'Super Admin • Dispatch Controller',
          avatarUrl: '',
          isSuperAdmin: true
        };

        setUser(superAdminUserObj);
        setIsAuthModalOpen(false);
        return { success: true, isSuperAdmin: true, user: superAdminUserObj };
      } else {
        return { 
          success: false, 
          error: 'Invalid password for Super Admin account. Please verify credentials.' 
        };
      }
    }

    const existingUser = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === input.toLowerCase() ||
        (u.username && u.username.toLowerCase() === input.toLowerCase())
    );

    if (!existingUser) {
      return {
        success: false,
        notRegistered: true,
        typedEmail: input,
        error: `No customer account registered under "${input}". Please register first to continue.`
      };
    }

    if (existingUser.password && existingUser.password !== inputPwd) {
      return {
        success: false,
        error: 'Incorrect password. Please check your password and try again.'
      };
    }

    const loggedUser = {
      id: existingUser.id || existingUser._id || 'usr_' + Date.now(),
      fullName: existingUser.fullName,
      username: existingUser.username,
      email: existingUser.email,
      phone: existingUser.phone || '+94 77 123 4567',
      accountTier: existingUser.accountTier || 'Individual / Guest',
      accountNumber: existingUser.accountNumber || '',
      companyName: existingUser.companyName || '',
      avatarUrl: existingUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      notificationCount: 2,
      isSuperAdmin: false
    };

    setUser(loggedUser);
    setIsSuperAdmin(false);
    sessionStorage.removeItem('deno_super_admin_session');
    setIsAuthModalOpen(false);

    return { success: true, isSuperAdmin: false, user: loggedUser };
  };

  // Register new customer handler (saves directly into MongoDB for all browsers)
  const register = async (registrationData, autoLogin = false) => {
    const email = (registrationData.email || '').trim().toLowerCase();
    const username = (registrationData.username || '').trim().toLowerCase();

    let createdUser = null;

    // 1. Save directly into MongoDB Database
    try {
      const res = await hireApi.register({
        ...registrationData,
        email,
        username
      });
      if (res?.success && res.user) {
        createdUser = res.user;
      }
    } catch (err) {
      console.warn('MongoDB register notice:', err.message);
    }

    // Fallback if backend offline
    if (!createdUser) {
      createdUser = {
        id: 'usr_' + Date.now(),
        fullName: registrationData.fullName || 'New User',
        username: registrationData.username || 'user_' + Date.now().toString().slice(-4),
        email: registrationData.email,
        phone: registrationData.phone || '+94 77 000 0000',
        password: registrationData.password,
        accountTier: registrationData.accountTier || 'Individual / Guest',
        accountNumber: `#CUST-DENO-${Date.now().toString().slice(-4)}`,
        companyName: registrationData.companyName || '',
        avatarUrl: registrationData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        notificationCount: 1,
        isSuperAdmin: false
      };
    }

    setRegisteredUsers((prev) => {
      const updated = [createdUser, ...prev.filter((u) => u.email.toLowerCase() !== createdUser.email.toLowerCase())];
      localStorage.setItem('deno_registered_users', JSON.stringify(updated));
      return updated;
    });

    if (autoLogin) {
      setUser(createdUser);
      setIsSuperAdmin(false);
      sessionStorage.removeItem('deno_super_admin_session');
      setIsAuthModalOpen(false);
    }

    return { success: true, user: createdUser };
  };

  // Google Account Login / Registration Bridge Handler
  const loginWithGoogle = (googleProfile) => {
    if (!googleProfile || !googleProfile.email) {
      return { success: false, error: 'Could not retrieve Google account details.' };
    }

    const gEmail = googleProfile.email.trim().toLowerCase();
    const adminCreds = getSuperAdminCredentials();

    // 1. If Google account belongs to Super Admin
    if (gEmail === adminCreds.email.toLowerCase() || gEmail === 'wdinushac@gmail.com') {
      sessionStorage.setItem('deno_super_admin_session', 'true');
      setIsSuperAdmin(true);

      const superAdminUserObj = {
        id: 'admin_master',
        fullName: adminCreds.name || googleProfile.name || 'Dinusha Chandima',
        username: 'super_admin',
        email: adminCreds.email || gEmail,
        role: 'Super Admin',
        accountTier: 'Super Admin • Dispatch Controller',
        avatarUrl: googleProfile.picture || '',
        isSuperAdmin: true
      };

      setUser(superAdminUserObj);
      setIsAuthModalOpen(false);
      return { success: true, isSuperAdmin: true, user: superAdminUserObj };
    }

    // 2. Check if normal customer exists with this email
    const existingUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === gEmail
    );

    if (existingUser) {
      const loggedUser = {
        id: existingUser.id || 'usr_' + Date.now(),
        fullName: existingUser.fullName || googleProfile.name,
        username: existingUser.username,
        email: existingUser.email,
        phone: existingUser.phone || '+94 77 123 4567',
        accountTier: existingUser.accountTier || 'Individual / Guest',
        avatarUrl: googleProfile.picture || existingUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        notificationCount: 2,
        isSuperAdmin: false
      };

      setUser(loggedUser);
      setIsSuperAdmin(false);
      sessionStorage.removeItem('deno_super_admin_session');
      setIsAuthModalOpen(false);

      return { success: true, isSuperAdmin: false, user: loggedUser };
    }

    // 3. User is NOT registered -> Switch to register tab and pre-fill ONLY Email Address
    const newGoogleData = {
      fullName: '',
      email: gEmail,
      username: '',
      avatarUrl: googleProfile.picture || ''
    };

    setGooglePrefill(newGoogleData);
    setPrefilledEmail(gEmail);
    setAuthMode('register');

    return {
      success: false,
      notRegistered: true,
      googleData: newGoogleData
    };
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setIsSuperAdmin(false);
    sessionStorage.removeItem('deno_super_admin_session');
  };

  // Open login/register modal explicitly
  const openAuthModal = (mode = 'login', initialEmail = '') => {
    setAuthMode(mode);
    if (initialEmail) {
      setPrefilledEmail(initialEmail);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setGooglePrefill(null);
  };

  // Popup alert for mandatory login before Hire placement
  const triggerLoginRequiredAlert = () => {
    setLoginAlertModal({
      isOpen: true,
      message: 'Please Login Or Register then Try again',
      onConfirm: () => {
        setLoginAlertModal({ isOpen: false, message: '', onConfirm: null });
        openAuthModal('login');
      }
    });
  };

  const closeLoginAlertModal = () => {
    setLoginAlertModal({ isOpen: false, message: '', onConfirm: null });
  };

  // Helper to generate formatted sequential booking reference: #DENO-000-000-001
  const formatBookingRef = (sequenceNumber = 1) => {
    const padded = String(sequenceNumber).padStart(9, '0');
    return `#DENO-${padded.slice(0, 3)}-${padded.slice(3, 6)}-${padded.slice(6, 9)}`;
  };

  // Add new hire booking with full customer metadata synced to Super Admin dispatch
  const addHireBooking = (hireData) => {
    let nextSeq = 1;
    if (allHiresLedger && allHiresLedger.length > 0) {
      let maxSeq = 0;
      allHiresLedger.forEach(b => {
        const raw = String(b.ref || b.id || b.bookingId || '');
        const cleanDigits = raw.replace(/^#?DENO-?/i, '').replace(/[^0-9]/g, '');
        if (cleanDigits) {
          const num = parseInt(cleanDigits, 10);
          if (!isNaN(num) && num < 1000000000 && num > maxSeq) {
            maxSeq = num;
          }
        }
      });
      nextSeq = Math.max(allHiresLedger.length + 1, (maxSeq < 50000 ? maxSeq + 1 : allHiresLedger.length + 1));
    }
    const refNum = hireData.ref || formatBookingRef(nextSeq);
    const idVal = refNum.replace('#', '');
    
    // Calculate numeric fare
    let numericLkr = 45000;
    if (typeof hireData.estimatedFare === 'string') {
      const parsed = Number(hireData.estimatedFare.replace(/[^0-9]/g, ''));
      if (parsed > 0) numericLkr = parsed;
    } else if (typeof hireData.totalAmount === 'number' && hireData.totalAmount > 0) {
      numericLkr = hireData.totalAmount;
    } else if (typeof hireData.estimatedFare === 'number' && hireData.estimatedFare > 0) {
      numericLkr = hireData.estimatedFare;
    }

    const customerName = hireData.fullName || hireData.customer || user?.fullName || 'Valued Executive Guest';
    const customerEmail = hireData.email || hireData.contactEmail || user?.email || 'guest@denocabs.com';
    const customerPhone = hireData.phone || hireData.contactPhone || user?.phone || '+94 77 123 4567';
    const corporateName = hireData.company || hireData.corporate || (user?.accountTier && user.accountTier !== 'Individual / Guest' ? user.accountTier : 'Private Executive Client');
    const vehicleName = hireData.vehicle || hireData.vehicleModel || 'Toyota Land Cruiser V8';
    const vehicleCat = hireData.vehicleCategory || hireData.vehicleType || 'Luxury Class';
    const distanceVal = hireData.distanceKm || hireData.estimatedDistance || hireData.distance || '45 km';
    const pickupVal = hireData.pickupLocation || 'Colombo 03';
    const dropoffVal = hireData.dropoffLocation || 'Kandy';
    const schedDate = hireData.hireDate || hireData.pickupDate || hireData.scheduleDate || '15 Oct 2026';
    const schedTime = hireData.hireTime || hireData.pickupTime || hireData.scheduleTime || '09:00 AM';
    const dropDate = hireData.dropoffDate || schedDate;
    const dropTime = hireData.dropoffTime || '06:00 PM';
    const notes = hireData.description || hireData.specialNote || hireData.specialNotes || 'Chauffeur hire booked by customer via portal.';

    const newHire = {
      id: idVal,
      ref: refNum,
      customerId: user?.id || 'usr_guest',
      createdAt: new Date().toISOString(),
      status: 'Pending Approval',
      badgeType: 'pending',
      customer: customerName,
      corporate: corporateName,
      contactPhone: customerPhone,
      pickupLocation: pickupVal,
      dropoffLocation: dropoffVal,
      distance: distanceVal,
      vehicleModel: vehicleName,
      vehiclePlate: 'Pending Allocation',
      vehicleType: vehicleCat,
      scheduleDate: schedDate,
      scheduleTime: schedTime,
      hireDate: schedDate,
      hireTime: schedTime,
      dropoffDate: dropDate,
      dropoffTime: dropTime,
      totalLKR: numericLkr,
      totalUSD: Math.round(numericLkr / 330),
      paymentStatus: 'Advance Paid (50%)',
      chauffeur: 'Unassigned (Super Admin Allocation Required)',
      specialNotes: notes,
      flightNo: hireData.flightNo || '',
      dispatchConfirmed: false,
      ...hireData,
      // Enforce user ownership
      userId: user?.id || 'usr_guest',
      contactEmail: customerEmail,
      email: customerEmail
    };

    // Update master platform ledger
    setAllHiresLedger((prev) => {
      const updated = [newHire, ...prev.filter((b) => b.id !== idVal)];
      try {
        localStorage.setItem('deno_all_hires_ledger', JSON.stringify(updated));
        localStorage.setItem('deno_dispatch_bookings', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save directly to MongoDB via Backend API
    hireApi.createBooking(newHire).then((res) => {
      if (res?.data) {
        console.log('✅ [MongoDB Saved Booking]:', res.data.ref);
      }
    }).catch((err) => {
      console.warn('⚠️ [MongoDB Sync Notice]: Saved locally, backend sync deferred.', err.message);
    });

    try {
      window.dispatchEvent(new CustomEvent('deno_user_hires_updated', { detail: newHire }));
      window.dispatchEvent(new CustomEvent('deno_dispatch_updated', { detail: newHire }));
    } catch (err) {
      console.error('Error dispatching booking update events:', err);
    }

    return newHire;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSuperAdmin,
        registeredUsers,
        login,
        register,
        logout,
        isAuthModalOpen,
        authMode,
        prefilledEmail,
        setPrefilledEmail,
        openAuthModal,
        closeAuthModal,
        loginAlertModal,
        triggerLoginRequiredAlert,
        closeLoginAlertModal,
        userHires,
        addHireBooking,
        loginWithGoogle,
        googlePrefill,
        setGooglePrefill
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
