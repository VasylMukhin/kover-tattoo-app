// В LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Auth.css';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Zalogowano pomyślnie!');
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          navigate('/'); 
        } else {
          setMessage(data.message);
        }
      })
      .catch(() => setMessage('❌ Błąd sieci lub serwera.'));
  };

  return (
    <>
      <button 
        className="back-home-button"
        onClick={() => navigate('/')}
      >
        ← Home
      </button>

      <div className="auth-container">
        <h2>Logowanie</h2>
        <form onSubmit={handleLogin}>
          <label>
            Login lub Email:
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </label>
          <label>
            Hasło:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Zaloguj się</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p>Nie masz konta? <a href="/registration">Zarejestruj się</a></p>
        <p><a href="/password-reset">Zapomniałeś hasła?</a></p>
      </div>
    </>
  );
};

export default LoginPage;
