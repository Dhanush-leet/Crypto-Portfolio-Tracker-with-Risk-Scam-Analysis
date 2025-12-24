const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 8080;
const JWT_SECRET = 'mock-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Mock data
const users = [
  { id: 1, name: 'Demo User', email: 'demo@example.com', password: 'demopass' }
];

const exchanges = [
  { id: 1, name: 'Binance', baseUrl: 'https://api.binance.com' },
  { id: 2, name: 'Coinbase', baseUrl: 'https://api.exchange.coinbase.com' },
  { id: 3, name: 'Kraken', baseUrl: 'https://api.kraken.com' }
];

const apiKeys = [];

// Helper function to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header required' });
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = users.find(u => u.email === decoded.email);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already taken' });
  }
  
  const user = { id: users.length + 1, name, email, password };
  users.push(user);
  
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, email: req.user.email });
});

app.get('/api/exchanges', (req, res) => {
  res.json(exchanges);
});

app.post('/api/apikeys', verifyToken, (req, res) => {
  const { exchangeId, label, apiKey, apiSecret } = req.body;
  
  if (!exchangeId || !apiKey || !apiSecret) {
    return res.status(400).json({ message: 'exchangeId, apiKey, and apiSecret are required' });
  }
  
  const exchange = exchanges.find(e => e.id === parseInt(exchangeId));
  if (!exchange) {
    return res.status(400).json({ message: 'Exchange not found' });
  }
  
  const newApiKey = {
    id: apiKeys.length + 1,
    userId: req.user.id,
    exchangeId: parseInt(exchangeId),
    label: label || 'API Key',
    apiKey,
    createdAt: new Date().toISOString()
  };
  
  apiKeys.push(newApiKey);
  
  res.json({ message: 'API key saved successfully', id: newApiKey.id });
});

app.get('/api/apikeys', verifyToken, (req, res) => {
  const userApiKeys = apiKeys
    .filter(key => key.userId === req.user.id)
    .map(key => ({
      id: key.id,
      apiKey: key.apiKey,
      label: key.label,
      exchange: exchanges.find(e => e.id === key.exchangeId)?.name || 'Unknown',
      createdAt: key.createdAt
    }));
  
  res.json(userApiKeys);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock backend is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Demo credentials: demo@example.com / demopass`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/exchanges`);
  console.log(`   POST /api/apikeys`);
  console.log(`   GET  /api/apikeys`);
});