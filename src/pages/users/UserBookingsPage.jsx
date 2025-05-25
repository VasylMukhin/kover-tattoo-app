import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import './UserBookingPage.css';
import { Link, useNavigate } from 'react-router-dom';

const UserBookingPage = () => {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data.user || response.data;
        if (user && user.username) {
          if (user.username.toLowerCase() === 'kovertattoo') {
            navigate('/');  
            return;
          }
          setUsername(user.username);
          setIsAdmin(user.isAdmin || false);
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, [token, navigate]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername('');
    setIsAdmin(false);
    setShowDropdown(false);
    navigate('/login');
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/user-reservations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const sortedReservations = res.data.reservations.sort((a, b) => {
          return new Date(b.reservation_date) - new Date(a.reservation_date);
        });
        setReservations(sortedReservations);
      }
    } catch (err) {
      console.error(err);
      setMessage('Błąd podczas ładowania rezerwacji.');
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const deleteReservation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reservations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Rezerwacja została usunięta.');
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      if (error.response) {
        alert(`Błąd: ${error.response.data.message || 'Nieznany błąd'}`);
        console.error('Server error response:', error.response.data);
      } else {
        alert('Błąd podczas usuwania rezerwacji.');
        console.error('Error', error.message);
      }
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

      <main className="user-booking-page">
        <h2>Twoje rezerwacje</h2>
        {message && <p className="error">{message}</p>}
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Miejsce</th>
              <th>Godziny</th>
              <th>Cena</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Brak rezerwacji</td></tr>
            ) : (
              reservations.map(({ _id, reservation_date, place, hours, price }) => (
                <tr key={_id}>
                  <td>{dayjs(reservation_date).format('YYYY-MM-DD')}</td>
                  <td>{place}</td>
                  <td>{hours.join(', ')}</td>
                  <td>{price} zł</td>
                  <td>
                    <button
                      onClick={() => deleteReservation(_id)}
                      className="delete-btn"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default UserBookingPage;
