# Crypto Portfolio Tracker - Backend API

A Spring Boot 3 REST API for the Crypto Portfolio Tracker application with JWT authentication, secure API key storage, and exchange management.

## 🚀 Features

- **JWT Authentication** - Secure user registration and login
- **API Key Management** - Encrypted storage of exchange API keys
- **Exchange Integration** - Support for multiple crypto exchanges
- **H2 Database** - In-memory database for development
- **CORS Support** - Configured for frontend integration
- **Security** - BCrypt password hashing and AES encryption for API secrets

## 📋 Prerequisites

Before running the backend, ensure you have:

1. **Java 17 or higher** installed
   ```bash
   java -version
   ```

2. **Maven 3.6+** (or use the included Maven wrapper)
   ```bash
   mvn -version
   ```

## 🛠 Quick Start

### 1. Install Java 17

**Windows:**
- Download from [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
- Or use Chocolatey: `choco install openjdk17`
- Or use Scoop: `scoop install openjdk17`

**Verify Installation:**
```bash
java -version
javac -version
```

### 2. Configure Database

The application is configured to use PostgreSQL. Ensure you have:

**Database Setup:**
```sql
-- Run as PostgreSQL superuser
CREATE DATABASE crypto_portfolio;
CREATE USER crypto_portfolio WITH PASSWORD 'crypto_portfolio';
GRANT ALL PRIVILEGES ON DATABASE crypto_portfolio TO crypto_portfolio;
```

**Application Configuration** in `application.properties`:
```properties
# PostgreSQL Database
spring.datasource.url=jdbc:postgresql://localhost:5432/crypto_portfolio
spring.datasource.username=crypto_portfolio
spring.datasource.password=crypto_portfolio

# JWT Configuration
app.jwt.secret=change-this-secret-change-this-secret-change-this-secret
app.jwt.expiration-ms=3600000

# CORS - Frontend URL
app.frontend.url=http://localhost:3001

# Encryption Key for API Secrets
app.master.key=change_me_change_me_change_me
```

### 3. Run the Application

**Using Maven Wrapper (Recommended):**
```bash
cd crypto-portfolio-api
../mvnw.cmd spring-boot:run
```

**Using Maven:**
```bash
cd crypto-portfolio-api
mvn spring-boot:run
```

**Using Java directly:**
```bash
cd crypto-portfolio-api
../mvnw.cmd clean package
java -jar target/crypto-portfolio-api-1.0.0.jar
```

### 4. Verify Backend is Running

The API will be available at: **http://localhost:8080**

**Health Check:**
```bash
curl http://localhost:8080/api/exchanges
```

**PostgreSQL Database:**
- Host: localhost:5432
- Database: crypto_portfolio
- Username: crypto_portfolio
- Password: crypto_portfolio

## 📚 API Endpoints

### Authentication
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123"
}
```

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

### Exchanges
```http
GET /api/exchanges
```

### API Keys
```http
POST /api/apikeys
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "exchangeId": "1",
  "label": "My Trading Account",
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret"
}
```

```http
GET /api/apikeys
Authorization: Bearer <jwt-token>
```

## 🗄 Database Schema

### Users Table
- `id` (Primary Key)
- `name` (String)
- `email` (Unique, String)
- `password` (BCrypt hashed)
- `role` (String, default: "USER")
- `created_at` (Timestamp)

### Exchanges Table
- `id` (Primary Key)
- `name` (String) - e.g., "Binance", "Coinbase"
- `base_url` (String) - API base URL
- `created_at` (Timestamp)

### API Keys Table
- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `exchange_id` (Foreign Key → Exchanges)
- `api_key` (String) - Public API key
- `api_secret_encrypted` (String) - AES encrypted secret
- `label` (String) - User-defined label
- `created_at` (Timestamp)

## 🔐 Security Features

### JWT Authentication
- Tokens expire in 1 hour (configurable)
- Stateless authentication
- Secure token validation

### Password Security
- BCrypt hashing with salt
- Minimum password requirements enforced by frontend

### API Secret Encryption
- AES encryption for stored API secrets
- Master key configuration
- Secrets never returned in API responses

### CORS Protection
- Configured for specific frontend origins
- Credentials support enabled
- Preflight request handling

## 🧪 Demo Data

The application automatically seeds demo data:

**Demo User:**
- Email: `demo@example.com`
- Password: `demopass`

**Exchanges:**
- Binance (https://api.binance.com)
- Coinbase (https://api.exchange.coinbase.com)
- Kraken (https://api.kraken.com)

## 🔧 Development

### Project Structure
```
src/main/java/com/example/crypto/
├── CryptoPortfolioApiApplication.java  # Main application class
├── config/
│   └── CorsConfig.java                 # CORS configuration
├── controller/
│   ├── AuthController.java             # Authentication endpoints
│   ├── ExchangeController.java         # Exchange management
│   └── ApiKeyController.java           # API key management
├── entity/
│   ├── User.java                       # User entity
│   ├── Exchange.java                   # Exchange entity
│   └── ApiKey.java                     # API key entity
├── repository/
│   ├── UserRepository.java             # User data access
│   ├── ExchangeRepository.java         # Exchange data access
│   └── ApiKeyRepository.java           # API key data access
└── security/
    ├── SecurityConfig.java             # Spring Security config
    ├── JwtService.java                 # JWT token service
    ├── JwtAuthFilter.java              # JWT authentication filter
    └── CryptoService.java              # Encryption service
```

### Adding New Exchanges
1. Add exchange to the seed data in `CryptoPortfolioApiApplication.java`
2. Or use the H2 console to insert directly

### Environment Variables
For production, set these environment variables:
```bash
APP_JWT_SECRET=your-super-secret-jwt-key-here
APP_JWT_EXP_MS=3600000
MASTER_KEY=your-encryption-master-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 🚀 Production Deployment

### Database Migration
For production, switch to PostgreSQL or MySQL:

1. Update `application.properties`:
```properties
# PostgreSQL Example
spring.datasource.url=jdbc:postgresql://localhost:5432/crypto_portfolio
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

2. Add database dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Security Hardening
- Use strong JWT secrets (64+ characters)
- Use environment variables for secrets
- Enable HTTPS in production
- Configure proper CORS origins
- Set up rate limiting
- Enable SQL injection protection

## 🐛 Troubleshooting

### Common Issues

**Port 8080 already in use:**
```bash
# Change port in application.properties
server.port=8081
```

**JWT token invalid:**
- Check token expiration
- Verify JWT secret configuration
- Ensure proper Authorization header format: `Bearer <token>`

**CORS errors:**
- Verify frontend URL in `app.frontend.url`
- Check CORS configuration in `CorsConfig.java`

**Database connection issues:**
- H2 console: http://localhost:8080/h2-console
- Verify JDBC URL: `jdbc:h2:mem:crypto`

### Logs
Enable debug logging:
```properties
logging.level.com.example.crypto=DEBUG
logging.level.org.springframework.security=DEBUG
```

## 📞 Integration with Frontend

The backend is designed to work seamlessly with the React frontend:

1. **Start Backend:** `mvnw.cmd spring-boot:run` (Port 8080)
2. **Start Frontend:** `npm start` (Port 3001)
3. **Test Integration:** Login with demo@example.com / demopass

The frontend will automatically connect to the backend API for authentication and data management.