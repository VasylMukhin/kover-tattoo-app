import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';

const PasswordEditPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Hasła nie są takie same.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Hasło zostało zresetowane pomyślnie. Zaraz nastąpi przekierowanie do logowania...');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage(data.message || 'Coś poszło nie tak.');
      }
    } catch (error) {
      setMessage('Błąd sieci lub serwera.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Ustaw nowe hasło</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nowe hasło:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Potwierdź hasło:
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Zresetuj hasło</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
    </div>
  );
};

export default PasswordEditPage;
