import React, { useState, useEffect } from 'react';
import { portfolioAPI, exchangesAPI } from '../api';
import { getPrices, getMarketDataWithSparklines, subscribePrices } from '../services/market';
import CoinCard from '../components/CoinCard';
import PortfolioSummary from '../components/PortfolioSummary';
import Toast from '../components/Toast';
import './Portfolio.css';

// Initial coin data
const initialCoins = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth' },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'doge' }
];

const PortfolioEnhanced = () => {
  const [coins, setCoins] = useState(initialCoins);
  const [prices, setPrices] = useState({});
  const [sparklines, setSparklines] = useState({});
  const [holdings, setHoldings] = useState({});
  const [portfolioData, setPortfolioData] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [unsubscribe, setUnsubscribe] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
    
    // Set up price polling
    const unsubscribeFn = subscribePrices(
      initialCoins.map(coin => coin.id),
      (error, updatedPrices) => {
        if (error) {
          showToast('Failed to update prices. Using cached data.', 'error');
        } else {
          setPrices(updatedPrices);
        }
      }
    );
    
    setUnsubscribe(() => unsubscribeFn);

    // Cleanup on unmount
    return () => {
      if (unsubscribeFn) {
        unsubscribeFn();
      }
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

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to fetch portfolio data from backend
      const portfolioSummary = await portfolioAPI.getSummary();
      setPortfolioData(portfolioSummary);
      
      // Fetch exchanges
      const exchangeData = await exchangesAPI.getAll();
      setExchanges(exchangeData);
      
      // Fetch market data for fallback UI
      await fetchMarketData();
    } catch (error) {
      console.warn('Could not load portfolio data from backend, using fallback:', error.message);
      // Fallback to CoinGecko data
      await fetchMarketData();
      loadHoldingsFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
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
      console.error('Error fetching market data:', error);
    }
  };

  const loadHoldingsFromLocalStorage = () => {
    try {
      const savedHoldings = localStorage.getItem('crypto_holdings');
      if (savedHoldings) {
        setHoldings(JSON.parse(savedHoldings));
      }
    } catch (error) {
      console.error('Error loading holdings from localStorage:', error);
    }
  };

  const handleAmountChange = (coinId, amount) => {
    setHoldings(prev => ({
      ...prev,
      [coinId]: amount
    }));
    
    showToast(`${initialCoins.find(c => c.id === coinId)?.name} holding updated`, 'success');
  };

  const handleSync = async (exchangeId) => {
    if (syncing) return;
    
    setSyncing(true);
    try {
      showToast('Syncing exchange data...', 'info');
      await portfolioAPI.syncExchange(exchangeId);
      showToast('Exchange sync completed!', 'success');
      
      // Reload portfolio data after sync
      const portfolioSummary = await portfolioAPI.getSummary();
      setPortfolioData(portfolioSummary);
    } catch (error) {
      showToast(`Sync failed: ${error.message}`, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Calculate portfolio summary from CoinGecko data (fallback)
  const calculateLocalSummary = () => {
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
  };

  // Use backend data if available, otherwise fallback to local calculation
  const summary = portfolioData || calculateLocalSummary();

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
        <h1>Portfolio</h1>
        
        <PortfolioSummary 
          totalValue={summary.totalUsd || summary.totalValue}
          profit24h={summary.change24hUsd || summary.profit24h}
          profitPercentage={summary.change24hPct || summary.profitPercentage}
          coinsOwned={summary.coinsOwned}
        />
        
        <div className="portfolio-content">
          <div className="coins-grid">
            {portfolioData ? (
              // Render coins from backend data
              portfolioData.coins.map(coin => (
                <CoinCard
                  key={coin.id}
                  id={coin.id}
                  name={coin.name || coin.id.charAt(0).toUpperCase() + coin.id.slice(1)}
                  symbol={coin.symbol}
                  price={coin.priceUsd}
                  change24h={coin.change24hPct}
                  amount={coin.amount}
                  // Sparkline data would need to be fetched separately
                  onAmountChange={handleAmountChange}
                />
              ))
            ) : (
              // Render coins from local data
              coins.map(coin => (
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
              ))
            )}
          </div>
          
          <div className="sidebar">
            <div className="connected-exchanges glassmorphism">
              <h2>Connected Exchanges</h2>
              <div className="exchange-list">
                {exchanges.length > 0 ? (
                  exchanges.map(exchange => (
                    <div key={exchange.id} className="exchange-item">
                      <span>{exchange.name}</span>
                      <button 
                        className="sync-button"
                        onClick={() => handleSync(exchange.id)}
                        disabled={syncing}
                      >
                        {syncing ? 'Syncing...' : 'Sync Now'}
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="exchange-item">
                      <span>Binance</span>
                      <span className="status disconnected">Disconnected</span>
                    </div>
                    <div className="exchange-item">
                      <span>Coinbase</span>
                      <span className="status disconnected">Disconnected</span>
                    </div>
                    <div className="exchange-item">
                      <span>Kraken</span>
                      <span className="status disconnected">Disconnected</span>
                    </div>
                  </>
                )}
              </div>
              <button className="connect-button">Connect Exchange</button>
            </div>
            
            <div className="manual-holding glassmorphism">
              <h2>Add Manual Holding</h2>
              <form className="manual-holding-form">
                <div className="form-group">
                  <label htmlFor="coin-select">Coin</label>
                  <select id="coin-select" className="form-control">
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
                  />
                </div>
                
                <button type="button" className="add-holding-button">
                  Add Holding
                </button>
              </form>
            </div>
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
};

export default PortfolioEnhanced;