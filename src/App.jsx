import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Common/Navbar';
import Footer from './components/Common/Footer';
import AuthModal from './components/Common/AuthModal';
import LoginAlertModal from './components/Common/LoginAlertModal';

import MainLandingPage from './pages/MainLandingPage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import HirePage from './pages/HirePage';
import ToursPage from './pages/ToursPage';
import RentPage from './pages/RentPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PreviousHirePage from './pages/PreviousHirePage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import SuperAdminPage from './pages/SuperAdminPage';

function AppContent() {
  const location = useLocation();
  const isSuperAdminRoute = 
    location.pathname === '/super-admin' || 
    location.pathname === '/supper-admin' || 
    location.pathname === '/admin';

  return (
    <div className={`deno-app-wrapper ${isSuperAdminRoute ? 'super-admin-layout' : ''}`}>
      {!isSuperAdminRoute && <Navbar />}
      <main className="deno-app-main">
        <Routes>
          <Route path="/" element={<MainLandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/hire" element={<HirePage />} />
          <Route path="/tours" element={<ToursPage />} />
          <Route path="/rent" element={<RentPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/previous-hire" element={<PreviousHirePage />} />
          <Route path="/payment-history" element={<PaymentHistoryPage />} />
          
          {/* Super Admin Module Routes */}
          <Route path="/super-admin" element={<SuperAdminPage />} />
          <Route path="/supper-admin" element={<SuperAdminPage />} />
          <Route path="/admin" element={<SuperAdminPage />} />
        </Routes>
      </main>
      {!isSuperAdminRoute && <Footer />}

      {/* Global Authentication & Alert Modals */}
      {!isSuperAdminRoute && (
        <>
          <AuthModal />
          <LoginAlertModal />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
