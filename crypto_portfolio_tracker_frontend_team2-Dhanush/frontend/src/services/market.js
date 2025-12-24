// Cache for market data with TTL
const marketCache = {
  data: null,
  timestamp: null,
  ttl: 30000 // 30 seconds
};

// Rate limiting state
let rateLimitBackoff = 0;
let isRateLimited = false;

/**
 * Fetches prices from CoinGecko API for given coin IDs
 * @param {string[]} idsArray - Array of coin IDs (e.g., ['bitcoin', 'ethereum'])
 * @returns {Promise<Object>} Object with coin data { id: { usd, usd_24h_change } }
 */
export async function getPrices(idsArray) {
  // Check if we're in rate limit backoff period
  if (isRateLimited && Date.now() < rateLimitBackoff) {
    throw new Error('Rate limited. Please wait before retrying.');
  }

  // Check cache first
  const now = Date.now();
  if (marketCache.data && marketCache.timestamp && (now - marketCache.timestamp) < marketCache.ttl) {
    return marketCache.data;
  }

  try {
    const ids = idsArray.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Update cache
    marketCache.data = data;
    marketCache.timestamp = now;
    
    // Reset rate limit state on successful request
    isRateLimited = false;
    rateLimitBackoff = 0;

    return data;
  } catch (error) {
    // Handle rate limiting (HTTP 429)
    if (error.message.includes('429')) {
      isRateLimited = true;
      rateLimitBackoff = Date.now() + 60000; // Backoff for 1 minute
      throw new Error('Rate limit exceeded. Backing off for 1 minute.');
    }
    
    // Return cached data if available, otherwise rethrow error
    if (marketCache.data) {
      console.warn('Using cached data due to API error:', error.message);
      return marketCache.data;
    }
    
    throw error;
  }
}

/**
 * Subscribe to price updates with polling
 * @param {string[]} idsArray - Array of coin IDs
 * @param {Function} callback - Function to call with updated prices
 * @returns {Function} Unsubscribe function
 */
export function subscribePrices(idsArray, callback) {
  let isSubscribed = true;
  
  const poll = async () => {
    if (!isSubscribed) return;
    
    try {
      const prices = await getPrices(idsArray);
      callback(null, prices);
    } catch (error) {
      callback(error, null);
    }
    
    // Schedule next poll
    setTimeout(poll, 30000); // Poll every 30 seconds
  };
  
  // Start polling
  poll();
  
  // Return unsubscribe function
  return () => {
    isSubscribed = false;
  };
}

/**
 * Fetches market data with sparklines
 * @param {string[]} idsArray - Array of coin IDs
 * @returns {Promise<Object>} Market data with sparklines
 */
export async function getMarketDataWithSparklines(idsArray) {
  try {
    const ids = idsArray.join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`,
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
    console.error('Error fetching market data with sparklines:', error);
    throw error;
  }
}