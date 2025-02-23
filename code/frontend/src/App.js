import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import AuthPage from './components/AuthPage';
import Navbar from './components/Navbar';
import PasswordReset from './components/passwordReset';
import ProfilePage from './components/ProfilePage';
import ScanUpload from './components/ScanUpload'; // ✅ Fix import name
import Scan from './components/Scan';
import Epf from './components/Epf';
import Gst from './components/Gst';
import Itr from './components/Itr';
import Invoice from './components/Invoice';
import InvoiceCreate from './components/invoice/InvoiceCreate';
import EwayCreate from './components/ewaybill/EwayCreate';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children, allowIfLoggedIn = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (user && !allowIfLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppContent() {
  const { user } = useAuth();
  
  return (
    <div className="App">
      {user && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        <Route
          path="/upload" // ✅ Add this route for Scan.js
          element={
            <ProtectedRoute>
              <ScanUpload />
            </ProtectedRoute>
          }
        />
        <Route
           path="/scan" element={
           <ProtectedRoute>
            <Scan />
            </ProtectedRoute>
            }
        /> 
        <Route
          path="/gst"
          element={
            <ProtectedRoute>
              <Gst />
            </ProtectedRoute>
          }
        />
        <Route
          path="/itr"
          element={
            <ProtectedRoute>
              <Itr />
            </ProtectedRoute>
          }
        />
        <Route
          path="/epf"
          element={
            <ProtectedRoute>
              <Epf />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/reset-password"
          element={
            <PublicRoute allowIfLoggedIn={true}>
              <PasswordReset />
            </PublicRoute>
          }
        />
        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/create"
          element={
            <ProtectedRoute>
              <InvoiceCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/ewayBill"
          element={
            <ProtectedRoute>
              <EwayCreate />
            </ProtectedRoute>
          }
        />
        {/* Additional routes for profile-related pages */}
        {/* <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        /> */}
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;