import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Auth from './Register and Login/app.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import AkumulasiKeuangan from './akumulasi/AkumulasiKeuangan.jsx';
import FinancialHealth from './financialHealth/financialHealth.jsx';
import ConsultationList from './consultation/consultationList.jsx';
import BookingConsultation from './consultation/bookingConsultation.jsx';
import Education from './education/educationPage.jsx';
import Profile from './profile/userProfile.jsx';
import AdminPanel from './admin/adminPanel.jsx';
import './index.css';

const Guard = ({ children }) => {
  const { user, busy } = useApp();
  const token = localStorage.getItem('token');
  if (busy.init)
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  if (!token || !user) return <Navigate to="/" replace />;
  return children;
};

const AdminGuard = ({ children }) => {
  const adminToken = localStorage.getItem('admin_token');
  // Kalau sudah punya admin_token, langsung masuk — AdminPanel handle loginnya sendiri
  if (adminToken) return children;
  // Kalau belum punya admin_token, tetap boleh masuk ke AdminPanel (untuk tampil form login admin)
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminPanel />
              </AdminGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Guard>
                <Dashboard />
              </Guard>
            }
          />
          <Route
            path="/akumulasi-keuangan"
            element={
              <Guard>
                <AkumulasiKeuangan />
              </Guard>
            }
          />
          <Route
            path="/financial-health"
            element={
              <Guard>
                <FinancialHealth />
              </Guard>
            }
          />
          <Route
            path="/consultation"
            element={
              <Guard>
                <ConsultationList />
              </Guard>
            }
          />
          <Route
            path="/consultation/booking/:id"
            element={
              <Guard>
                <BookingConsultation />
              </Guard>
            }
          />
          <Route
            path="/education"
            element={
              <Guard>
                <Education />
              </Guard>
            }
          />
          <Route
            path="/profile"
            element={
              <Guard>
                <Profile />
              </Guard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
);
