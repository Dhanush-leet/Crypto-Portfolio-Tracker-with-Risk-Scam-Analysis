# Portfolio Feature Setup Guide

This document explains how to set up and run the portfolio feature for the Crypto Portfolio Tracker application.

## Prerequisites

1. Java 17+
2. Maven 3.8+
3. PostgreSQL database (or use H2 for development)
4. Exchange API keys (for real balance syncing)

## Environment Variables

The following environment variables need to be configured:

```
# Master key for API key encryption (required)
MASTER_KEY=your-master-key-here

# JWT configuration
APP_JWT_SECRET=your-jwt-secret-here
APP_JWT_EXP_MS=3600000

# Database configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/crypto_portfolio
DATABASE_USERNAME=crypto_portfolio
DATABASE_PASSWORD=crypto_portfolio

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## Setting Up Exchange API Keys

1. Users can add exchange API keys through the frontend UI:
   - Navigate to the "API Keys" section
   - Select an exchange (Binance, Coinbase, Kraken)
   - Enter your API key and secret
   - Click "Save"

2. API keys are securely encrypted before being stored in the database using the `MASTER_KEY`.

## Running the Sync Worker

The portfolio sync worker runs automatically every 5 minutes to refresh balances for connected exchanges.

To manually trigger a sync:
1. Call the `POST /api/exchanges/{exchangeId}/sync` endpoint
2. The API will return a job ID and status URL
3. The sync process runs asynchronously in the background

## API Endpoints

### Portfolio Summary
```
GET /api/portfolio/summary
```
Returns the user's portfolio summary including:
- Total portfolio value in USD
- 24-hour profit/loss in USD and percentage
- Number of coins owned
- Details for each coin (amount, price, value, etc.)

### Exchange Sync
```
POST /api/exchanges/{exchangeId}/sync
```
Triggers a balance sync for the specified exchange.

### Exchange Balances
```
GET /api/exchanges/balances
```
Returns raw per-exchange balances.

## Security Considerations

1. All API secrets are encrypted using AES encryption with the `MASTER_KEY`
2. All endpoints require JWT authentication
3. Rate limiting is implemented to prevent abuse
4. Exchange connectors implement exponential backoff for API calls

## Development Notes

1. The `BinanceConnector` is provided as a sample implementation
2. Other exchanges can be added by implementing the `ExchangeConnector` interface
3. Market data is cached for 30 seconds to reduce API calls
4. In case of API failures, the system gracefully falls back to cached data

## Testing

To test the portfolio feature:

1. Start the backend application:
   ```
   ./mvnw spring-boot:run
   ```

2. Start the frontend application:
   ```
   npm start
   ```

3. Navigate to the portfolio page in the frontend
4. Add exchange API keys through the UI
5. Trigger a sync to populate portfolio data

## Production Deployment

For production deployment:

1. Set strong values for all environment variables
2. Use a production database (PostgreSQL recommended)
3. Configure SSL/TLS for all communications
4. Set up monitoring and alerting for sync jobs
5. Regularly rotate the `MASTER_KEY` and JWT secrets