import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { me, getExchanges, addApiKey, getApiKeys } from '../api';
import { showToast } from '../components/Toast';
import Modal from '../components/Modal';
import ExchangeManager from '../components/ExchangeManager';
// Remove TransactionImporter import since we're replacing it with a simple card
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showExchangesModal, setShowExchangesModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyFormData, setKeyFormData] = useState({
    exchangeId: '',
    label: '',
    apiKey: '',
    apiSecret: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, exchangesResponse, apiKeysResponse] = await Promise.all([
        me(),
        getExchanges().catch(() => []), // Fallback to empty array if endpoint doesn't exist
        getApiKeys().catch(() => []) // Fallback to empty array if endpoint doesn't exist
      ]);
      
      setUser(userResponse);
      setExchanges(exchangesResponse);
      setApiKeys(apiKeysResponse);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/signin';
  };

  const handleConnectExchange = async () => {
    try {
      const exchangesList = await getExchanges();
      setExchanges(exchangesList);
      setShowExchangesModal(true);
    } catch (error) {
      showToast('Failed to load exchanges: ' + error.message, 'error');
    }
  };

  const handleAddApiKey = () => {
    setShowAddKeyModal(true);
    setKeyFormData({
      exchangeId: '',
      label: '',
      apiKey: '',
      apiSecret: ''
    });
  };

  const handleKeyFormChange = (e) => {
    const { name, value } = e.target;
    setKeyFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      loadDashboardData(); // Reload to show new key
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskApiSecret = (secret) => {
    if (!secret || secret.length < 4) return '****';
    return '****' + secret.slice(-4);
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner-large">
          <svg width="40" height="40" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
            <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
          </svg>
        </div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-info">
              <h1 className="dashboard-title">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <p className="dashboard-subtitle">
                Manage your crypto portfolio and exchange connections
              </p>
            </div>
            <div className="header-actions">
              <nav className="dashboard-nav">
                <button 
                  className="nav-link active" 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigate('/portfolio')}
                >
                  Portfolio
                </button>
              </nav>
              <button onClick={handleLogout} className="btn btn-outline">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Next Steps Cards */}
          <section className="next-steps-section">
            <h2 className="section-title">Next Steps</h2>
            <div className="next-steps-grid">
              {/* Connect Exchange Card */}
              <div className="next-step-card glass-card" onClick={handleConnectExchange}>
                <div className="card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    <path d="M12 11h4"/>
                    <path d="M12 16h4"/>
                    <path d="M8 11h.01"/>
                    <path d="M8 16h.01"/>
                  </svg>
                </div>
                <h3>Connect Exchange</h3>
                <p>Link your cryptocurrency exchange accounts to start tracking your portfolio</p>
                <div className="card-action">
                  <span>View Exchanges</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </div>

              {/* Add API Key Card */}
              <div className="next-step-card glass-card" onClick={handleAddApiKey}>
                <div className="card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3>Add API Key</h3>
                <p>Securely store your exchange API keys to enable automated portfolio tracking</p>
                <div className="card-action">
                  <span>Add Key</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </div>

              {/* Import Transactions Card - New Clean Design */}
              <div className="next-step-card glass-card" onClick={() => navigate('/import-transactions')}>
                <div className="card-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <h3>Import Transactions</h3>
                <p>Upload your transaction history from supported exchanges to analyze your portfolio performance</p>
                <div className="card-action">
                  <span>Upload Transactions</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Exchange Manager Section */}
          <section className="exchange-manager-section">
            <ExchangeManager />
          </section>
        </main>
      </div>

      {/* Connect Exchange Modal */}
      <Modal
        isOpen={showExchangesModal}
        onClose={() => setShowExchangesModal(false)}
        title="Available Exchanges"
      >
        <div className="exchanges-list">
          {exchanges.length > 0 ? (
            exchanges.map((exchange) => (
              <div key={exchange.id} className="exchange-item">
                <div className="exchange-info">
                  <h4>{exchange.name}</h4>
                  <p>{exchange.description || 'Cryptocurrency exchange'}</p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowExchangesModal(false);
                    handleAddApiKey();
                  }}
                >
                  Add API Key
                </button>
              </div>
            ))
          ) : (
            <div className="no-exchanges">
              <p>No exchanges available at the moment.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowExchangesModal(false);
                  handleAddApiKey();
                }}
              >
                Add API Key Manually
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Add API Key Modal */}
      <Modal
        isOpen={showAddKeyModal}
        onClose={() => setShowAddKeyModal(false)}
        title="Add API Key"
      >
        <form onSubmit={handleKeyFormSubmit} className="api-key-form">
          <div className="form-group">
            <label htmlFor="exchangeId" className="form-label">
              Exchange
            </label>
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
              {/* Fallback options if no exchanges loaded */}
              {exchanges.length === 0 && (
                <>
                  <option value="1">Binance</option>
                  <option value="2">Coinbase Pro</option>
                  <option value="3">Kraken</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="label" className="form-label">
              Label
            </label>
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
            <label htmlFor="apiKey" className="form-label">
              API Key
            </label>
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
            <label htmlFor="apiSecret" className="form-label">
              API Secret
            </label>
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
      </Modal>
    </div>
  );
};

export default Dashboard;