import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelExpenses from './pages/FuelExpenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public login route */}
          <Route path="/login" element={<Login />} />
          
          {/* Unauthorized access page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes wrapped in master Sidebar/Header Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="fleet"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'dispatcher', 'financial_analyst']}>
                  <Fleet />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="drivers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'safety_officer']}>
                  <Drivers />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="trips"
              element={
                <ProtectedRoute allowedRoles={['admin', 'dispatcher', 'safety_officer']}>
                  <Trips />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="maintenance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager']}>
                  <Maintenance />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="fuel-expenses"
              element={
                <ProtectedRoute allowedRoles={['admin', 'financial_analyst']}>
                  <FuelExpenses />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="analytics"
              element={
                <ProtectedRoute allowedRoles={['admin', 'fleet_manager', 'financial_analyst']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirects to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
