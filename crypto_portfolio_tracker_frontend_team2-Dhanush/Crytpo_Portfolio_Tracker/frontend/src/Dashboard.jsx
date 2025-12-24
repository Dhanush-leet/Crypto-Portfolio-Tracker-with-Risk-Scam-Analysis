import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderMainContent = () => {
    if (activeTab === 'portfolio') {
      return (
        <div className="main-content">
          <h3>Live Chart coming soon (API integration)</h3>
          <div className="placeholder-chart">
            <p>📊 Portfolio chart will be displayed here</p>
          </div>
        </div>
      );
    } else if (activeTab === 'risk') {
      return (
        <div className="main-content">
          <h3>Live Risk Analysis coming soon (API integration)</h3>
          <div className="placeholder-analysis">
            <p>📈 Risk analysis will be displayed here</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Crypto Portfolio Tracker</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      
      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={`nav-button ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
          <button 
            className={`nav-button ${activeTab === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('risk')}
          >
            Risk Analysis
          </button>
        </nav>
        
        <main className="dashboard-main">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
