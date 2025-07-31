import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserTypeSelection from './pages/UserTypeSelection';
import Dashboard from './pages/Dashboard';
import CompanyDetail from './pages/CompanyDetail';
import Reviews from './pages/Reviews';
import AddReview from './pages/AddReview';
import ReviewDetail from './pages/ReviewDetail';

import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user-type-selection" element={<UserTypeSelection />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/reviews/new" element={<AddReview />} />
            <Route path="/reviews/:id" element={<ReviewDetail />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App; 