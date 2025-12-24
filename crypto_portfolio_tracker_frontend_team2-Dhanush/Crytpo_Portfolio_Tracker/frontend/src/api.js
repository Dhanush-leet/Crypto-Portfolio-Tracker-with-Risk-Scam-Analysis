// Centralized API helper
// Change API_BASE_URL if your backend runs on a different origin/port.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function onUnauthorized() {
  localStorage.removeItem('auth_token');
  try { window.location.href = '/login'; } catch(e){}
}

async function request(path, opts = {}, requireAuth = false) {
  const headers = opts.headers || {};
  headers['Content-Type'] = 'application/json';
  if (requireAuth) {
    const token = localStorage.getItem('auth_token');
    if (!token) { onUnauthorized(); throw new Error('Not authenticated'); }
    headers['Authorization'] = 'Bearer ' + token;
  }
  const res = await fetch(API_BASE_URL + path, { ...opts, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = { message: text }; }
  if (!res.ok) {
    if (res.status === 401) { onUnauthorized(); }
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function register({ name, email, password }) {
  return await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export async function login({ email, password }) {
  return await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function me() {
  return await request('/api/auth/me', { method: 'GET' }, true);
}

export async function getExchanges() {
  return await request('/api/exchanges', { method: 'GET' });
}

export async function createApiKey({ exchangeId, label, apiKey, apiSecret }) {
  return await request('/api/apikeys', { method: 'POST', body: JSON.stringify({ exchangeId, label, apiKey, apiSecret }) }, true);
}

// Export generic request for advanced needs
export { request };
