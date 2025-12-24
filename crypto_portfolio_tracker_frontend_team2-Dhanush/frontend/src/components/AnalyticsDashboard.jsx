import React, { useState, useMemo } from 'react';
import Sparkline from './Sparkline';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = ({ holdings, prices, coins }) => {
  const [timeframe, setTimeframe] = useState('7d');

  // Calculate portfolio analytics using useMemo for performance
  const { analytics, allocationData } = useMemo(() => {
    let totalValue = 0;
    let coinsOwned = 0;
    const coinValues = [];
    const allocationPercentages = [];

    // Calculate total value and individual coin values
    coins.forEach(coin => {
      const amount = holdings[coin.id] || 0;
      const priceData = prices[coin.id];
      
      if (amount > 0 && priceData) {
        const value = amount * priceData.usd;
        totalValue += value;
        coinsOwned++;
        
        coinValues.push({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          amount: amount,
          price: priceData.usd,
          value: value,
          change24h: priceData.usd_24h_change || 0
        });
      }
    });

    // Calculate allocation percentages
    coinValues.forEach(coin => {
      const allocation = totalValue > 0 ? (coin.value / totalValue) * 100 : 0;
      allocationPercentages.push({
        ...coin,
        allocation: allocation
      });
    });

    // Sort by value (descending)
    allocationPercentages.sort((a, b) => b.value - a.value);

    // Calculate additional metrics
    const profit24h = coinValues.reduce((sum, coin) => {
      const previousValue = coin.value / (1 + coin.change24h / 100);
      return sum + (coin.value - previousValue);
    }, 0);

    const profitPercentage = totalValue > 0 ? (profit24h / (totalValue - profit24h)) * 100 : 0;

    return {
      analytics: {
        totalValue,
        profit24h,
        profitPercentage,
        coinsOwned,
        coinValues
      },
      allocationData: allocationPercentages
    };
  }, [holdings, prices, coins]);

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

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  };

  return (
    <div className="analytics-dashboard">
      {/* Portfolio Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card glass-card">
          <div className="card-header">
            <h3>Total Portfolio Value</h3>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          <div className="card-value large">{formatCurrency(analytics.totalValue)}</div>
          <div className="card-footer">
            <span className={analytics.profit24h >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(analytics.profit24h)} ({formatPercentage(analytics.profitPercentage)})
            </span>
            <span>24h</span>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <h3>Coins Owned</h3>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
                <path d="M12 8v8" />
              </svg>
            </div>
          </div>
          <div className="card-value">{analytics.coinsOwned}</div>
          <div className="card-footer">
            <span>Different assets</span>
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <h3>Best Performer</h3>
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
            </div>
          </div>
          <div className="card-value">
            {allocationData.length > 0 ? allocationData[0].symbol.toUpperCase() : '-'}
          </div>
          <div className="card-footer">
            <span className={allocationData.length > 0 && allocationData[0].change24h >= 0 ? 'positive' : 'negative'}>
              {allocationData.length > 0 ? formatPercentage(allocationData[0].change24h) : '-'}
            </span>
            <span>24h change</span>
          </div>
        </div>
      </div>

      {/* Allocation Chart and Top Coins */}
      <div className="analytics-grid">
        {/* Asset Allocation */}
        <div className="allocation-section glass-card">
          <div className="section-header">
            <h3>Asset Allocation</h3>
            <div className="timeframe-selector">
              <button 
                className={timeframe === '7d' ? 'active' : ''}
                onClick={() => setTimeframe('7d')}
              >
                7D
              </button>
              <button 
                className={timeframe === '30d' ? 'active' : ''}
                onClick={() => setTimeframe('30d')}
              >
                30D
              </button>
              <button 
                className={timeframe === '90d' ? 'active' : ''}
                onClick={() => setTimeframe('90d')}
              >
                90D
              </button>
            </div>
          </div>
          
          {allocationData.length > 0 ? (
            <div className="allocation-chart">
              {allocationData.map((coin, index) => (
                <div key={coin.id} className="allocation-item">
                  <div className="allocation-info">
                    <div className="coin-symbol">{coin.symbol.toUpperCase()}</div>
                    <div className="allocation-percentage">{coin.allocation.toFixed(1)}%</div>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill"
                      style={{ 
                        width: `${coin.allocation}%`,
                        backgroundColor: `hsl(${index * 30}, 70%, 60%)`
                      }}
                    ></div>
                  </div>
                  <div className="allocation-value">{formatCurrency(coin.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No holdings to display</p>
            </div>
          )}
        </div>

        {/* Top Coins */}
        <div className="top-coins-section glass-card">
          <div className="section-header">
            <h3>Top Coins</h3>
          </div>
          
          {allocationData.length > 0 ? (
            <div className="coins-list">
              {allocationData.slice(0, 5).map((coin, index) => (
                <div key={coin.id} className="coin-item">
                  <div className="coin-rank">#{index + 1}</div>
                  <div className="coin-info">
                    <div className="coin-name">{coin.name}</div>
                    <div className="coin-amount">
                      {formatNumber(coin.amount)} {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                  <div className="coin-value">
                    <div className="value-amount">{formatCurrency(coin.value)}</div>
                    <div className={`value-change ${coin.change24h >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(coin.change24h)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No holdings to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;