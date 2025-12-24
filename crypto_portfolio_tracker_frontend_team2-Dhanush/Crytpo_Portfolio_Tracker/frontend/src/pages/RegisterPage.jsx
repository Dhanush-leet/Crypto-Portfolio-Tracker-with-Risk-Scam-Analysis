import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';
import Toast from '../components/Toast';
import '../App.css';
import './RegisterPage.css';

export default function RegisterPage(){
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  function validate(){
    if(!username || !email || !password) return 'Please complete all fields';
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
      await register({ name: username, email, password });
      setToast('Account created — please login');
      setTimeout(()=> navigate('/login'), 900);
    }catch(err){ setToast(err.message || 'Registration failed'); }
    finally{ setLoading(false); }
  }

  return (
    <div className="wrap">
      <div className="container">
        <div>
          <div className="brand">
            <div className="logo">CP</div>
            <div>
              <h1 className="h1">Create your account</h1>
            </div>
          </div>

          <div className="card" style={{marginTop:12}}>
            <h2 style={{marginTop:0}}>Register</h2>
            <p className="small">Enter details to create an account.</p>
            <form onSubmit={onSubmit} style={{marginTop:14}}>
              <div className="form-group">
                <label>Username</label>
                <input className="input" value={username} onChange={e=>setUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Full name</label>
                <input className="input" value={fullname} onChange={e=>setFullname(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                <div className="small">Use 8+ characters with numbers and letters.</div>
              </div>
              <div style={{marginTop:14,display:'flex',gap:10}}>
                <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
                <Link to="/login" className="btn ghost" style={{textDecoration:'none'}}>Back to login</Link>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 style={{marginTop:0}}>Privacy & security</h3>
            <p className="small">We store minimal info — email and profile. Passwords are hashed on the server.</p>
          </div>
        </div>
      </div>
      <Toast message={toast} onClose={()=>setToast(null)} />
    </div>
  );
}
