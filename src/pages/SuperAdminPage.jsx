import React from 'react';
import { SuperAdminAuthProvider, useSuperAdmin } from '../context/SuperAdminAuthContext';
import SuperAdminDashboard from '../components/SuperAdmin/jsx/SuperAdminDashboard';
import SuperAdminLogin from '../components/SuperAdmin/jsx/SuperAdminLogin';
import './SuperAdminPage.css';

const SuperAdminPageContent = () => {
  const { isSuperAdminAuth } = useSuperAdmin();

  // If authenticated as Super Admin, display the full Dispatch & Management Console
  // Otherwise, display the restricted Super Admin Login Portal requiring Super Admin credentials
  return (
    <div className="deno-super-admin-page-wrapper">
      {isSuperAdminAuth ? <SuperAdminDashboard /> : <SuperAdminLogin />}
    </div>
  );
};

const SuperAdminPage = () => {
  return (
    <SuperAdminAuthProvider>
      <SuperAdminPageContent />
    </SuperAdminAuthProvider>
  );
};

export default SuperAdminPage;
