import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import PasswordResetPage from './pages/PasswordResetPage';
import PasswordEditPage from './pages/PasswordEditPage';
import UserProfilePage from './pages/users/UserProfilePage';

// Dla uzytkownikow
import BookingPage from './pages/users/BookingPage';
import UserBookingsPage from './pages/users/UserBookingsPage';

// Dla admina
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManagePlacesAndPricesPage from './pages/admin/ManagePlacesAndPricesPage';
import ManageAllBookingsPage from './pages/admin/ManageAllBookingsPage';
import IncomeReportsPage from './pages/admin/IncomeReportsPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/reset-password/:token" element={<PasswordEditPage />} />
        <Route path="/profile" element={<UserProfilePage />} />


        <Route path="/user/booking" element={<BookingPage />} />
        <Route path="/user/my-bookings" element={<UserBookingsPage />} />
           

        <Route path="/admin/manage-users" element={<ManageUsersPage />} />
        <Route path="/admin/manage-places-prices" element={<ManagePlacesAndPricesPage />} />
        <Route path="/admin/manage-bookings" element={<ManageAllBookingsPage />} />
        <Route path="/admin/income-reports" element={<IncomeReportsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
