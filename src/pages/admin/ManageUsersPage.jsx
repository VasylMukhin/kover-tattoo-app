import React, { useEffect, useState } from 'react';
import './ManageUsersPage.css';
import { Link, useNavigate } from 'react-router-dom';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
          if (user.username.toLowerCase() === 'kovertattoo') {
            setIsAdmin(true);
            fetchUsers();
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setError(null);
      } else {
        setError(data.message || 'Błąd podczas ładowania użytkowników');
      }
    } catch (e) {
      setError('Błąd sieci');
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(user => user._id !== id));
      } else {
        alert(data.message || 'Błąd podczas usuwania użytkownika');
      }
    } catch {
      alert('Błąd sieci');
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
      <main className="manage-users-page">
        <h1>Zarządzanie użytkownikami</h1>

        {loading && <div>Ładowanie...</div>}
        {error && <div style={{ color: 'red' }}>Błąd: {error}</div>}

        {!loading && !error && (
          <table border="1" cellPadding="5" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>#</th>
                <th><i className="fas fa-user" aria-label="Użytkownik" title="Użytkownik"></i></th>
                <th>Email</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>Brak użytkowników</td>
                </tr>
              )}
              {users.map(({ _id, username, email }, index) => (
                <tr key={_id}>
                  <td>{index + 1}</td>
                  <td>{username}</td>
                  <td>{email}</td>
                  <td>
                    <button onClick={() => deleteUser(_id)} style={{ backgroundColor: '#d9534f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
};

export default ManageUsersPage;
