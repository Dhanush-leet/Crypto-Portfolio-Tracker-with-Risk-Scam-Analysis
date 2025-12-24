import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import Toast from '../components/Toast';
import '../App.css';
import './LoginPage.css';

export default function LoginPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  function validate(){
    if(!email || !password) return 'Please enter email & password';
    const re = /^\S+@\S+\.\S+$/;
    if(!re.test(email)) return 'Enter a valid email';
    if(password.length < 8) return 'Password must be at least 8 characters';
    return null;
  }

  async function onSubmit(e){
    e?.preventDefault();
    const err = validate();
    if(err){ setToast(err); return; }
    setLoading(true);
    try{
      const res = await login({ email, password });
      // expected { token, user }
      localStorage.setItem('auth_token', res.token);
      setToast('Login successful');
      setTimeout(()=> navigate('/dashboard'), 700);
    }catch(err){
      setToast(err.message || 'Login failed');
    }finally{ setLoading(false); }
  }

  function onDemo(){ setEmail('demo@example.com'); setPassword('demopass'); setToast('Demo credentials filled'); }

  return (
    <div className="wrap">
      <div className="container">
        <div>
          <div className="brand">
            <div className="logo">CP</div>
            <div>
              <h1 className="h1">Crypto Portfolio Tracker</h1>
              <div className="lead">Secure, simple, and beautiful — sign in to continue.</div>
            </div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h2 style={{marginTop:0}}>Welcome back</h2>
            <p className="small">Sign in to continue to your dashboard.</p>
            <form onSubmit={onSubmit} style={{marginTop:14}}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} type="email" />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} type="password" />
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <Link to="/register" className="link">Create account</Link>
                <a className="link" href="#">Forgot?</a>
              </div>

              <div style={{marginTop:14,display:'flex',gap:10}}>
                <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
                <button type="button" className="btn ghost" onClick={onDemo}>Demo</button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 style={{marginTop:0}}>Why you'll love it</h3>
            <ul style={{marginTop:12,color:'var(--muted)'}}>
              <li>Fast portfolio syncing</li>
              <li>Clear performance charts</li>
              <li>Transaction-level audit</li>
            </ul>
          </div>
        </div>
      </div>

      <Toast message={toast} onClose={()=>setToast(null)} />
    </div>
  );
}
