import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ManagePlacesAndPricesPage.css';

const ManagePlacesAndPricesPage = () => {
  const [amount, setAmount] = useState(0);
  const [prices, setPrices] = useState([
    { hours: 3, price: 0 },
    { hours: 7, price: 0 },
    { hours: 12, price: 0 },
  ]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
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
        const res = await fetch('http://localhost:5000/api/user-profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const user = data.user || data;
        if (user && user.username) {
          if (user.username.toLowerCase() !== 'kovertattoo') {
            navigate('/');
            return;
          }
          setUsername(user.username);
          setIsAdmin(true);
          fetchData(); 
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      }
    };

    fetchUserProfile();
  }, [navigate, token]);

  const fetchData = () => {
    fetch('http://localhost:5000/api/places-prices', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.places.length > 0) {
            setAmount(data.places[0].amount);
          }
          const pricesFromServer = [3, 7, 12].map(h => {
            const p = data.prices.find(pr => pr.hours === h);
            return p ? { hours: h, price: p.price } : { hours: h, price: 0 };
          });
          setPrices(pricesFromServer);
        } else {
          setMessage('Błąd podczas ładowania danych');
        }
      })
      .catch(() => setMessage('Błąd sieci'))
      .finally(() => setLoading(false));
  };

  const updateAmount = async () => {
    setMessage('');
    if (amount < 0) {
      setMessage('Ilość miejsc nie może być ujemna');
      return;
    }

    const res = await fetch('http://localhost:5000/api/places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    setMessage(data.success ? 'Ilość miejsc została zaktualizowana.' : data.message || 'Błąd serwera.');
  };

  const updatePrice = async (hours, newPrice) => {
    setMessage('');
    if (newPrice < 0) {
      setMessage('Cena nie może być ujemna');
      return;
    }

    const res = await fetch('http://localhost:5000/api/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hours, price: newPrice }),
    });
    const data = await res.json();
    if (data.success) {
      setPrices(prev => prev.map(p => (p.hours === hours ? { ...p, price: newPrice } : p)));
      setMessage('Cena została zaktualizowana.');
    } else {
      setMessage(data.message || 'Błąd serwera.');
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

      <main className="manage-places-prices-page">
        <h1>Zarządzanie miejscami i cenami</h1>

        <div style={{ marginBottom: '20px' }}>
          <label>
            Ilość miejsc:&nbsp;
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={0}
            />
          </label>
          <button onClick={updateAmount} style={{ marginLeft: '10px' }}>Zapisz</button>
        </div>

        <div>
          <h2>Ceny za godziny</h2>
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Godziny</th>
                <th>Cena</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {prices.map(({ hours, price }) => (
                <tr key={hours}>
                  <td>{hours}</td>
                  <td>
                    <input
                      type="number"
                      value={price}
                      min={0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPrices((prev) =>
                          prev.map(p => (p.hours === hours ? { ...p, price: val } : p))
                        );
                      }}
                    />
                  </td>
                  <td>
                    <button onClick={() => updatePrice(hours, prices.find(p => p.hours === hours).price)}>
                      Zapisz
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {message && <p>{message}</p>}
      </main>
    </>
  );
};

export default ManagePlacesAndPricesPage;
