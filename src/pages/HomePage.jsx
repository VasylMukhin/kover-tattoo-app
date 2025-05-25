import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const [username, setUsername] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  const isAdmin = username && username.toLowerCase() === 'kovertattoo';

  const handleLogout = () => {
    const confirmed = window.confirm('Czy na pewno chcesz się wylogować?');
    if (confirmed) {
      localStorage.removeItem('username');
      setUsername(null);
      setShowDropdown(false);
      navigate('/');
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
                <li><Link to={username ? "user/booking" : "/login"}>Rezerwuj usługę</Link></li>
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

      <main>
        <section className="hero">
          <h1>KOVЁR</h1>
          <p>Twoje miejsce na unikalne, artystyczne tatuaże.</p>
              {!isAdmin && (
                <Link to={username ? "user/booking" : "/login"} className="cta-button">
                  Zarezerwuj teraz
                </Link>
              )}
        </section>

        <section className="contact-section">
          <div className="left-text">
            <h3 className="highlighted-title">Poszukujemy artystów do KOVЁR TATTOO!</h3>
            <p className="intro-text">
              Jesteś kreatywnym tatuażystą, który pragnie rozwijać swoją pasję w inspirującym miejscu? Zapewniamy wyjątkowe warunki do pracy i współpracy w naszym salonie.
            </p>
            <p className="detailed-text">
              Salon tatuażu KOVЁR TATTOO oferuje profesjonalne stanowiska oraz pełną obsługę zapisu na sesje tatuażu. Chcemy wspierać Cię w rozwoju i budowaniu relacji z klientami, dając Ci przestrzeń do twórczości.
            </p>
            <h4 className="subheading">Co oferujemy?</h4>
            <ul className="offer-list">
              <li><i className="fas fa-check-circle"></i> <strong>Wynajem profesjonalnych stanowisk:</strong> w pełni wyposażone stanowiska, zapewniające komfort, higienę i bezpieczeństwo pracy.</li>
              <li><i className="fas fa-check-circle"></i> <strong>Elastyczne warunki wynajmu:</strong> dopasujemy ofertę do Twoich potrzeb i grafiku pracy, abyś mógł w pełni wykorzystać swój potencjał.</li>
            </ul>
            <p className="call-to-action">
              Szukasz miejsca, w którym będziesz mógł swobodnie tworzyć, cieszyć się komfortem pracy i profesjonalną obsługą? <strong>Skontaktuj się z nami już dziś!</strong>
            </p>
          </div>

          <div className="contact-info">
            <h2>Skontaktuj się z nami</h2>
            <p><i className="fas fa-phone-alt"></i> <a href="tel:+48731682186">+48 731 682 186</a></p>
            <p><i className="fas fa-envelope"></i> <a href="mailto:kraken.tattoo.studio.warszawa@gmail.com">kraken.tattoo.studio.warszawa@gmail.com</a></p>
            <p><i className="fas fa-map-marker-alt"></i> <a href="https://www.google.com/maps/place/Kraken+Tattoo+Studio/@52.2329299,21.0234163,19z" target="_blank" rel="noopener noreferrer">Smolna 11 lok.5, Warszawa, PL, 00-375</a></p>
            <p><i className="fab fa-instagram"></i> <a href="https://www.instagram.com/kover.tattoo.studio/" target="_blank" rel="noopener noreferrer">Instagram</a></p>
          </div>
        </section>
      </main>

      <footer>
        <p>© 2025 Kovёr Tattoo. Wszystkie prawa zastrzeżone.</p>
      </footer>
    </>
  );
};

export default HomePage;
