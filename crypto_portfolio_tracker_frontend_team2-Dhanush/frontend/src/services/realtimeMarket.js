// Enhanced real-time market service with more frequent updates
const marketState = {
  data: null,
  timestamp: null,
  subscribers: [],
  updateInterval: null,
  fastInterval: null
};

// Fast update interval (every 5 seconds for real-time feel)
const FAST_UPDATE_INTERVAL = 5000;
// Regular update interval (every 30 seconds for fresh data)
const REGULAR_UPDATE_INTERVAL = 30000;

/**
 * Simulate real-time price movements
 * @param {Object} currentPrices - Current price data
 * @returns {Object} Updated price data with small fluctuations
 */
function simulateRealTimeUpdates(currentPrices) {
  if (!currentPrices) return currentPrices;
  
  const updatedPrices = { ...currentPrices };
  
  Object.keys(updatedPrices).forEach(coinId => {
    const coinData = updatedPrices[coinId];
    if (coinData && coinData.usd) {
      // Apply small random fluctuations (-0.5% to +0.5%)
      const fluctuation = (Math.random() - 0.5) * 0.01;
      const newPrice = coinData.usd * (1 + fluctuation);
      
      // Also update 24h change slightly
      if (coinData.usd_24h_change !== undefined) {
        const changeFluctuation = (Math.random() - 0.5) * 0.1;
        coinData.usd_24h_change += changeFluctuation;
      }
      
      coinData.usd = newPrice;
    }
  });
  
  return updatedPrices;
}

/**
 * Fetch fresh prices from API
 * @param {string[]} idsArray - Array of coin IDs
 * @returns {Promise<Object>} Fresh price data
 */
async function fetchFreshPrices(idsArray) {
  try {
    const ids = idsArray.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_volume=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching fresh prices:', error);
    throw error;
  }
}

/**
 * Notify all subscribers of price updates
 * @param {Object} prices - Updated price data
 * @param {boolean} isFreshData - Whether this is fresh data from API or simulated
 */
function notifySubscribers(prices, isFreshData = false) {
  marketState.subscribers.forEach(callback => {
    try {
      callback(null, prices, isFreshData);
    } catch (error) {
      console.error('Error notifying subscriber:', error);
    }
  });
}

/**
 * Start real-time price updates
 * @param {string[]} idsArray - Array of coin IDs
 */
export function startRealTimeUpdates(idsArray) {
  // Clear existing intervals
  if (marketState.updateInterval) {
    clearInterval(marketState.updateInterval);
  }
  if (marketState.fastInterval) {
    clearInterval(marketState.fastInterval);
  }
  
  // Fetch initial data
  fetchFreshPrices(idsArray)
    .then(data => {
      marketState.data = data;
      marketState.timestamp = Date.now();
      notifySubscribers(data, true);
    })
    .catch(error => {
      console.error('Error fetching initial prices:', error);
      marketState.subscribers.forEach(callback => {
        callback(error, null, true);
      });
    });
  
  // Set up fast updates (simulated real-time)
  marketState.fastInterval = setInterval(() => {
    if (marketState.data) {
      const simulatedData = simulateRealTimeUpdates({...marketState.data});
      notifySubscribers(simulatedData, false);
    }
  }, FAST_UPDATE_INTERVAL);
  
  // Set up regular updates (fresh data from API)
  marketState.updateInterval = setInterval(async () => {
    try {
      const freshData = await fetchFreshPrices(idsArray);
      marketState.data = freshData;
      marketState.timestamp = Date.now();
      notifySubscribers(freshData, true);
    } catch (error) {
      console.error('Error in regular update:', error);
      marketState.subscribers.forEach(callback => {
        callback(error, null, true);
      });
    }
  }, REGULAR_UPDATE_INTERVAL);
}

/**
 * Stop real-time price updates
 */
export function stopRealTimeUpdates() {
  if (marketState.updateInterval) {
    clearInterval(marketState.updateInterval);
    marketState.updateInterval = null;
  }
  if (marketState.fastInterval) {
    clearInterval(marketState.fastInterval);
    marketState.fastInterval = null;
  }
  marketState.subscribers = [];
  marketState.data = null;
}

/**
 * Subscribe to real-time price updates
 * @param {Function} callback - Function to call with updated prices
 * @returns {Function} Unsubscribe function
 */
export function subscribeToRealTimePrices(callback) {
  marketState.subscribers.push(callback);
  
  // Send current data immediately if available
  if (marketState.data) {
    callback(null, marketState.data, true);
  }
  
  // Return unsubscribe function
  return () => {
    const index = marketState.subscribers.indexOf(callback);
    if (index > -1) {
      marketState.subscribers.splice(index, 1);
    }
  };
}

/**
 * Get current market data
 * @returns {Object|null} Current market data or null if not available
 */
export function getCurrentMarketData() {
  return marketState.data;
}

/**
 * Check if real-time updates are active
 * @returns {boolean} Whether real-time updates are active
 */
export function isRealTimeActive() {
  return !!marketState.updateInterval || !!marketState.fastInterval;
}

export default {
  startRealTimeUpdates,
  stopRealTimeUpdates,
  subscribeToRealTimePrices,
  getCurrentMarketData,
  isRealTimeActive
};