import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrices, getMarketDataWithSparklines } from '../services/market';
import { startRealTimeUpdates, stopRealTimeUpdates, subscribeToRealTimePrices } from '../services/realtimeMarket';
import { syncExchange } from '../api';
import CoinCard from '../components/CoinCard';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import TransactionHistory from '../components/TransactionHistory';
import Toast from '../components/Toast';
import ExchangeManager from '../components/ExchangeManager';
import './Portfolio.css';

// Initial coin data
const initialCoins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge' }
];

const Portfolio = () => {
  const navigate = useNavigate();
  const [coins] = useState(initialCoins);
  const [prices, setPrices] = useState({});
  const [sparklines, setSparklines] = useState({});
  const [holdings, setHoldings] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [selectedCoin, setSelectedCoin] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [syncingExchanges, setSyncingExchanges] = useState({});
  const [syncTimestamps, setSyncTimestamps] = useState({});

  // Load holdings from localStorage on component mount
  useEffect(() => {
    const loadHoldings = () => {
      try {
        const savedHoldings = localStorage.getItem('crypto_holdings');
        if (savedHoldings) {
          setHoldings(JSON.parse(savedHoldings));
        }
      } catch (error) {
        console.error('Error loading holdings from localStorage:', error);
      }
    };

    loadHoldings();
    fetchData();

    // Set up real-time price updates
    const coinIds = initialCoins.map(coin => coin.id);
    startRealTimeUpdates(coinIds);
    
    const unsubscribeFn = subscribeToRealTimePrices((error, updatedPrices, isFreshData) => {
      if (error) {
        showToast('Failed to update prices. Using cached data.', 'error');
      } else {
        setPrices(updatedPrices);
        if (isFreshData) {
          console.log('Fresh data received from API');
        }
      }
    });

    // Cleanup on unmount
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
      stopRealTimeUpdates();
    };
  }, []);

  // Save holdings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('crypto_holdings', JSON.stringify(holdings));
    } catch (error) {
      console.error('Error saving holdings to localStorage:', error);
    }
  }, [holdings]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch prices
      const priceData = await getPrices(initialCoins.map(coin => coin.id));
      setPrices(priceData);

      // Fetch market data with sparklines
      const marketData = await getMarketDataWithSparklines(initialCoins.map(coin => coin.id));
      
      // Extract sparkline data
      const sparklineData = {};
      marketData.forEach(coin => {
        if (coin.sparkline_in_7d && coin.sparkline_in_7d.price) {
          sparklineData[coin.id] = coin.sparkline_in_7d.price;
        }
      });
      
      setSparklines(sparklineData);
    } catch (error) {
      showToast('Failed to fetch market data. Using cached data.', 'error');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (coinId, amount) => {
    setHoldings(prev => ({
      ...prev,
      [coinId]: amount
    }));
    
    showToast(`${initialCoins.find(c => c.id === coinId)?.name} holding updated`, 'success');
  };

  const handleManualHoldingSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCoin) {
      showToast('Please select a coin', 'error');
      return;
    }
    
    const amount = parseFloat(manualAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    
    setHoldings(prev => ({
      ...prev,
      [selectedCoin]: amount
    }));
    
    // Reset form
    setSelectedCoin('');
    setManualAmount('');
    
    const coinName = initialCoins.find(c => c.id === selectedCoin)?.name || 'Coin';
    const displayAmount = parseFloat(manualAmount);
    showToast(`${displayAmount} ${coinName} added to portfolio!`, 'success');
  };

  const handleCoinChange = (e) => {
    setSelectedCoin(e.target.value);
  };

  const handleAmountInputChange = (e) => {
    setManualAmount(e.target.value);
  };

  const handleSyncExchange = async (exchangeId) => {
    setSyncingExchanges(prev => ({
      ...prev,
      [exchangeId]: true
    }));
    
    try {
      await syncExchange(exchangeId);
      const timestamp = new Date().toISOString();
      setSyncTimestamps(prev => ({
        ...prev,
        [exchangeId]: timestamp
      }));
      showToast('Exchange synced successfully', 'success');
    } catch (error) {
      showToast('Failed to sync exchange: ' + error.message, 'error');
    } finally {
      setSyncingExchanges(prev => ({
        ...prev,
        [exchangeId]: false
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/signin';
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Calculate portfolio summary using useMemo for performance
  const summary = useMemo(() => {
    let totalValue = 0;
    let profit24h = 0;
    let coinsOwned = 0;

    coins.forEach(coin => {
      const amount = holdings[coin.id] || 0;
      const priceData = prices[coin.id];
      
      if (amount > 0 && priceData) {
        const currentValue = amount * priceData.usd;
        const previousValue = amount * (priceData.usd / (1 + priceData.usd_24h_change / 100));
        const profit = currentValue - previousValue;
        
        totalValue += currentValue;
        profit24h += profit;
        coinsOwned++;
      }
    });

    const profitPercentage = totalValue > 0 ? (profit24h / (totalValue - profit24h)) * 100 : 0;

    return {
      totalValue,
      profit24h,
      profitPercentage,
      coinsOwned
    };
  }, [coins, holdings, prices]);

  if (loading) {
    return (
      <div className="portfolio-page">
        <div className="container">
          <h1>Portfolio</h1>
          <div className="loading-skeleton">
            <div className="skeleton-summary"></div>
            <div className="skeleton-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <div className="container">
        {/* Header */}
        <header className="portfolio-header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="portfolio-title">Portfolio</h1>
              <p className="portfolio-subtitle">
                Track your cryptocurrency investments and monitor real-time performance
              </p>
            </div>
            <div className="header-actions">
              <nav className="portfolio-nav">
                <button 
                  className="nav-link" 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className="nav-link active" 
                  onClick={() => navigate('/portfolio')}
                >
                  Portfolio
                </button>
              </nav>
              <button onClick={handleLogout} className="btn btn-outline">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </header>
        
        <AnalyticsDashboard 
          holdings={holdings}
          prices={prices}
          coins={coins}
        />
        
        <div className="portfolio-content">
          <div className="coins-grid">
            {coins.map(coin => (
              <CoinCard
                key={coin.id}
                id={coin.id}
                name={coin.name}
                symbol={coin.symbol}
                price={prices[coin.id]?.usd || 0}
                change24h={prices[coin.id]?.usd_24h_change || 0}
                amount={holdings[coin.id] || 0}
                sparklineData={sparklines[coin.id]}
                onAmountChange={handleAmountChange}
              />
            ))}
          </div>
          
          <div className="sidebar">
            <div className="connected-exchanges glassmorphism">
              <h2>Connected Exchanges</h2>
              <div className="exchange-list">
                <div className="exchange-item">
                  <span>Binance</span>
                  <div className="exchange-sync-info">
                    <button className="sync-button" onClick={() => handleSyncExchange(1)} disabled={syncingExchanges[1]}>
                      {syncingExchanges[1] ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <span className="sync-timestamp">
                      Last synced: {syncTimestamps[1] ? new Date(syncTimestamps[1]).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="exchange-item">
                  <span>Coinbase</span>
                  <div className="exchange-sync-info">
                    <button className="sync-button" onClick={() => handleSyncExchange(2)} disabled={syncingExchanges[2]}>
                      {syncingExchanges[2] ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <span className="sync-timestamp">
                      Last synced: {syncTimestamps[2] ? new Date(syncTimestamps[2]).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="exchange-item">
                  <span>Kraken</span>
                  <div className="exchange-sync-info">
                    <button className="sync-button" onClick={() => handleSyncExchange(3)} disabled={syncingExchanges[3]}>
                      {syncingExchanges[3] ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <span className="sync-timestamp">
                      Last synced: {syncTimestamps[3] ? new Date(syncTimestamps[3]).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
              <button className="connect-button">Connect Exchange</button>
            </div>
            
            <div className="manual-holding glassmorphism">
              <h2>Add Manual Holding</h2>
              <form className="manual-holding-form" onSubmit={handleManualHoldingSubmit}>
                <div className="form-group">
                  <label htmlFor="coin-select">Coin</label>
                  <select 
                    id="coin-select" 
                    className="form-control"
                    value={selectedCoin}
                    onChange={handleCoinChange}
                  >
                    <option value="">Select a coin</option>
                    {coins.map(coin => (
                      <option key={coin.id} value={coin.id}>
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="amount-input">Amount</label>
                  <input 
                    type="number" 
                    id="amount-input" 
                    className="form-control" 
                    placeholder="0.00"
                    step="any"
                    value={manualAmount}
                    onChange={handleAmountInputChange}
                  />
                </div>
                
                <button type="submit" className="add-holding-button">
                  Add Holding
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <TransactionHistory />
      
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

export default Portfolio;