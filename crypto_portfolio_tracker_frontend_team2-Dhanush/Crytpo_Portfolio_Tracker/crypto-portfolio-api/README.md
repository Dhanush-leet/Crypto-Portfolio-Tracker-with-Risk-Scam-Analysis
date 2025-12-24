# Crypto Portfolio API

A Spring Boot 3 Java API that implements authentication and secure exchange API key storage for the Crypto Portfolio Tracker project.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Exchange Management**: Seeded exchanges (Binance, Coinbase, Kraken)
- **Secure API Key Storage**: Encrypted storage of exchange API secrets using AES encryption
- **Portfolio Management**: Track cryptocurrency holdings and view portfolio performance
- **RESTful API**: Clean endpoints for all operations
- **MySQL Database**: Production-ready database configuration
- **H2 Database**: Development mode with in-memory database

## Technology Stack

- **Java 17+**
- **Spring Boot 3.2.0**
- **Spring Security** - JWT authentication
- **Spring Data JPA** - Database operations
- **MySQL 8.0** - Production database
- **H2** - Development database
- **JJWT** - JWT token handling
- **Maven** - Build tool

## Prerequisites

1. **Java 17 or higher**
2. **Maven 3.6+**
3. **MySQL 8.0** (for production) or use H2 (development)

## Quick Start

### 1. Clone and Navigate

```bash
# Navigate to the project directory
cd crypto-portfolio-api
```

### 2. Configure Database

#### Option A: MySQL (Production)
1. Create a MySQL database:
```sql
CREATE DATABASE crypto;
```

2. Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/crypto?useSSL=false&serverTimezone=UTC
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
```

#### Option B: H2 (Development)
Uncomment H2 configuration in `application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:crypto
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
```

### 3. Set Environment Variables

#### Required Variables:
```bash
# JWT Secret (use a strong secret key)
export APP_JWT_SECRET="your-super-secret-jwt-key-change-this"

# JWT Expiration (1 hour in milliseconds)
export APP_JWT_EXP_MS="3600000"

# Master key for API encryption (keep this secret!)
export MASTER_KEY="your-32-character-master-key"

# CORS Frontend URL (optional)
export FRONTEND_URL="http://localhost:3000"
```

#### Alternative: Edit application.properties
Update the fallback values in `application.properties`:
```properties
app.jwt.secret=your-super-secret-jwt-key-change-this
app.jwt.expiration-ms=3600000
app.master.key=your-32-character-master-key
```

### 4. Build and Run

```bash
# Clean and build
mvn clean

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
}
```

**Response**: `201 Created`
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "createdAt": "2025-12-10T13:30:00Z"
    }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securepassword"
}
```

**Response**: `200 OK`
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "createdAt": "2025-12-10T13:30:00Z"
    }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

**Response**: `200 OK`
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "USER",
        "createdAt": "2025-12-10T13:30:00Z"
    }
}
```

### Exchanges

#### Get All Exchanges
```http
GET /api/exchanges
```

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "name": "Binance",
        "baseUrl": "https://api.binance.com",
        "createdAt": "2025-12-10T13:30:00Z"
    },
    {
        "id": 2,
        "name": "Coinbase",
        "baseUrl": "https://api.exchange.coinbase.com",
        "createdAt": "2025-12-10T13:30:00Z"
    }
]
```

### API Keys

#### Save API Key
```http
POST /api/apikeys
Authorization: Bearer {accessToken}
Content-Type: application/json

{
    "exchangeId": 1,
    "label": "Main Trading Account",
    "apiKey": "your-api-key-here",
    "apiSecret": "your-api-secret-here"
}
```

**Response**: `200 OK`
```json
{
    "message": "API key saved successfully",
    "id": 1
}
```

#### Get User API Keys
```http
GET /api/apikeys
Authorization: Bearer {accessToken}
```

**Response**: `200 OK`
```json
[
    {
        "id": 1,
        "apiKey": "your-api-key-here",
        "label": "Main Trading Account",
        "exchange": "Binance",
        "createdAt": "2025-12-10T13:30:00Z"
    }
]
```

### Portfolio

#### Get Portfolio Summary
```http
GET /api/portfolio/summary
Authorization: Bearer {accessToken}
```

**Response**: `200 OK`
```json
{
  "totalUsd": 12540.20,
  "change24hUsd": 599.20,
  "change24hPct": 5.23,
  "coinsOwned": 5,
  "coins": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "amount": 0.3,
      "priceUsd": 42210,
      "change24hPct": 3.2,
      "usdValue": 12663,
      "exchangeSource": ["Binance","Coinbase"]
    }
  ]
}
```

#### Sync Exchange Balances
```http
POST /api/exchanges/{exchangeId}/sync
Authorization: Bearer {accessToken}
```

**Response**: `202 Accepted`
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "statusUrl": "/api/portfolio/sync-status/550e8400-e29b-41d4-a716-446655440000"
}
```

#### Get Raw Exchange Balances
```http
GET /api/exchanges/balances
Authorization: Bearer {accessToken}
```

**Response**: `200 OK`
```json
{
  "Binance": {
    "BTC": 0.5,
    "ETH": 10.0,
    "BNB": 100.0
  },
  "Coinbase": {
    "BTC": 0.2,
    "ETH": 5.0,
    "USDT": 5000.0
  }
}
```

## Sample Data

The application seeds:
- **Exchanges**: Binance, Coinbase, Kraken
- **Demo User**: 
  - Email: `demo@example.com`
  - Password: `demopass`

## Security Features

### Password Security
- Passwords are hashed using BCrypt
- Never stored in plaintext

### JWT Authentication
- Short-lived access tokens (1 hour default)
- Stateless authentication
- Secure token validation

### API Key Encryption
- API secrets are encrypted using AES encryption
- Master key configurable via environment variable
- Encrypted secrets stored in database

### Security Configuration
- CORS support for frontend integration
- Stateless session management
- Protected routes with JWT validation

## Environment Configuration

### Production Environment Variables

```bash
export APP_JWT_SECRET="your-production-jwt-secret-min-32-chars"
export APP_JWT_EXP_MS="3600000"  # 1 hour
export MASTER_KEY="your-production-master-key-min-32-chars"
export FRONTEND_URL="https://your-frontend-domain.com"
export DB_URL="jdbc:mysql://your-db-host:3306/crypto"
export DB_USER="your-db-username"
export DB_PASS="your-db-password"
```

### Development Environment Variables

```bash
export APP_JWT_SECRET="dev-secret-change-this"
export APP_JWT_EXP_MS="3600000"
export MASTER_KEY="dev-master-key-change-this"
export FRONTEND_URL="http://localhost:3000"
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `application.properties`
   - Verify database exists

2. **JWT Token Error**
   - Ensure `APP_JWT_SECRET` is set and at least 32 characters
   - Check token format in requests

3. **API Key Encryption Error**
   - Ensure `MASTER_KEY` is set and at least 16 characters
   - Verify environment variable is properly loaded

4. **Port Already in Use**
   - Change server port in `application.properties`:
   ```properties
   server.port=8081
   ```

### Enable Debug Logging

Add to `application.properties`:
```properties
logging.level.com.example.crypto=DEBUG
spring.jpa.show-sql=true
```

## Development

### Project Structure

```
src/main/java/com/example/crypto/
├── controller/          # REST controllers
├── entity/             # JPA entities
├── repository/         # Data repositories
├── security/           # Security configuration
├── service/            # Business logic services
├── scheduler/          # Scheduled tasks
├── dto/                # Data transfer objects
└── CryptoPortfolioApiApplication.java
```

### Adding New Features

1. Create entity class in `entity/` package
2. Create repository interface in `repository/` package
3. Create controller in `controller/` package
4. Create service in `service/` package
5. Create DTOs in `dto/` package
6. Update security configuration if needed
7. Add tests in `src/test/java/`

## Portfolio Feature Implementation Details

The portfolio feature includes:

1. **Portfolio Summary Endpoint**: Aggregates balances from all connected exchanges and calculates portfolio metrics
2. **Exchange Sync Endpoint**: Triggers asynchronous balance synchronization for a specific exchange
3. **Exchange Balances Endpoint**: Returns raw per-exchange balances
4. **Scheduled Sync Worker**: Automatically syncs portfolios every 5 minutes
5. **Market Data Caching**: Caches market prices for 30 seconds to reduce API calls
6. **Exchange Connectors**: Modular connectors for different exchanges (Binance connector provided as example)

See `PORTFOLIO_FEATURE_README.md` for detailed setup and configuration instructions.

## API Key Security Best Practices

### For Production:
1. **Use a proper Key Management Service (KMS)**:
   - AWS KMS
   - Google Cloud KMS
   - Azure Key Vault
   - HashiCorp Vault

2. **Key Rotation**:
   - Rotate `MASTER_KEY` periodically
   - Implement key versioning
   - Plan migration strategy

3. **Environment Security**:
   - Never commit secrets to version control
   - Use environment-specific configurations
   - Implement secret scanning in CI/CD

### Current Implementation:
- Simple AES encryption for demonstration
- Master key stored in environment variable
- Suitable for development and basic production use

## License

This project is part of the Crypto Portfolio Tracker milestone 1 implementation.

## Support

For issues and questions, please refer to the project documentation or create an issue in the repository.