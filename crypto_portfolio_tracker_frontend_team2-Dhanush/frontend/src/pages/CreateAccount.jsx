import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import { showToast } from '../components/Toast';
import './CreateAccount.css';

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showStrengthMeter, setShowStrengthMeter] = useState(false);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calculate password strength when password changes
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(formData);
      showToast('Registration successful! Please check your email to verify your account.', 'success');
      navigate('/signin');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthLabel = (score) => {
    if (score === 0) return '';
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { label: 'Good', color: 'bg-blue-500' };
    return { label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getPasswordStrengthLabel(passwordStrength);

  return (
    <div className="signup-page">
      <div className="signup-content">
        <div className="brand-section">
          <div className="brand-content">
            <h1 className="brand-title">Crypto Portfolio Tracker</h1>
            <p className="brand-subtitle">Join thousands of crypto investors</p>
            
            <div className="statistics">
              <div className="stat-card">
                <h3>10,000+</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-card">
                <h3>50+</h3>
                <p>Supported Exchanges</p>
              </div>
              <div className="stat-card">
                <h3>$100M+</h3>
                <p>Assets Tracked</p>
              </div>
            </div>
            
            <div className="benefits-list">
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                Free to get started
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                No credit card required
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                5-minute setup
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✓</span>
                Bank-level security
              </div>
            </div>
          </div>
        </div>
        
        <div className="signup-form">
          <h2 className="signup-title">Create Account</h2>
          <p className="signup-subtitle">Start tracking your portfolio today</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                required
              />
              {errors.email && (
                <div className="form-error">{errors.email}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                onFocus={() => setShowStrengthMeter(true)}
                onBlur={() => setShowStrengthMeter(false)}
                required
              />
              {showStrengthMeter && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div 
                      className={`strength-fill ${strength.color}`} 
                      style={{ width: `${passwordStrength * 20}%` }}
                    ></div>
                  </div>
                  <div className="strength-label">{strength.label}</div>
                </div>
              )}
              {errors.password && (
                <div className="form-error">{errors.password}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="text"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                required
              />
              {errors.confirmPassword && (
                <div className="form-error">{errors.confirmPassword}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="signup-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="divider">
              <span className="divider-text">OR</span>
            </div>
            
            <button 
              type="button" 
              className="demo-button"
              disabled={isLoading}
            >
              Try Demo Account
            </button>
            
            <p className="signin-link">
              Already have an account? <Link to="/signin">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;