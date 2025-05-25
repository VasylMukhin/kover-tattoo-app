import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './IncomeReportsPage.css';
import dayjs from 'dayjs';

const IncomeReportsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
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
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/all-reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setReservations(res.data.reservations);
      } else {
        setError('Błąd podczas ładowania danych');
      }
    } catch (e) {
      setError('Błąd sieci');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = reservations;

    if (dateFrom) {
      filtered = filtered.filter(r => new Date(r.reservation_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(r => new Date(r.reservation_date) <= new Date(dateTo));
    }

    setFilteredReservations(filtered);
    const total = filtered.reduce((sum, r) => sum + r.price, 0);
    setTotalIncome(total);
  }, [dateFrom, dateTo, reservations]);

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
            {isAdmin && (
              <>
                <li><Link to="/admin/manage-users">Wszyscy użytkownicy</Link></li>
                <li><Link to="/admin/manage-bookings">Wszystkie rezerwacje</Link></li>
                <li><Link to="/admin/manage-places-prices">Zarządzanie miejscami i cenami</Link></li>
                <li><Link to="/admin/income-reports">Raporty dochodów</Link></li>
              </>
            )}
            <li className="dropdown">
              {username ? (
                <>
                  <a href="#" className="konto" onClick={toggleDropdown}>
                    {username}
                  </a>
                  {showDropdown && (
                    <ul className="dropdown-menu">
                      <li><Link to="/profile">Mój profil</Link></li>
                      <li><Link to="/" onClick={handleLogout}>Wyloguj się</Link></li>
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

      <main style={{ padding: '20px', maxWidth: 900, margin: 'auto' }}>
        <h1>Raport dochodów</h1>

        <div style={{ marginBottom: '20px' }}>
          <label>
            Od:
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ marginLeft: 10, marginRight: 20 }}
            />
          </label>
          <label>
            Do:
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ marginLeft: 10 }}
            />
          </label>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th>Użytkownik</th>
              <th>Data rezerwacji</th>
              <th>Miejsce</th>
              <th>Godziny</th>
              <th>Cena</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  Brak danych
                </td>
              </tr>
            ) : (
              filteredReservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.username || 'Nieznany'}</td>
                  <td>{dayjs(r.reservation_date).format('YYYY-MM-DD')}</td>
                  <td>{r.place}</td>
                  <td>{r.hours.join(', ')}</td>
                  <td>{r.price} PLN</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <h2 style={{ marginTop: 20 }}>Całkowity dochód: {totalIncome} PLN</h2>
      </main>
    </>
  );
};

export default IncomeReportsPage;
