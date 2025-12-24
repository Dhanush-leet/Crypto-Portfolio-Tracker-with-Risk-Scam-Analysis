import React, { useState } from 'react';
import { showToast } from './Toast';
import { createSampleCsv, validateCsvFormat, parseCsvTransactions } from '../utils/csvParser';
import './TransactionImporter.css';

const TransactionImporter = () => {
  const [file, setFile] = useState(null);
  const [exchange, setExchange] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
      }
      
      setFile(selectedFile);
      setValidationError(null);
      setPreviewData(null);
      
      // Read and validate file content
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvContent = e.target.result;
          validateCsvFormat(csvContent);
          
          // Parse and show preview
          const transactions = parseCsvTransactions(csvContent);
          setPreviewData({
            totalTransactions: transactions.length,
            sampleRows: transactions.slice(0, 5) // Show first 5 rows as preview
          });
          
          showToast('CSV file validated successfully!', 'success');
        } catch (error) {
          setValidationError(error.message);
          showToast(error.message, 'error');
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleExchangeChange = (e) => {
    setExchange(e.target.value);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showToast('Please select a file to import', 'error');
      return;
    }
    
    if (!exchange) {
      showToast('Please select an exchange', 'error');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('exchange', exchange);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/transactions/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(data.message, 'success');
        // Reset form
        setFile(null);
        setExchange('');
        document.getElementById('file-input').value = '';
      } else {
        throw new Error(data.message || 'Failed to import transactions');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const droppedFile = files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        showToast('Please drop a CSV file', 'error');
      }
    }
  };

  return (
    <div className="transaction-importer glass-card">
      <h2>Import Transactions</h2>
      <p className="import-description">
        Upload your transaction history from supported exchanges to analyze your portfolio performance.
      </p>
      
      <form onSubmit={handleImport} className="import-form">
        <div 
          className="file-drop-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-input"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            {file ? (
              <div className="file-selected">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div className="file-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17,8 12,3 7,8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p>Drag & drop your CSV file here</p>
                <p className="browse-text">or <span>browse files</span></p>
              </div>
            )}
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="exchange">Exchange</label>
          <select
            id="exchange"
            value={exchange}
            onChange={handleExchangeChange}
            className="form-input"
            required
          >
            <option value="">Select exchange</option>
            <option value="Binance">Binance</option>
            <option value="Coinbase">Coinbase</option>
            <option value="Kraken">Kraken</option>
            <option value="Other">Other Exchange</option>
          </select>
        </div>
        
        <div className="import-instructions">
          <h3>CSV Format Requirements</h3>
          <ul>
            <li>Columns: Timestamp, Type, Coin, Amount, Price (optional), Fee (optional)</li>
            <li>Timestamp format: YYYY-MM-DD HH:MM:SS</li>
            <li>Type: BUY, SELL, DEPOSIT, WITHDRAWAL</li>
            <li>Example: 2023-01-15 14:30:00,BUY,BTC,0.5,15000.00,15.00</li>
          </ul>
          <button 
            type="button" 
            className="btn btn-secondary download-sample"
            onClick={() => {
              const blob = new Blob([createSampleCsv()], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sample_transactions.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            Download Sample CSV
          </button>
        </div>
        
        {validationError && (
          <div className="validation-error">
            <p className="error-message">{validationError}</p>
          </div>
        )}
              
        {previewData && (
          <div className="preview-section">
            <h3>Preview</h3>
            <p><strong>{previewData.totalTransactions}</strong> transactions found</p>
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Type</th>
                    <th>Coin</th>
                    <th>Amount</th>
                    <th>Price</th>
                    <th>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.sampleRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.timestamp}</td>
                      <td>{row.type}</td>
                      <td>{row.coin}</td>
                      <td>{row.amount}</td>
                      <td>{row.price || '-'}</td>
                      <td>{row.fee || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
              
        <button
          type="submit"
          className="btn btn-primary import-button"
          disabled={isUploading || !file || validationError !== null}
        >
          {isUploading ? (
            <>
              <span className="spinner"></span>
              Importing...
            </>
          ) : (
            'Import Transactions'
          )}
        </button>
      </form>
    </div>
  );
};

export default TransactionImporter;