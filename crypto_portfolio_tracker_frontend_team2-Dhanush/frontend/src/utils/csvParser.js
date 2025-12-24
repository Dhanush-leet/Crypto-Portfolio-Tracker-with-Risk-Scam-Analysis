// Utility functions for parsing and validating CSV transaction files

export const validateCsvFormat = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one transaction row');
  }
  
  // Check header
  const header = lines[0].split(',').map(col => col.trim().toLowerCase());
  const requiredColumns = ['timestamp', 'type', 'coin', 'amount'];
  
  for (const requiredCol of requiredColumns) {
    if (!header.includes(requiredCol)) {
      throw new Error(`Missing required column: ${requiredCol}`);
    }
  }
  
  // Validate each row
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    
    if (row.length < 4) {
      throw new Error(`Row ${i + 1}: Insufficient columns. Expected at least 4 columns.`);
    }
    
    // Validate timestamp format (YYYY-MM-DD HH:MM:SS)
    const timestamp = row[0].trim();
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
      throw new Error(`Row ${i + 1}: Invalid timestamp format. Expected YYYY-MM-DD HH:MM:SS`);
    }
    
    // Validate type
    const type = row[1].trim().toUpperCase();
    const validTypes = ['BUY', 'SELL', 'DEPOSIT', 'WITHDRAWAL'];
    if (!validTypes.includes(type)) {
      throw new Error(`Row ${i + 1}: Invalid transaction type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    // Validate coin (should be non-empty)
    const coin = row[2].trim();
    if (!coin) {
      throw new Error(`Row ${i + 1}: Coin cannot be empty`);
    }
    
    // Validate amount (should be a positive number)
    const amount = parseFloat(row[3].trim());
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Row ${i + 1}: Invalid amount. Must be a positive number`);
    }
  }
  
  return true;
};

export const parseCsvTransactions = (csvContent) => {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const header = lines[0].split(',').map(col => col.trim().toLowerCase());
  
  const timestampIndex = header.indexOf('timestamp');
  const typeIndex = header.indexOf('type');
  const coinIndex = header.indexOf('coin');
  const amountIndex = header.indexOf('amount');
  const priceIndex = header.indexOf('price');
  const feeIndex = header.indexOf('fee');
  
  const transactions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(cell => cell.trim());
    
    if (row.length >= 4) {
      const transaction = {
        timestamp: row[timestampIndex],
        type: row[typeIndex].toUpperCase(),
        coin: row[coinIndex].toUpperCase(),
        amount: parseFloat(row[amountIndex]),
        price: priceIndex >= 0 && row[priceIndex] ? parseFloat(row[priceIndex]) : null,
        fee: feeIndex >= 0 && row[feeIndex] ? parseFloat(row[feeIndex]) : null
      };
      
      transactions.push(transaction);
    }
  }
  
  return transactions;
};

export const createSampleCsv = () => {
  return `Timestamp,Type,Coin,Amount,Price,Fee
2023-01-15 14:30:00,BUY,BTC,0.5,15000.00,15.00
2023-02-20 09:15:00,SELL,ETH,2.0,1200.00,2.40
2023-03-10 16:45:00,DEPOSIT,USDT,1000.00,1.00,0.00
2023-04-05 11:20:00,WITHDRAWAL,LTC,5.0,50.00,0.50`;
};