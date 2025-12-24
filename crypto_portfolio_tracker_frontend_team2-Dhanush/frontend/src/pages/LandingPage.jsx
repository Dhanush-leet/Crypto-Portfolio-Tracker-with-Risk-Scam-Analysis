import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSignIn = () => {
    const signInSection = document.getElementById('sign-in-section');
    if (signInSection) {
      signInSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section" id="hero-section">
        <div className="hero-content">
          <h1 className={`hero-title ${isVisible ? 'fade-in' : ''}`}>
            Crypto <span className="accent">Portfolio</span> Tracker
          </h1>
          
          <div className={`hero-animation ${isVisible ? 'fade-in' : ''}`}>
            <div className="crypto-icons">
              <div className="crypto-icon bitcoin">₿</div>
              <div className="crypto-icon ethereum">Ξ</div>
              <div className="chart-container">
                <svg className="chart-svg" viewBox="0 0 200 100">
                  <path 
                    d="M 20 80 Q 60 40 100 60 T 180 30" 
                    stroke="#3b82f6" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="80" r="4" fill="#3b82f6" />
                  <circle cx="100" cy="60" r="4" fill="#3b82f6" />
                  <circle cx="180" cy="30" r="4" fill="#3b82f6" />
                </svg>
              </div>
            </div>
          </div>

          <p className={`hero-description ${isVisible ? 'fade-in' : ''}`}>
            Securely manage and track your cryptocurrency investments across multiple exchanges. 
            Real-time portfolio analytics, secure API key management, and comprehensive transaction history.
          </p>

          <div className={`feature-pills ${isVisible ? 'fade-in' : ''}`}>
            <span className="pill">
              <span className="pill-icon">🔒</span> Secure API Management
            </span>
            <span className="pill">
              <span className="pill-icon">📊</span> Real-time Analytics
            </span>
            <span className="pill">
              <span className="pill-icon">💱</span> Multi-Exchange Support
            </span>
          </div>
        </div>

        <div className={`scroll-indicator ${isVisible ? 'fade-in' : ''}`} onClick={scrollToSignIn}>
          <div className="scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l3 3 3-3" />
              <path d="M7 6l3 3 3-3" />
            </svg>
          </div>
          <span>Scroll to Sign In</span>
        </div>
      </section>

      {/* Sign In Section */}
      <section className="sign-in-section" id="sign-in-section">
        <div className="sign-in-content">
          <div className="sign-in-form">
            <h2 className="sign-in-title">Welcome Back</h2>
            <p className="sign-in-subtitle">Sign in to continue to your portfolio</p>
            
            <form className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className="form-input"
                  />
                  <button type="button" className="password-toggle">👁️</button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-text">Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="sign-in-button">
                Sign In
              </button>

              <div className="divider">
                <span className="divider-text">OR</span>
              </div>

              <button type="button" className="demo-button">
                🎭 Try Demo Account
              </button>

              <p className="sign-up-link">
                Don't have an account? <a href="/register">Create Account</a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;