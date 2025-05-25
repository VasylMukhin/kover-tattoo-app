import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Auth.css';

const PasswordResetPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage('❌ Błąd sieci lub serwera.');
    }
  };

  return (
    <>
      <button 
        className="back-home-button"
        onClick={() => navigate('/login')}
      >
        ← Login
      </button>
      <div className="auth-container">
        <h2>Resetowanie hasła</h2>
        <form onSubmit={handlePasswordReset}>
          <label>
            Podaj swój email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit">Wyślij instrukcje</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
      </div>
    </>
  );
};

export default PasswordResetPage;
