import { debugNetworkError, logApiCall } from './utils/networkDebug';

// API Configuration with environment variable support
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// Log API base URL for debugging
console.log('🔧 API Base URL:', API_BASE_URL);

// Robust response handler with detailed error messages
async function handleFetch(res) {
  const contentType = res.headers.get('content-type') || '';
  let payload = null;
  
  try {
    if (contentType.includes('application/json')) {
      payload = await res.json();
    } else {
      payload = await res.text();
    }
  } catch (e) {
    payload = null;
  }

  if (!res.ok) {
    // Auto-logout on 401
    if (res.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/signin';
    }
    
    const msg = payload?.message || payload || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return payload;
}

// Helper function to get auth headers
function authHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Authentication API
export async function register({ name, email, password }) {
  const url = `${API_BASE_URL}/api/auth/register`;
  try {
    logApiCall('POST', url, { name, email, password: '***' });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await handleFetch(resp);
  } catch (err) {
    debugNetworkError(err, url, 'POST');
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function login({ email, password }) {
  const url = `${API_BASE_URL}/api/auth/login`;
  try {
    logApiCall('POST', url, { email, password: '***' });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleFetch(resp);
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      console.log('✅ Token stored successfully');
    }
    
    return data;
  } catch (err) {
    debugNetworkError(err, url, 'POST');
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function me() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function getExchanges() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/exchanges`, { 
      headers: { ...authHeaders() } 
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function addApiKey({ exchangeId, label, apiKey, apiSecret }) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/apikeys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ exchangeId, label, apiKey, apiSecret }),
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function getApiKeys() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/apikeys`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

// Portfolio API functions
export async function getPortfolioSummary() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/portfolio/summary`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function syncExchange(exchangeId) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/exchanges/${exchangeId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}

export async function getExchangeBalances() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/exchanges/balances`, {
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    return await handleFetch(resp);
  } catch (err) {
    throw new Error(err.message || 'Network error: Could not contact server');
  }
}
// Legacy API object for backward compatibility
export const authAPI = {
  register,
  login,
  me,
  logout: () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/signin';
  }
};

export const exchangesAPI = {
  getAll: getExchanges
};

export const apiKeysAPI = {
  create: addApiKey,
  getAll: getApiKeys
};

export const portfolioAPI = {
  getSummary: getPortfolioSummary,
  syncExchange,
  getBalances: getExchangeBalances
};// Utility functions
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

export const getToken = () => {
  return localStorage.getItem('auth_token');
};