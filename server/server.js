const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = '1234'; 

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://nikitos28042004:m2FLuNFnbpEurTDW@cloud.h16ibeg.mongodb.net/kovertattoo'); 





//1 Schemat
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  
});

const User = mongoose.model('User', userSchema);





//2 Schemat
const placeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
});

const Place = mongoose.model('Place', placeSchema);





//3 Schemat
const priceSchema = new mongoose.Schema({
  hours: { type: Number, required: true, enum: [3, 7, 12] },
  price: { type: Number, required: true },
});

const Price = mongoose.model('Price', priceSchema);





//4 Schemat
const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservation_date: { type: Date, required: true },
  place: { type: Number, required: true },
  hours: { type: [Number], required: true },
  price: { type: Number, required: true },
});

const Reservation = mongoose.model('Reservation', reservationSchema);





//Nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kovertattoobot@gmail.com',     
    pass: 'iqcntoxdmhhcydpi'             
  }
});





// 6 Schemat
const passwordResetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 } 
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);





//7 Middleware 
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Brak tokena autoryzacji.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, username }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Niepoprawny token.' });
  }
};









// I. Rejestracja
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !password || !username)
      return res.status(400).json({ success: false, message: '❌ Email, login i hasło są wymagane.' });

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail)
      return res.status(400).json({ success: false, message: '❌ Użytkownik z tym emailem już istnieje.' });

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername)
      return res.status(400).json({ success: false, message: '❌ Użytkownik z tym loginem już istnieje.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, username, passwordHash });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
      );


    
    const mailOptions = {
      from: '"Kover" <kovertattoobot@gmail.com>',
      to: email,
      subject: 'Potwierdzenie rejestracji w Kovёr Tattoo',
      text: `Cześć ${username}!\n\nDziękujemy za rejestrację w Kovёr Tattoo.\n\nPozdrawiamy,\nZespół Kovёr Tattoo`,
      html: `<h2>Cześć ${username}!</h2><p>Dziękujemy za rejestrację w <strong>Kovёr Tattoo</strong>.</p><p>Pozdrawiamy,<br/>Zespół Kovёr Tattoo</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Błąd podczas wysyłania maila:', error);
      } else {
        console.log('Email wysłany: ' + info.response);
      }
    });

    res.json({ success: true, message: 'Rejestracja przebiegła pomyślnie.', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: '❌ Błąd serwera.' });
  }
});










// II. Logowanie
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;  // login to email lub username

  const user = await User.findOne({
    $or: [{ email: login }, { username: login }],
  });

  if (!user) return res.status(400).json({ success: false, message: '❌ Niepoprawny login lub hasło.' });

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) return res.status(400).json({ success: false, message: '❌ Niepoprawny login lub hasło.' });

  const token = jwt.sign({ userId: user._id, email: user.email, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token, email: user.email, username: user.username });
});










// III. Zapytanie o reset hasła — wysłanie maila z instrukcjami
app.post('/api/password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Podaj email.' });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'Jeśli istnieje konto z tym emailem, wysłaliśmy instrukcję resetowania hasła.' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await PasswordReset.findOneAndDelete({ userId: user._id }); 
    const resetRecord = new PasswordReset({ userId: user._id, token });
    await resetRecord.save();

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      from: '"Kover" <kovertattoobot@gmail.com>',
      to: email,
      subject: 'Instrukcje resetowania hasła',
      text: `Cześć ${user.username}!\n\nKliknij w link, aby zresetować hasło:\n${resetLink}\n\nJeśli nie prosiłeś o resetowanie, zignoruj tę wiadomość.`,
      html: `<p>Cześć <strong>${user.username}</strong>!</p><p>Kliknij w link, aby zresetować hasło:<br/><a href="${resetLink}">${resetLink}</a></p><p>Jeśli nie prosiłeś o resetowanie, zignoruj tę wiadomość.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Błąd wysyłania maila:', error);
      } else {
        console.log('Email resetu hasła wysłany: ' + info.response);
      }
    });

    res.json({ success: true, message: 'Jeśli istnieje konto z tym emailem, wysłaliśmy instrukcję resetowania hasła.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});









// IV. Potwierdzenie resetu hasła
app.post('/api/password-reset/confirm', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token i hasło są wymagane.' });
  }

  try {
    const resetRecord = await PasswordReset.findOne({ token });
    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Token nie jest poprawny lub wygasł.' });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Użytkownik nie znaleziony.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.passwordHash = hashedPassword;
    await user.save();

    await PasswordReset.deleteOne({ _id: resetRecord._id });

    res.json({ success: true, message: 'Hasło zostało zaktualizowane.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});









// v. Pobieranie profilu aktualnego użytkownika
app.get('/api/user-profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('username email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony.' });
    }
    res.json({ success: true, username: user.username, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// VI. Zmiana hasła
app.post('/api/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Wymagane obecne i nowe hasło.' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony.' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Niepoprawne obecne hasło.' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Hasło zostało zmienione pomyślnie.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// VII. Zmiana loginu
app.post('/api/change-username', authMiddleware, async (req, res) => {
  const { newUsername } = req.body;
  if (!newUsername || newUsername.trim() === '') {
    return res.status(400).json({ success: false, message: 'Login nie może być pusty.' });
  }

  try {
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser && existingUser._id.toString() !== req.user.userId) {
      return res.status(400).json({ success: false, message: 'Login jest już zajęty.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony.' });

    user.username = newUsername;
    await user.save();

    res.json({ success: true, message: 'Login został zmieniony pomyślnie.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// VIII. Usunięcie konta
app.delete('/api/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

   
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony.' });
    }

    

    res.json({ success: true, message: 'Konto zostało usunięte pomyślnie.' });
  } catch (error) {
    console.error('Błąd podczas usuwania konta:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// IX. Pobieranie wszystkich użytkowników (tylko username i email) (dla admina)
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    // Szukamy wszystkich użytkowników poza 'kovertattoo'
    const users = await User.find({ username: { $ne: 'kovertattoo' } }, 'username email');
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// X. Usunięcie użytkownika po ID (dla admina)
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony.' });
    }

    res.json({ success: true, message: 'Użytkownik został usunięty.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XI. Pobieranie miejsca i ceny (dla admina)
app.get('/api/places-prices', authMiddleware, async (req, res) => {
  try {
    const places = await Place.find();
    const prices = await Price.find();
    res.json({ success: true, places, prices });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XII. Dodawanie lub zaktualizowanie ilości miejsc (dla admina)
app.post('/api/places', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ success: false, message: 'Niepoprawna ilość miejsc.' });
    }

    let place = await Place.findOne();
    if (!place) {
      place = new Place({ amount });
    } else {
      place.amount = amount;
    }
    await place.save();

    res.json({ success: true, place });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XIII. Dodawanie lub zaktualizowanie ceny za określone godziny (dla admina)
app.post('/api/prices', authMiddleware, async (req, res) => {
  try {
    const { hours, price } = req.body;

    if (![3, 7, 12].includes(hours)) {
      return res.status(400).json({ success: false, message: 'Niepoprawna liczba godzin.' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ success: false, message: 'Niepoprawna cena.' });
    }

    let priceRecord = await Price.findOne({ hours });
    if (!priceRecord) {
      priceRecord = new Price({ hours, price });
    } else {
      priceRecord.price = price;
    }
    await priceRecord.save();

    res.json({ success: true, price: priceRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XIV. Pobieranie zarezerwowanych godzin dla określonej daty i miejsca
app.get('/api/reservations', authMiddleware, async (req, res) => {
  const { date, place } = req.query;  // oczekiwane date (YYYY-MM-DD) i place (numer miejsca)
  if (!date || !place) {
    return res.status(400).json({ success: false, message: 'Należy podać datę i miejsce.' });
  }

  const dateObj = new Date(date);
  try {
    const reservations = await Reservation.find({
      reservation_date: dateObj,
      place: Number(place)
    });
    let reservedHours = [];
    reservations.forEach(reservation => {
      reservedHours = reservedHours.concat(reservation.hours);
    });
    // Usuwamy duplikaty
    reservedHours = [...new Set(reservedHours)];
    res.json({ success: true, reservedHours });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XV. Dodawanie nowej rezerwacji
app.post('/api/reservations', authMiddleware, async (req, res) => {
  const { reservation_date, place, hours, price } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Użytkownik nie jest zalogowany' });
  }

  try {
    const newReservation = new Reservation({
      user: req.user.userId,            // <- tutaj przekazujemy użytkownika
      reservation_date: new Date(reservation_date),
      place: Number(place),
      hours,
      price,
    });

    await newReservation.save();
    res.json({ success: true, message: 'Rezerwacja została zapisana' });
  } catch (err) {
    console.error('Błąd podczas zapisywania rezerwacji:', err);
    res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
});










// XVI. Pobieranie rezerwacji aktualnego użytkownika
app.get('/api/user-reservations', authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.userId });
    res.json({ success: true, reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XVI. Usunięcie rezerwacji po ID 
app.delete('/api/reservations/:id', authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Rezerwacja nie znaleziona.' });
    }

    const currentUsername = req.user.username;

    if (currentUsername !== 'kovertattoo' && reservation.user.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Brak dostępu do usunięcia tej rezerwacji.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentUsername !== 'kovertattoo' && reservation.reservation_date < today) {
      return res.status(400).json({ success: false, message: 'Nie można usuwać przeszłych rezerwacji.' });
    }

    await reservation.deleteOne();
    res.json({ success: true, message: 'Rezerwacja usunięta.' });
  } catch (err) {
    console.error('Błąd podczas usuwania rezerwacji:', err);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










// XVII. Pobieranie wszystkich rezerwacji (dla admina)
app.get('/api/all-reservations', authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('user', 'username');
    res.json({ success: true, reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Błąd serwera.' });
  }
});










app.listen(PORT, () => {
  console.log(`✅ Port Serwera: ${PORT}`);
});
