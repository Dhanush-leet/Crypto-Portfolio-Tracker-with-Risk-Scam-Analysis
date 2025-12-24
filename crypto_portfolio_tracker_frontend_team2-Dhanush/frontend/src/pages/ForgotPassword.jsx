import React, { useState } from 'react';
import { forgotPassword } from '../api/authApi';
import Toast from '../components/Toast';
import './SignIn.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setToast({ show: true, message: 'Please enter your email address', type: 'error' });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setToast({ show: true, message: 'Please enter a valid email address', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      await forgotPassword({ email });
      setSubmitted(true);
      setToast({ 
        show: true, 
        message: 'Password reset link sent to your email. Please check your inbox.', 
        type: 'success' 
      });
    } catch (error) {
      setToast({ 
        show: true, 
        message: error.message || 'Failed to send password reset email. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  if (submitted) {
    return (
      <div className="signin-page">
        <div className="signin-container">
          <div className="signin-card glass-card">
            <div className="signin-header">
              <h2>Password Reset Sent</h2>
              <p className="signin-subtitle">
                We've sent a password reset link to your email address. 
                Please check your inbox and follow the instructions.
              </p>
            </div>
            
            <div className="signin-form">
              <button 
                className="btn btn-primary btn-full"
                onClick={() => window.location.href = '/signin'}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
        
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(prev => ({ ...prev, show: false }))}
          />
        )}
      </div>
    );
  }

  return (
    <div className="signin-page">
      <div className="signin-container">
        <div className="signin-card glass-card">
          <div className="signin-header">
            <h2>Forgot Password</h2>
            <p className="signin-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
          
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="signin-footer">
              <span>Remember your password? </span>
              <a href="/signin" className="link">Sign In</a>
            </div>
          </form>
        </div>
      </div>
      
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
    </div>
  );
};

export default ForgotPassword;