import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages import
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StockPredictor from './pages/StockPredictor';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import ContactSupport from './pages/ContactSupport';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/predictor" element={<ProtectedRoute><StockPredictor /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/about" element={<ProtectedRoute><AboutUs /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />
      
      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
