import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { me, getExchanges, createApiKey } from '../api';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import '../App.css';
import './Dashboard.css';

function maskSecret(s){ if(!s) return ''; const keep = 4; return '****' + s.slice(-keep); }

export default function Dashboard(){
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [apikeys, setApikeys] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{ load(); loadExchanges(); }, []);

  async function load(){
    try{
      const data = await me();
      setUser(data.user);
    }catch(err){ setToast(err.message || 'Session expired'); }
  }

  async function loadExchanges(){
    try{
      const data = await getExchanges();
      setExchanges(data || []);
    }catch(err){ setToast(err.message || 'Failed to load exchanges'); }
  }

  function onSignOut(){ localStorage.removeItem('auth_token'); navigate('/login'); }

  async function onAddApiKey(form){
    setAdding(true);
    try{
      const res = await createApiKey(form);
      // push to local list - mask secret
      setApikeys(prev => [{ id: (res?.id || Date.now()), exchangeName: exchanges.find(e=>e.id===form.exchangeId)?.name || 'Exchange', label: form.label, apiKey: form.apiKey, apiSecretMasked: maskSecret(form.apiSecret) }, ...prev]);
      setToast('API Key saved');
      setShowModal(false);
    }catch(err){ setToast(err.message || 'Failed to save API key'); }
    finally{ setAdding(false); }
  }

  return (
    <div style={{padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',maxWidth:1100,margin:'0 auto 18px'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div className="logo">CP</div>
          <div>
            <div style={{fontWeight:700,fontSize:18}}>Your Dashboard</div>
            <div className="small">High-level summary & next steps</div>
          </div>
        </div>
        <div>
          <button className="btn ghost" onClick={onSignOut}>Sign out</button>
        </div>
      </div>

      <div className="card" style={{maxWidth:1100,margin:'0 auto'}}>
        <h2 style={{marginTop:0}}>Welcome</h2>
        <p className="small" id="welcomeText">{user ? `Hello, ${user.fullname || user.name || user.username}` : 'Loading user details…'}</p>

        <div style={{display:'flex',flexWrap:'wrap',gap:18,marginTop:18}}>
          <div style={{flex:1,minWidth:240}}>
            <div className="card" style={{padding:16}}>
              <h4 style={{marginTop:0}}>Portfolio Value</h4>
              <div style={{fontSize:20,fontWeight:700}}>—</div>
              <div className="small">Sync exchanges and wallets to see value.</div>
            </div>
          </div>

          <div style={{flex:1,minWidth:240}}>
            <div className="card" style={{padding:16}}>
              <h4 style={{marginTop:0}}>Next steps</h4>
              <ol style={{color:'var(--muted)'}}>
                <li>Connect exchange</li>
                <li>Add API key</li>
                <li>Import transactions</li>
              </ol>
              <div style={{marginTop:12}}>
                <button className="btn" onClick={()=>setShowModal(true)}>Add API key</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{marginTop:18}}>
          <h3 style={{marginTop:0}}>API Keys</h3>
          {apikeys.length === 0 ? <div className="small">No API keys saved yet.</div> : (
            <ul>
              {apikeys.map(k=> (
                <li key={k.id} style={{marginBottom:8}} className="small">{k.exchangeName} — <strong>{k.label}</strong> — <code>{k.apiKey}</code> — <span>{k.apiSecretMasked}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Modal open={showModal} title="Add API Key" onClose={()=>setShowModal(false)}>
        <AddApiKeyForm exchanges={exchanges} onCancel={()=>setShowModal(false)} onSave={onAddApiKey} loading={adding} />
      </Modal>

      <Toast message={toast} onClose={()=>setToast(null)} />
    </div>
  );
}

function AddApiKeyForm({ exchanges, onCancel, onSave, loading }){
  const [exchangeId, setExchangeId] = useState(exchanges?.[0]?.id || '');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  useEffect(()=>{
    if(!exchangeId && exchanges?.length) setExchangeId(exchanges[0].id);
  }, [exchanges]);

  function validate(){ if(!exchangeId) return 'Choose an exchange'; if(!label) return 'Label required'; if(!apiKey) return 'API key required'; if(!apiSecret) return 'API secret required'; return null; }

  async function submit(e){ e?.preventDefault(); const v = validate(); if(v){ alert(v); return; } onSave({ exchangeId: Number(exchangeId), label, apiKey, apiSecret }); }

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Exchange</label>
        <select className="input" value={exchangeId} onChange={e=>setExchangeId(e.target.value)}>
          <option value="">Choose exchange</option>
          {exchanges.map(x=> <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Label</label>
        <input className="input" value={label} onChange={e=>setLabel(e.target.value)} />
      </div>
      <div className="form-group">
        <label>API Key</label>
        <input className="input" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
      </div>
      <div className="form-group">
        <label>API Secret</label>
        <input className="input" value={apiSecret} onChange={e=>setApiSecret(e.target.value)} />
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  );
}
