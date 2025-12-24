# Crypto Portfolio Tracker - Frontend

A modern, elegant React frontend for the Crypto Portfolio Tracker application with glassmorphism design.

## Features

- **Authentication**: User registration and login with JWT tokens
- **Dashboard**: User dashboard with exchange connections and API key management
- **Responsive Design**: Mobile-first, glassmorphism UI with smooth animations
- **Accessibility**: ARIA labels, focus states, and screen reader support
- **Toast Notifications**: Elegant toast system for user feedback
- **Modal System**: Reusable modal component for forms and dialogs

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API endpoint:**
   Edit `src/api.js` and update the `API_BASE_URL` if your backend runs on a different port:
   ```javascript
   const API_BASE_URL = "http://localhost:8080"; // Change if needed
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   Navigate to http://localhost:3001 (or the port shown in terminal)

## Project Structure

```
frontend/src/
├── App.js                 # Main app component with routing
├── App.css               # Global styles and CSS variables
├── api.js                # API integration layer
├── pages/
│   ├── LoginPage.jsx     # Login form page
│   ├── LoginPage.css
│   ├── RegisterPage.jsx  # Registration form page
│   ├── RegisterPage.css
│   ├── Dashboard.jsx     # Main dashboard page
│   └── Dashboard.css
└── components/
    ├── ProtectedRoute.jsx # Route protection wrapper
    ├── Toast.jsx         # Toast notification system
    ├── Toast.css
    ├── Modal.jsx         # Reusable modal component
    └── Modal.css
```

## API Integration

The frontend expects the following backend endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/me` - Get current user info (requires Bearer token)
- `GET /api/exchanges` - Get available exchanges
- `POST /api/apikeys` - Create new API key (requires Bearer token)
- `GET /api/apikeys` - Get user's API keys (requires Bearer token)

## Demo Credentials

Use the "Demo Login" button or these credentials:
- Email: demo@example.com
- Password: demopass

## Customization

### Branding & Colors
Edit CSS variables in `src/App.css`:

```css
:root {
  --primary-color: #667eea;
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-color: #10b981;
  --error-color: #ef4444;
  /* ... more variables */
}
```

### API Configuration
Update the base URL in `src/api.js`:

```javascript
const API_BASE_URL = "http://your-backend-url:port";
```

## Security Features

- JWT tokens stored in localStorage
- Automatic logout on 401 responses
- API secrets masked in UI (****abcd format)
- CORS-friendly API calls
- Protected routes with authentication checks

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

The app uses React functional components with hooks and follows modern React patterns. No external UI libraries are used - all styling is custom CSS with glassmorphism design.

## Production Build

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Assets & Images

### Hero Illustration
The application includes a custom crypto-themed hero illustration (`src/assets/hero-crypto.svg`) used on the entry page. 

**Image Credit**: Custom Design
**Note**: If you replace this with a licensed image, please update the credit in `src/pages/EntryPage.jsx` and ensure proper licensing compliance.

**Accessibility**: The image includes proper alt text: "Illustration of cryptocurrency markets and security"

## ✨ Dashboard Features

### Next Steps Cards
The dashboard features three main action cards:

1. **Connect Exchange** - View available exchanges and connect accounts
2. **Add API Key** - Securely store exchange API keys with encryption
3. **Import Transactions** - Import trading history (coming soon)

### API Key Management
- Secure storage with masked display (****abcd format)
- Modal-based form for adding new keys
- Exchange selection dropdown
- Real-time validation and error handling

### User Experience
- Clean, minimal glassmorphism design
- Responsive mobile-first layout
- Toast notifications for all actions
- Auto-logout on authentication errors
- Loading states and error handling