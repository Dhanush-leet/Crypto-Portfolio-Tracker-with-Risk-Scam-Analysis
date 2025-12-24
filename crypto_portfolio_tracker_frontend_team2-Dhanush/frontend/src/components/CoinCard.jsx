import React, { useState } from 'react';
import Sparkline from './Sparkline';
import Modal from './Modal';
import './CoinCard.css';

/**
 * Coin card component displaying coin information and holdings
 * @param {Object} props - Component props
 * @param {string} props.id - Coin ID (e.g., 'bitcoin')
 * @param {string} props.name - Coin name (e.g., 'Bitcoin')
 * @param {string} props.symbol - Coin symbol (e.g., 'BTC')
 * @param {number} props.price - Current price in USD
 * @param {number} props.change24h - 24h percentage change
 * @param {number} props.amount - User's holding amount
 * @param {number[]} props.sparklineData - Array of price data for sparkline
 * @param {Function} props.onAmountChange - Callback when amount changes
 */
const CoinCard = ({ 
  id, 
  name, 
  symbol, 
  price, 
  change24h, 
  amount, 
  sparklineData,
  onAmountChange 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState(amount || 0);
  const [error, setError] = useState('');

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setNewAmount(value);
    
    // Validate input - only allow numbers and decimal point
    if (value && !/^\d*\.?\d*$/.test(value)) {
      setError('Please enter a valid number');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate input
    if (newAmount && !/^\d*\.?\d*$/.test(newAmount)) {
      setError('Please enter a valid number');
      return;
    }
    
    const amountValue = parseFloat(newAmount) || 0;
    onAmountChange(id, amountValue);
    setIsModalOpen(false);
    setError('');
  };

  const handleCancel = () => {
    setNewAmount(amount || 0);
    setIsModalOpen(false);
    setError('');
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <>
      <div className="coin-card glassmorphism">
        <div className="coin-header">
          <div className="coin-info">
            <h3 className="coin-name">{name}</h3>
            <span className="coin-symbol">{symbol.toUpperCase()}</span>
          </div>
          <div className="coin-price">{formatCurrency(price)}</div>
        </div>
        
        <div className="coin-details">
          <div className="coin-change" style={{ color: change24h >= 0 ? '#4CAF50' : '#F44336' }}>
            {formatPercentage(change24h)}
          </div>
          
          {sparklineData && sparklineData.length > 0 && (
            <div className="coin-sparkline">
              <Sparkline data={sparklineData} width={100} height={30} />
            </div>
          )}
        </div>
        
        <div className="coin-holdings">
          <div className="holding-amount">
            <span className="label">Holdings:</span>
            <span className="value">{amount || 0} {symbol.toUpperCase()}</span>
          </div>
          <div className="holding-value">
            <span className="label">Value:</span>
            <span className="value">{formatCurrency((amount || 0) * price)}</span>
          </div>
        </div>
        
        <button 
          className="edit-button"
          onClick={() => setIsModalOpen(true)}
          aria-label={`Edit ${name} amount`}
        >
          Edit Amount
        </button>
      </div>

      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCancel}
          title={`Edit ${name} Holdings`}
        >
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label htmlFor={`amount-${id}`}>Amount ({symbol.toUpperCase()}):</label>
              <input
                id={`amount-${id}`}
                type="text"
                value={newAmount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                aria-describedby={error ? `error-${id}` : undefined}
              />
              {error && (
                <div id={`error-${id}`} className="error-message" role="alert">
                  {error}
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={!!error}
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default CoinCard;