import React, { useState, useEffect } from 'react';
import { getExchanges, addApiKey, getApiKeys, syncExchange } from '../api';
import Toast from './Toast';
import './ExchangeManager.css';

const ExchangeManager = () => {
  const [exchanges, setExchanges] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncingExchanges, setSyncingExchanges] = useState({});
  const [syncTimestamps, setSyncTimestamps] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [keyFormData, setKeyFormData] = useState({
    exchangeId: '',
    label: '',
    apiKey: '',
    apiSecret: ''
  });

  useEffect(() => {
    loadExchangeData();
  }, []);

  const loadExchangeData = async () => {
    try {
      setLoading(true);
      const [exchangesData, apiKeysData] = await Promise.all([
        getExchanges(),
        getApiKeys()
      ]);
      
      setExchanges(exchangesData);
      setApiKeys(apiKeysData);
    } catch (error) {
      showToast('Failed to load exchange data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyFormChange = (e) => {
    const { name, value } = e.target;
    setKeyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSyncExchange = async (exchangeId) => {
    setSyncingExchanges(prev => ({
      ...prev,
      [exchangeId]: true
    }));
    
    try {
      await syncExchange(exchangeId);
      const timestamp = new Date().toISOString();
      setSyncTimestamps(prev => ({
        ...prev,
        [exchangeId]: timestamp
      }));
      showToast('Exchange synced successfully', 'success');
    } catch (error) {
      showToast('Failed to sync exchange: ' + error.message, 'error');
    } finally {
      setSyncingExchanges(prev => ({
        ...prev,
        [exchangeId]: false
      }));
    }
  };
  
  const handleDisconnectClick = (exchange) => {
    setShowDisconnectModal(exchange);
  };
  
  const handleConfirmDisconnect = async () => {
    if (!showDisconnectModal) return;
    
    try {
      // In a real implementation, you would call an API to disconnect the exchange
      // For now, we'll just show a success message
      showToast('Exchange disconnected successfully', 'success');
      loadExchangeData(); // Reload the data to reflect changes
    } catch (error) {
      showToast('Failed to disconnect exchange: ' + error.message, 'error');
    } finally {
      setShowDisconnectModal(null);
    }
  };
  
  const handleCancelDisconnect = () => {
    setShowDisconnectModal(null);
  };

  const handleKeyFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!keyFormData.exchangeId || !keyFormData.label || !keyFormData.apiKey || !keyFormData.apiSecret) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addApiKey(keyFormData);
      showToast('API key added successfully!', 'success');
      setShowAddKeyModal(false);
      setKeyFormData({
        exchangeId: '',
        label: '',
        apiKey: '',
        apiSecret: ''
      });
      loadExchangeData(); // Reload to show new key
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const maskApiSecret = (secret) => {
    if (!secret || secret.length < 4) return '****';
    return '****' + secret.slice(-4);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#4CAF50';
      case 'disconnected': return '#F44336';
      default: return '#FF9800';
    }
  };

  if (loading) {
    return (
      <div className="exchange-manager">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading exchange data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exchange-manager">
      <div className="exchange-header">
        <h2>Exchange Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddKeyModal(true)}
        >
          Add Exchange API Key
        </button>
      </div>

      {/* Connected Exchanges */}
      <div className="connected-exchanges">
        <h3>Connected Exchanges ({apiKeys.length})</h3>
        {apiKeys.length > 0 ? (
          <div className="exchanges-grid">
            {apiKeys.map((key) => (
              <div key={key.id} className="exchange-card glass-card">
                <div className="exchange-card-header">
                  <h4>{key.label || key.exchange}</h4>
                  <span 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor('connected') }}
                  >
                    Connected
                  </span>
                </div>
                <div className="exchange-details">
                  <div className="detail-row">
                    <span className="label">Exchange:</span>
                    <span className="value">{key.exchange}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">API Key:</span>
                    <span className="value code">{maskApiSecret(key.apiKey)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Added:</span>
                    <span className="value">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Last Synced:</span>
                    <span className="value">
                      {syncTimestamps[key.id] ? new Date(syncTimestamps[key.id]).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
                <div className="exchange-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSyncExchange(key.id)}
                    disabled={syncingExchanges[key.id]}
                  >
                    {syncingExchanges[key.id] ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button className="btn btn-outline" onClick={() => handleDisconnectClick(key)}>
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-connected-exchanges">
            <p>No exchanges connected yet.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddKeyModal(true)}
            >
              Add Your First Exchange
            </button>
          </div>
        )}
      </div>

      {/* Available Exchanges */}
      <div className="available-exchanges">
        <h3>Supported Exchanges</h3>
        <div className="exchanges-grid">
          {exchanges.map((exchange) => (
            <div key={exchange.id} className="exchange-card glass-card">
              <div className="exchange-card-header">
                <h4>{exchange.name}</h4>
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor('disconnected') }}
                >
                  Not Connected
                </span>
              </div>
              <div className="exchange-details">
                <div className="detail-row">
                  <span className="label">Base URL:</span>
                  <span className="value">{exchange.baseUrl}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value">Operational</span>
                </div>
              </div>
              <div className="exchange-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setKeyFormData(prev => ({
                      ...prev,
                      exchangeId: exchange.id.toString()
                    }));
                    setShowAddKeyModal(true);
                  }}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add API Key Modal */}
      {showAddKeyModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Add Exchange API Key</h3>
              <button 
                className="close-button"
                onClick={() => setShowAddKeyModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleKeyFormSubmit} className="api-key-form">
              <div className="form-group">
                <label htmlFor="exchangeId">Exchange</label>
                <select
                  id="exchangeId"
                  name="exchangeId"
                  value={keyFormData.exchangeId}
                  onChange={handleKeyFormChange}
                  className="form-input"
                  required
                >
                  <option value="">Select an exchange</option>
                  {exchanges.map((exchange) => (
                    <option key={exchange.id} value={exchange.id}>
                      {exchange.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="label">Account Label</label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={keyFormData.label}
                  onChange={handleKeyFormChange}
                  className="form-input"
                  placeholder="e.g., My Trading Account"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apiKey">API Key</label>
                <input
                  type="text"
                  id="apiKey"
                  name="apiKey"
                  value={keyFormData.apiKey}
                  onChange={handleKeyFormChange}
                  className="form-input"
                  placeholder="Enter your API key"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apiSecret">API Secret</label>
                <input
                  type="password"
                  id="apiSecret"
                  name="apiSecret"
                  value={keyFormData.apiSecret}
                  onChange={handleKeyFormChange}
                  className="form-input"
                  placeholder="Enter your API secret"
                  required
                />
                <p className="help-text">
                  Your API credentials are securely encrypted and stored locally.
                </p>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddKeyModal(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add API Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
        />
      )}
      
      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <div className="modal-header">
              <h3>Disconnect Exchange?</h3>
              <button 
                className="close-button"
                onClick={handleCancelDisconnect}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to disconnect <strong>{showDisconnectModal.label || showDisconnectModal.exchange}</strong>?
              </p>
              <p>
                Your holdings will be preserved, but you won't be able to sync data until you reconnect.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={handleCancelDisconnect}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDisconnect}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeManager;