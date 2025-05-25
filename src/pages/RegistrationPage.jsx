import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('❌ Hasła się nie zgadzają.');
      return;
    }

    fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('username', username);
          localStorage.setItem('token', data.token);
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
        <h2>Rejestracja</h2>
        <form onSubmit={handleRegister}>
          <label>
            Login:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <label>
            Potwierdź hasło:
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>
          <button type="submit">Zarejestruj się</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <p>Masz już konto? <a href="/login">Zaloguj się</a></p>
      </div>
    </>
  );
};

export default RegistrationPage;
