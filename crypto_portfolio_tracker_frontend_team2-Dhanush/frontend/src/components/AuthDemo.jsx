import React, { useState } from 'react';

const AuthDemo = () => {
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [response, setResponse] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });
      
      const data = await res.json();
      setResponse({
        type: 'register',
        status: res.status,
        data: data
      });
    } catch (error) {
      setResponse({
        type: 'register',
        status: 'error',
        data: { message: error.message }
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });
      
      const data = await res.json();
      setResponse({
        type: 'login',
        status: res.status,
        data: data
      });
    } catch (error) {
      setResponse({
        type: 'login',
        status: 'error',
        data: { message: error.message }
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Crypto Portfolio Tracker - Authentication Demo</h1>
      
      <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <h2>Register</h2>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '10px' }}>
              <label>Full Name:</label><br />
              <input
                type="text"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label><br />
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password:</label><br />
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
                required
              />
            </div>
            <button type="submit">Register</button>
          </form>
        </div>

        <div style={{ flex: 1 }}>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '10px' }}>
              <label>Email:</label><br />
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password:</label><br />
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                style={{ width: '100%', padding: '5px' }}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>

      {response && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
          <h3>Response ({response.type}):</h3>
          <p><strong>Status:</strong> {response.status}</p>
          <pre>{JSON.stringify(response.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AuthDemo;