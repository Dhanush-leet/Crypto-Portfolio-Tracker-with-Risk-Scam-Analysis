import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="splash-container">
      <div className="splash-content">
        <h1 className="splash-title">Crypto Portfolio Tracker</h1>
        <p className="splash-tagline">Track, Analyze, and Optimize Your Crypto Investments</p>
        <button className="splash-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
