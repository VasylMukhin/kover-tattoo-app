import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import './BookingPage.css';
import { Link, useNavigate } from 'react-router-dom';

const hoursOptions = Array.from({ length: 12 }, (_, i) => 10 + i);

const BookingPage = () => {
  const [date, setDate] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [prices, setPrices] = useState([]);
  const [selectedHours, setSelectedHours] = useState([]);
  const [reservedHours, setReservedHours] = useState([]);
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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

  useEffect(() => {
    axios.get('http://localhost:5000/api/places-prices', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const placesData = res.data.places;
        if (placesData && placesData.length > 0) {
          const count = placesData[0].amount;
          setPlaces(Array.from({ length: count }, (_, i) => i + 1));
        }
        setPrices(res.data.prices || []);
      })
      .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
    if (date && selectedPlace) {
      axios.get(`http://localhost:5000/api/reservations?date=${date}&place=${selectedPlace}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setReservedHours(res.data.reservedHours || []);
        })
        .catch(err => console.error(err));
    } else {
      setReservedHours([]);
    }
  }, [date, selectedPlace, token]);

  useEffect(() => {
    setSelectedHours([]);
  }, [date, selectedPlace]);

  useEffect(() => {
    const count = selectedHours.length;
    if (count === 0) {
      setPrice(0);
      return;
    }
    const suitablePrice = prices
      .filter(p => p.hours >= count)
      .sort((a, b) => a.hours - b.hours)[0];
    setPrice(suitablePrice ? suitablePrice.price : 0);
  }, [selectedHours, prices]);

  const toggleHour = (hour) => {
    if (reservedHours.includes(hour)) return;
    if (selectedHours.includes(hour)) {
      setSelectedHours(selectedHours.filter(h => h !== hour));
    } else {
      setSelectedHours([...selectedHours, hour].sort((a, b) => a - b));
    }
  };

  const saveReservation = async () => {
    if (!date || !selectedPlace || selectedHours.length === 0) {
      alert('Wybierz datę, miejsce i przynajmniej jedną godzinę.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/reservations', {
        reservation_date: date,
        place: Number(selectedPlace),
        hours: selectedHours,
        price: price,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('✅ Rezerwacja została zapisana!');
      setSelectedHours([]);
      axios.get(`http://localhost:5000/api/reservations?date=${date}&place=${selectedPlace}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setReservedHours(res.data.reservedHours || []));
    } catch (error) {
      setMessage('❌ Błąd podczas zapisu rezerwacji.');
    }
  };

  const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

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

      <div className="booking-page">
        <h2>Zarezerwuj godzinę</h2>

        <div>
          <label>Wybierz datę: </label>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label>Wybierz miejsce: </label>
          <select
            value={selectedPlace}
            onChange={e => setSelectedPlace(e.target.value)}
          >
            <option value="">-- wybierz miejsce --</option>
            {places.map(p => (
              <option key={p} value={p}>Miejsce {p}</option>
            ))}
          </select>
        </div>

        <div className="hours-selection">
          {hoursOptions.map(hour => {
            const isReserved = reservedHours.includes(hour);
            const isSelected = selectedHours.includes(hour);

            return (
              <button
                key={hour}
                onClick={() => toggleHour(hour)}
                disabled={isReserved}
                className={isSelected ? 'selected' : ''}
                title={isReserved ? 'Zarezerwowane' : ''}
              >
                {hour}:00
              </button>
            );
          })}
        </div>

        <div className="price-display">
          <strong>Cena: </strong>{price} zł.
        </div>

        <button
          onClick={saveReservation}
          className="save-reservation-btn"
        >
          Zapisz rezerwację
        </button>

        {message && (
          <p className={`message ${message.startsWith('✅') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </div>
    </>
  );
};

export default BookingPage;
