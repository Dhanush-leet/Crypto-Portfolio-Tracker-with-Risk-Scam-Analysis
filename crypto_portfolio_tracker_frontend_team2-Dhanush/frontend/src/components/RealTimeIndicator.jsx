import React, { useState, useEffect } from 'react';
import { isRealTimeActive } from '../services/realtimeMarket';
import './RealTimeIndicator.css';

const RealTimeIndicator = () => {
  const [isActive, setIsActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsActive(isRealTimeActive());
    
    // Set up interval to check real-time status
    const interval = setInterval(() => {
      setIsActive(isRealTimeActive());
    }, 1000);
    
    // Simulate updating indicator
    const updateInterval = setInterval(() => {
      if (isRealTimeActive()) {
        setIsUpdating(true);
        setTimeout(() => setIsUpdating(false), 500);
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(updateInterval);
    };
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div className="realtime-indicator">
      <div className={`indicator-light ${isUpdating ? 'updating' : 'active'}`}></div>
      <span className="indicator-text">
        {isUpdating ? 'Updating...' : 'Live'}
      </span>
    </div>
  );
};

export default RealTimeIndicator;