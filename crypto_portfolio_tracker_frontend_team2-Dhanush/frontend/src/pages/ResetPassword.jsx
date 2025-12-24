import React, { useState, useEffect } from 'react';
import { resetPassword } from '../api/authApi';
import { useSearchParams } from 'react-router-dom';
import Toast from '../components/Toast';
import './SignIn.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setToast({ 
        show: true, 
        message: 'Invalid or missing reset token. Please try resetting your password again.', 
        type: 'error' 
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password) {
      setToast({ show: true, message: 'Please enter a new password', type: 'error' });
      return;
    }
    
    if (password.length < 6) {
      setToast({ show: true, message: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }
    
    if (password !== confirmPassword) {
      setToast({ show: true, message: 'Passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      await resetPassword({ token, newPassword: password });
      setResetComplete(true);
      setToast({ 
        show: true, 
        message: 'Password reset successfully! You can now sign in with your new password.', 
        type: 'success' 
      });
    } catch (error) {
      setToast({ 
        show: true, 
        message: error.message || 'Failed to reset password. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="signin-page">
        <div className="signin-container">
          <div className="signin-card glass-card">
            <div className="signin-header">
              <h2>Password Reset Complete</h2>
              <p className="signin-subtitle">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            
            <div className="signin-form">
              <button 
                className="btn btn-primary btn-full"
                onClick={() => window.location.href = '/signin'}
              >
                Go to Sign In
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
            <h2>Reset Password</h2>
            <p className="signin-subtitle">
              Enter your new password below to reset your account password.
            </p>
          </div>
          
          <form className="signin-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="form-hint">Password must be at least 6 characters</div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;