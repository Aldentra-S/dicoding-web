import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Auth from './Register and Login/app.jsx';
import Dashboard from './dashboard/dashboard.jsx';
import FinancialHealth from './financialHealth/financialHealth.jsx';
import ConsultationList from './consultation/consultationList.jsx';
import BookingConsultation from './consultation/bookingConsultation.jsx';
import Education from './education/educationPage.jsx';
import Profile from './profile/userProfile.jsx';
import './index.css';

const Guard = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <Guard>
                <Dashboard />
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
