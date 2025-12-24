import React, { useState, useEffect } from 'react';
import { showToast } from './Toast';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    coin: '',
    type: '',
    exchange: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredTransactions = transactions.filter(tx => {
    return (
      (filter.coin === '' || tx.coin.toLowerCase().includes(filter.coin.toLowerCase())) &&
      (filter.type === '' || tx.type.toLowerCase() === filter.type.toLowerCase()) &&
      (filter.exchange === '' || tx.exchange.toLowerCase().includes(filter.exchange.toLowerCase()))
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'timestamp') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeClass = (type) => {
    switch (type.toLowerCase()) {
      case 'buy':
        return 'buy';
      case 'sell':
        return 'sell';
      case 'deposit':
        return 'deposit';
      case 'withdrawal':
        return 'withdrawal';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="transaction-history glass-card">
        <h2>Transaction History</h2>
        <div className="loading-skeleton">
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
          <div className="skeleton-row"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history glass-card">
      <div className="header">
        <h2>Transaction History</h2>
        <button className="refresh-btn" onClick={fetchTransactions}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="coin-filter">Coin</label>
          <input
            type="text"
            id="coin-filter"
            placeholder="Filter by coin"
            value={filter.coin}
            onChange={(e) => handleFilterChange('coin', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="type-filter">Type</label>
          <select
            id="type-filter"
            value={filter.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="exchange-filter">Exchange</label>
          <input
            type="text"
            id="exchange-filter"
            placeholder="Filter by exchange"
            value={filter.exchange}
            onChange={(e) => handleFilterChange('exchange', e.target.value)}
          />
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <div className="no-transactions">
          <p>No transactions found</p>
          <p className="hint">Import transactions to see them here</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('timestamp')}>
                  Date
                  {sortConfig.key === 'timestamp' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('type')}>
                  Type
                  {sortConfig.key === 'type' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('coin')}>
                  Coin
                  {sortConfig.key === 'coin' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('amount')}>
                  Amount
                  {sortConfig.key === 'amount' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSort('price')}>
                  Price
                  {sortConfig.key === 'price' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Total Value</th>
                <th onClick={() => handleSort('exchange')}>
                  Exchange
                  {sortConfig.key === 'exchange' && (
                    <span className={`sort-indicator ${sortConfig.direction}`}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.timestamp)}</td>
                  <td>
                    <span className={`type-badge ${getTypeClass(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.coin.toUpperCase()}</td>
                  <td>{parseFloat(tx.amount).toFixed(6)}</td>
                  <td>{tx.price ? formatCurrency(parseFloat(tx.price)) : '-'}</td>
                  <td>
                    {tx.price 
                      ? formatCurrency(parseFloat(tx.amount) * parseFloat(tx.price))
                      : '-'}
                  </td>
                  <td>{tx.exchange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;