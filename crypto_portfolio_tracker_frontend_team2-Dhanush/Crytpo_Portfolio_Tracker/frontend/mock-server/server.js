const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.MOCK_JWT_SECRET || 'dev_secret_please_change';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(bodyParser.json());

// In-memory store
let users = [];
let exchanges = [];
let apikeys = [];
let nextUserId = 1;
let nextApikeyId = 1;

// Seed demo user and exchanges
function seed(){
  const demoEmail = 'demo@example.com';
  if(!users.find(u=>u.email===demoEmail)){
    users.push({ id: nextUserId++, name: 'Demo User', fullname: 'Demo User', email: demoEmail, password: bcrypt.hashSync('demopass', 8) });
  }
  if(exchanges.length === 0){
    exchanges.push({ id: 1, name: 'Binance' });
    exchanges.push({ id: 2, name: 'Coinbase' });
  }
}
seed();

function generateToken(user){
  return jwt.sign({ sub: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next){
  const h = req.headers['authorization'];
  if(!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });
  const token = h.substring(7);
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find(u=>u.email === payload.sub);
    if(!user) return res.status(401).json({ message: 'Invalid token user' });
    req.user = { id: user.id, email: user.email, name: user.name, fullname: user.fullname };
    next();
  }catch(err){ return res.status(401).json({ message: 'Invalid token' }); }
}

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if(users.find(u=>u.email === email)) return res.status(400).json({ message: 'Email already taken' });
  const u = { id: nextUserId++, name: name || '', fullname: name || '', email, password: bcrypt.hashSync(password, 8) };
  users.push(u);
  const out = { id: u.id, name: u.name, fullname: u.fullname, email: u.email };
  return res.status(201).json({ user: out });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(u=>u.email === email);
  if(!user) return res.status(401).json({ message: 'Invalid credentials' });
  if(!bcrypt.compareSync(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken(user);
  const out = { id: user.id, name: user.name, fullname: user.fullname, email: user.email };
  return res.json({ token, user: out });
});

// Me
app.get('/api/auth/me', authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

// Exchanges
app.get('/api/exchanges', (req, res) => {
  return res.json(exchanges);
});

// Create API key
app.post('/api/apikeys', authMiddleware, (req, res) => {
  const { exchangeId, label, apiKey, apiSecret } = req.body || {};
  if(!exchangeId || !apiKey || !apiSecret) return res.status(400).json({ message: 'Missing fields' });
  const ex = exchanges.find(e => e.id === Number(exchangeId));
  if(!ex) return res.status(400).json({ message: 'Exchange not found' });
  const rec = { id: nextApikeyId++, userId: req.user.id, exchangeId: ex.id, apiKey, apiSecretEncrypted: Buffer.from(apiSecret).toString('base64'), label, createdAt: new Date().toISOString() };
  apikeys.push(rec);
  // Return safe info
  return res.status(201).json({ id: rec.id, exchangeId: rec.exchangeId, label: rec.label });
});

// List API keys for user
app.get('/api/apikeys', authMiddleware, (req, res) => {
  const items = apikeys.filter(a=>a.userId === req.user.id).map(a=>({ id: a.id, exchangeId: a.exchangeId, label: a.label, apiKey: a.apiKey, apiSecretMasked: '****' + Buffer.from(a.apiSecretEncrypted, 'base64').toString('utf8').slice(-4) }));
  return res.json(items);
});

app.listen(PORT, ()=> console.log(`Mock API server listening on http://localhost:${PORT}`));
