import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import PortfolioEnhanced from './pages/PortfolioEnhanced';
import ImportTransactions from './pages/ImportTransactions';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import { isAuthenticated } from './api';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio-enhanced" 
            element={
              <ProtectedRoute>
                <PortfolioEnhanced />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/import-transactions" 
            element={
              <ProtectedRoute>
                <ImportTransactions />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toast />
      </div>
    </Router>
  );
}

export default App;