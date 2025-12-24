# Frontend — quick start

This frontend is a React app (components provided) that calls a backend API at `/api/...`.

How to run the mock backend for local development

1. From the `frontend` folder start the mock server:

```bash
cd frontend/mock-server
npm install
npm start
```

This starts a lightweight mock API server at `http://localhost:4000` by default.

2. Start your React dev server (CRA/Vite) as usual in the `frontend` app root.

Environment
- To point the frontend to a different API origin, set `REACT_APP_API_BASE_URL`.
  Example (create `.env` in frontend project root):

```
REACT_APP_API_BASE_URL=http://localhost:4000
```

Mock server details
- Login: `POST /api/auth/login` accepts `{ email, password }` and returns `{ token, user }`.
- Register: `POST /api/auth/register` accepts `{ name, email, password }`.
- Me: `GET /api/auth/me` requires `Authorization: Bearer <token>`.
- Exchanges: `GET /api/exchanges`
- API keys: `POST /api/apikeys` (requires auth) and `GET /api/apikeys` (requires auth)

Demo credentials (seeded):

- email: `demo@example.com`
- password: `demopass`

Notes
- The mock server is intentionally simple and stores data in memory; it's suitable for front-end development only.
- For production, use your real backend and configure CORS to allow your front-end origin.
