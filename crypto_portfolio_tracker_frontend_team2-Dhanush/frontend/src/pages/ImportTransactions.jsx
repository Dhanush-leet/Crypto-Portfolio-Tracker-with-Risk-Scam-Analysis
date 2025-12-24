import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../components/Toast';
import './ImportTransactions.css';

const ImportTransactions = () => {
  const [selectedExchange, setSelectedExchange] = useState('');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showFormatDetails, setShowFormatDetails] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const navigate = useNavigate();

  const supportedExchanges = [
    { id: 'binance', name: 'Binance' },
    { id: 'coinbase', name: 'Coinbase' },
    { id: 'kraken', name: 'Kraken' },
    { id: 'kucoin', name: 'KuCoin' },
    { id: 'bitfinex', name: 'Bitfinex' },
    { id: 'gemini', name: 'Gemini' },
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setFile(file);
      } else {
        showToast('Please upload a CSV file', 'error');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setFile(file);
      } else {
        showToast('Please upload a CSV file', 'error');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedExchange) {
      showToast('Please select an exchange', 'error');
      return;
    }

    if (!file) {
      showToast('Please select a file to import', 'error');
      return;
    }

    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit', 'error');
      return;
    }

    setIsImporting(true);

    try {
      // Simulate import process
      // In a real implementation, this would call the API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('Transactions imported successfully!', 'success');
      setFile(null);
      setSelectedExchange('');
      navigate('/dashboard');
    } catch (error) {
      showToast('Failed to import transactions. Please try again.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['Timestamp', 'Type', 'Coin', 'Amount', 'Price', 'Fee'],
      ['2023-01-15 14:30:00', 'BUY', 'BTC', '0.5', '15000.00', '15.00'],
      ['2023-02-20 09:15:00', 'SELL', 'ETH', '2.0', '2500.00', '10.00'],
      ['2023-03-10 16:45:00', 'BUY', 'SOL', '10.0', '50.00', '2.50'],
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="import-transactions-page">
      <div className="import-header">
        <h1 className="import-title">Import Transactions</h1>
        <p className="import-subtitle">Upload your transaction history from your crypto exchanges</p>
      </div>

      <div className="import-steps">
        <div className="step-card">
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Prepare your CSV file from your exchange</li>
            <li>Select the exchange platform</li>
            <li>Upload your file (drag & drop or browse)</li>
            <li>Review and confirm import</li>
            <li>Done! Your transactions will be analyzed</li>
          </ol>
        </div>
      </div>

      <div className="import-content">
        <div className="upload-section">
          <div className="upload-card">
            <h3>Upload Transactions</h3>
            
            <div className="form-group">
              <label htmlFor="exchange">Exchange Platform</label>
              <select
                id="exchange"
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value)}
                className="form-select"
              >
                <option value="">Select an exchange</option>
                {supportedExchanges.map(exchange => (
                  <option key={exchange.id} value={exchange.id}>
                    {exchange.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>CSV File Upload</label>
              <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="upload-content">
                  <div className="upload-icon">📁</div>
                  <p>Drag & drop your CSV file here</p>
                  <p className="upload-hint">or</p>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            </div>

            {file && (
              <div className="file-preview">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-text"
                  onClick={() => setFile(null)}
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleImport}
              disabled={isImporting || !selectedExchange || !file}
            >
              {isImporting ? (
                <>
                  <span className="loading-spinner"></span>
                  Importing Transactions...
                </>
              ) : (
                'Import Transactions'
              )}
            </button>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>CSV Format Requirements</h3>
            <button
              className="toggle-details"
              onClick={() => setShowFormatDetails(!showFormatDetails)}
            >
              {showFormatDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {showFormatDetails && (
              <div className="format-details">
                <h4>Required Columns:</h4>
                <ul>
                  <li><strong>Timestamp</strong> (YYYY-MM-DD HH:MM:SS format)</li>
                  <li><strong>Type</strong> (BUY, SELL, DEPOSIT, WITHDRAWAL)</li>
                  <li><strong>Coin</strong> (BTC, ETH, etc.)</li>
                  <li><strong>Amount</strong> (Quantity of coin)</li>
                </ul>

                <h4>Optional Columns:</h4>
                <ul>
                  <li><strong>Price</strong> (Price per unit)</li>
                  <li><strong>Fee</strong> (Transaction fee)</li>
                </ul>

                <h4>Example Row:</h4>
                <pre className="example-row">
2023-01-15 14:30:00,BUY,BTC,0.5,15000.00,15.00
                </pre>
              </div>
            )}
          </div>

          <div className="info-card">
            <h3>Supported File Format</h3>
            <ul className="format-list">
              <li>CSV (Comma-Separated Values)</li>
              <li>Max file size: 10MB</li>
              <li>UTF-8 encoding recommended</li>
              <li>First row should contain headers</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Sample CSV</h3>
            <p>Download a sample CSV file to see the required format</p>
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={downloadSampleCSV}
            >
              Download Sample CSV
            </button>
          </div>

          <div className="info-card">
            <h3>Tips & FAQ</h3>
            <ul className="faq-list">
              <li>Ensure timestamps are in UTC</li>
              <li>Use decimal format for amounts (0.5 not 1/2)</li>
              <li>Check for missing or invalid data</li>
              <li>Contact support if you have format issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportTransactions;