import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import './ManageAllBookingsPage.css';

const ManageAllBookingsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = res.data.user || res.data;
        if (user?.username?.toLowerCase() === 'kovertattoo') {
          setUsername(user.username);
          setIsAdmin(true);
          fetchReservations();
        } else {
          navigate('/');
        }
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, token]);

  const fetchReservations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/all-reservations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const sortedReservations = res.data.reservations.sort(
          (a, b) => new Date(b.reservation_date) - new Date(a.reservation_date)
        );
        setReservations(sortedReservations);
      }
    } catch (err) {
      console.error(err);
      setMessage('Błąd podczas ładowania rezerwacji.');
    }
  };

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

  if (loading) return <div>Ładowanie...</div>;

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

      <main className="manage-all-bookings-page">
        <h2>Wszystkie rezerwacje</h2>
        {message && <p>{message}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Data</th>
              <th>Artysta</th>
              <th>Miejsce</th>
              <th>Godziny</th>
              <th>Cena</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Brak rezerwacji</td></tr>
            ) : (
              reservations.map(({ _id, reservation_date, place, hours, price, user }) => (
                <tr key={_id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{dayjs(reservation_date).format('YYYY-MM-DD')}</td>
                  <td>{user?.username || 'Nieznany'}</td>
                  <td>{place}</td>
                  <td>{hours.join(', ')}</td>
                  <td>{price} zł</td>
                  <td>
                    <button
                      onClick={() => deleteReservation(_id)}
                      style={{
                        backgroundColor: 'red',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
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

export default ManageAllBookingsPage;
