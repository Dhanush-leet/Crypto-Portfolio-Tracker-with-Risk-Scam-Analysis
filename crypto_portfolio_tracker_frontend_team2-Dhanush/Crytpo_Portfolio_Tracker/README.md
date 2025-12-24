# 🚀 Crypto Portfolio Tracker

A modern, full-stack cryptocurrency portfolio management application with interactive UI and secure backend.

## 📋 Project Overview

This project consists of two separate applications:

### 🎨 Frontend (React)
- **Location:** `frontend/`
- **Technology:** React 19 + GSAP animations
- **Port:** http://localhost:3001
- **Features:** Interactive bento grid, glassmorphism design, JWT authentication

### 🔧 Backend (Spring Boot)
- **Location:** `crypto-portfolio-api/`
- **Technology:** Spring Boot 3 + H2 Database
- **Port:** http://localhost:8080
- **Features:** REST API, JWT auth, encrypted API key storage

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** (for frontend)
- **Java 17+** (for backend)
- **PostgreSQL 12+** (for database)

### 1. Start Frontend
```bash
cd frontend
npm install
npm start
```
Frontend will be available at: **http://localhost:3001**

### 2. Setup Database

**PostgreSQL Configuration:**
```sql
-- Run as PostgreSQL superuser
CREATE DATABASE crypto_portfolio;
CREATE USER crypto_portfolio WITH PASSWORD 'crypto_portfolio';
GRANT ALL PRIVILEGES ON DATABASE crypto_portfolio TO crypto_portfolio;
```

**Or use the setup script:**
```bash
psql -U postgres -f setup-database.sql
```

### 3. Start Backend

**Option A: Using Scripts**
```bash
# Windows
./start-backend.bat

# PowerShell/Cross-platform
./start-backend.ps1
```

**Option B: Manual**
```bash
cd crypto-portfolio-api
../mvnw.cmd spring-boot:run    # Windows
../mvnw spring-boot:run        # Unix/Mac
```
Backend will be available at: **http://localhost:8080**

## 🎯 Demo Credentials

**Demo User:**
- Email: `demo@example.com`
- Password: `demopass`

## ✨ Features

### Frontend Features
- 🎨 **Interactive Bento Grid** - Animated cards with particle effects
- 🌟 **Glassmorphism Design** - Modern glass-like UI components
- 📱 **Responsive Layout** - Mobile-first design
- 🔐 **JWT Authentication** - Secure login/register flow
- ⚡ **GSAP Animations** - Smooth particle effects and transitions
- 🎭 **3D Effects** - Tilt and magnetism on card interactions
- 🔔 **Toast Notifications** - Elegant user feedback system

### Backend Features
- 🔒 **JWT Authentication** - Stateless security
- 🏦 **Exchange Management** - Support for multiple crypto exchanges
- 🔑 **API Key Storage** - AES encrypted secret storage
- 🗄️ **H2 Database** - In-memory database for development
- 🌐 **CORS Support** - Configured for frontend integration
- 🛡️ **Security** - BCrypt password hashing

## 🏗 Architecture

```
Crypto Portfolio Tracker/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── MagicBento.jsx  # Interactive bento grid
│   │   │   ├── Toast.jsx       # Notification system
│   │   │   └── Modal.jsx       # Modal dialogs
│   │   ├── pages/              # Page components
│   │   │   ├── LoginPage.jsx   # Authentication
│   │   │   ├── RegisterPage.jsx
│   │   │   └── Dashboard.jsx   # Main dashboard
│   │   └── api.js              # API integration
│   └── package.json
│
├── crypto-portfolio-api/        # Spring Boot Backend
│   ├── src/main/java/com/example/crypto/
│   │   ├── controller/         # REST endpoints
│   │   ├── entity/             # JPA entities
│   │   ├── repository/         # Data access
│   │   ├── security/           # JWT & encryption
│   │   └── config/             # Configuration
│   └── pom.xml
│
├── start-backend.bat           # Windows startup script
├── start-backend.ps1           # PowerShell startup script
└── README.md                   # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Exchanges
- `GET /api/exchanges` - List available exchanges

### API Keys
- `POST /api/apikeys` - Store encrypted API key
- `GET /api/apikeys` - Get user's API keys

## 🎨 UI Components

### Interactive Bento Grid
The dashboard features a stunning bento grid with:
- **Particle Effects** - Animated particles on hover
- **Spotlight Effect** - Dynamic glow following mouse
- **3D Tilt Animation** - Cards tilt based on cursor position
- **Magnetism** - Cards attract toward cursor
- **Click Ripples** - Beautiful ripple effects

### Cards Available
1. **Portfolio Overview** - Track holdings and performance
2. **Exchange Connections** - Manage exchange APIs
3. **API Key Management** - Secure key storage
4. **Transaction History** - Trading history analysis
5. **Real-time Analytics** - Live market insights
6. **Alerts & Notifications** - Price alerts system

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm install
npm start          # Development server
npm run build      # Production build
```

### Backend Development
```bash
cd crypto-portfolio-api
../mvnw.cmd spring-boot:run    # Development server
../mvnw.cmd clean package      # Build JAR
```

### Database Access
- **H2 Console:** http://localhost:8080/h2-console
- **JDBC URL:** `jdbc:h2:mem:crypto`
- **Username:** `sa`
- **Password:** (empty)

## 🚀 Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy build/ folder to your web server
```

### Backend
```bash
cd crypto-portfolio-api
../mvnw.cmd clean package
java -jar target/crypto-portfolio-api-1.0.0.jar
```

## 🔐 Security

- **JWT Tokens** - Secure stateless authentication
- **BCrypt Hashing** - Password security
- **AES Encryption** - API secret protection
- **CORS Protection** - Cross-origin security
- **Input Validation** - SQL injection prevention

## 🐛 Troubleshooting

### Common Issues

**Frontend won't start:**
- Ensure Node.js 16+ is installed
- Run `npm install` in frontend directory
- Check if port 3001 is available

**Backend won't start:**
- Ensure Java 17+ is installed
- Check if port 8080 is available
- Verify H2 database configuration

**CORS errors:**
- Ensure backend is running on port 8080
- Check CORS configuration in backend
- Verify frontend URL in backend config

**Network/API Issues:**

1. **"Failed to fetch" errors:**
   ```bash
   # Test backend directly with curl
   curl -v -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"testpass"}'
   ```

2. **CORS blocked requests:**
   - Check browser DevTools Console for CORS errors
   - Verify backend CORS configuration includes your frontend URL
   - Ensure both frontend and backend are running

3. **401 Unauthorized:**
   - Check if JWT token is being sent correctly
   - Verify token hasn't expired (1 hour default)
   - Try logging out and back in

4. **Connection refused:**
   - Backend not running or wrong port
   - Check `REACT_APP_API_BASE_URL` in frontend/.env
   - Verify backend is accessible at http://localhost:8080

### Debug Steps

1. **Check API Base URL:**
   ```javascript
   // In browser console
   console.log('API URL:', process.env.REACT_APP_API_BASE_URL);
   ```

2. **Test Backend Health:**
   ```bash
   curl http://localhost:8080/api/exchanges
   ```

3. **Check Network Tab:**
   - Open DevTools → Network
   - Submit form and check failed requests
   - Look for status codes and error messages

4. **Enable Debug Logging:**
   - Frontend automatically logs API calls in console
   - Check browser console for detailed error information

## 📚 Documentation

- **Frontend README:** `frontend/README-FRONTEND.md`
- **Backend README:** `crypto-portfolio-api/README-BACKEND.md`

## 🎯 Next Steps

1. **Install Java 17** if not already installed
2. **Start both applications** using the quick start guide
3. **Test with demo credentials** (demo@example.com / demopass)
4. **Explore the interactive dashboard** with bento grid animations
5. **Add API keys** for your crypto exchanges

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Ready to track your crypto portfolio with style? Start both applications and enjoy the interactive experience!** 🚀