import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfilePage.css';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [loginMessage, setLoginMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editLoginMode, setEditLoginMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const token = localStorage.getItem('token');

 useEffect(() => {
  if (!token) {
    navigate('/login');
    return;
  }

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.user || response.data;

      if (user && user.username) {
        setUsername(user.username);
        setNewUsername(user.username);
        setEmail(user.email || '');

       
        if (user.username.toLowerCase() === 'kovertattoo') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      navigate('/login');
    }
  };
  fetchUserProfile();
}, [navigate, token]);


  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('Nowe hasło i potwierdzenie muszą być takie same.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPasswordMessage('Hasło zostało zmienione pomyślnie.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(response.data.message || 'Coś poszło nie tak.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Błąd serwera.');
    }
  };

  const handleUsernameSave = async () => {
    setLoginMessage(null);
    setLoginError(null);

    if (!newUsername.trim()) {
      setLoginError('Login nie może być pusty.');
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE}/api/change-username`,
        { newUsername },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setUsername(newUsername);
        localStorage.setItem('username', newUsername);
        setEditLoginMode(false);
        setLoginMessage('Login został zmieniony pomyślnie.');
      } else {
        setLoginError(response.data.message || 'Nie udało się zmienić loginu.');
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Błąd serwera.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna.')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/api/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      navigate('/');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Błąd podczas usuwania konta.');
    }
  };

  return (
    <>
      <header>
        <nav className="navbar">
          <Link to="/" className="logo">Kovёr Tattoo</Link>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {isAdmin ? (
              <>
                <li><Link to="/admin/manage-users">Wszyscy użytkownicy</Link></li>
                <li><Link to="/admin/manage-bookings">Wszystkie rezerwacje</Link></li>
                <li><Link to="/admin/manage-places-prices">Zarządzanie miejscami i cenami</Link></li>
                <li><Link to="/admin/income-reports">Raporty dochodów</Link></li>
              </>
            ) : (
              <li><Link to={username ? "/user/booking" : "/login"}>Rezerwuj usługę</Link></li>
            )}
            <li className="dropdown">
              {username ? (
                <>
                  <a href="#" className="konto" onClick={toggleDropdown}>
                    {username}

                  </a>
                  {showDropdown && (
                    <ul className="dropdown-menu">
                      <li><Link to={"/profile"}>Mój profil</Link></li>
                      {!isAdmin && <li><Link to="/user/my-bookings">Moje rezerwacje</Link></li>}
                      <li><Link to="/" onClick={handleLogout} className="dropdown-menu-link">Wyloguj się</Link></li>
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <a href="#" className="konto" onClick={toggleDropdown}>
                    Konto
                   
                  </a>
                  {showDropdown && (
                    <ul className="dropdown-menu">
                      <li><Link to="/login">Zaloguj się</Link></li>
                      <li><Link to="/registration">Zarejestruj się</Link></li>
                    </ul>
                  )}
                </>
              )}
            </li>
          </ul>
          <div className="burger-menu" onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </div>
        </nav>
      </header>

      <main className="user-profile-page">
        <h2>Twój profil</h2>

        <div className="profile-edit-section">
          <div className="field-row">
            <label>Login:</label>
            {!editLoginMode ? (
              <>
                <input type="text" value={username} disabled />
                {username.toLowerCase() !== 'kovertattoo' && (
                  <button onClick={() => { setEditLoginMode(true); setLoginError(null); setLoginMessage(null); }}>Zmień</button>
                )}
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  autoFocus
                />
                <button onClick={handleUsernameSave}>Zapisz</button>
                <button className="anuluj-btn" onClick={() => {setEditLoginMode(false); setNewUsername(username); setLoginError(null); setLoginMessage(null);}}> Anuluj </button>
              </>
            )}
          </div>

          <div className="field-row">
            <label>Email:</label>
            <input type="email" value={email} disabled />
          </div>
        </div>

        <section className="change-password-section">
          <h3>Zmień hasło</h3>

          <form onSubmit={handlePasswordChange}>
            <div>
              <label>Aktualne hasło:</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Nowe hasło:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Potwierdź nowe hasło:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordMessage && <p className="success-message">{passwordMessage}</p>}
            {passwordError && <p className="error-message">{passwordError}</p>}
            <button type="submit">Zmień hasło</button>
          </form>
        </section>
        {username.toLowerCase() !== 'kovertattoo' && (
          <button className="delete-account-btn" onClick={handleDeleteAccount}>
            Usuń konto
          </button>
        )}
      </main>
    </>
  );
};

export default UserProfilePage;
