import React from 'react';
import './PortfolioSummary.css';

/**
 * Portfolio summary component showing key metrics
 * @param {Object} props - Component props
 * @param {number} props.totalValue - Total portfolio value in USD
 * @param {number} props.profit24h - 24h profit in USD
 * @param {number} props.profitPercentage - 24h profit percentage
 * @param {number} props.coinsOwned - Number of coins owned
 */
const PortfolioSummary = ({ 
  totalValue = 0, 
  profit24h = 0, 
  profitPercentage = 0, 
  coinsOwned = 0 
}) => {
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="portfolio-summary glassmorphism">
      <div className="summary-item">
        <div className="summary-label">Total Portfolio Value</div>
        <div className="summary-value large">{formatCurrency(totalValue)}</div>
      </div>
      
      <div className="summary-item">
        <div className="summary-label">24h Profit</div>
        <div className="summary-value" style={{ color: profit24h >= 0 ? '#4CAF50' : '#F44336' }}>
          {formatCurrency(profit24h)} ({formatPercentage(profitPercentage)})
        </div>
      </div>
      
      <div className="summary-item">
        <div className="summary-label">Coins Owned</div>
        <div className="summary-value">{coinsOwned}</div>
      </div>
    </div>
  );
};

export default PortfolioSummary;