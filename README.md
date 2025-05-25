# Kover Tattoo - API

## Dostępne konta użytkowników (Front END)

> Hasła do kont:
> 1. **Miki** — `1234`
> 2. **MikiTest** — `1234`
> 3. **kovertattoo** (admin) — `1234`


## Opis projektu

Backend do systemu rezerwacji w salonie tatuażu Kover Tattoo.  
Umożliwia rejestrację, logowanie, zarządzanie rezerwacjami, resetowanie haseł i edycję profilu.


## Funkcje

- Rejestracja użytkowników
- Logowanie (email lub login)
- Autoryzacja tokenem JWT
- Resetowanie hasła poprzez email
- Pobieranie i edycja profilu użytkownika
- Rezerwacja miejsc i godzin
- Zarządzanie miejscami i cennikiem (dla admina)
- Usuwanie konta
- Pobieranie listy użytkowników (z wyłączeniem konta admina)
- Zarządzanie rezerwacjami (dodawanie, usuwanie, przeglądanie)
  

## Technologie

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Token)
- Bcrypt
- Nodemailer
- Cors


## Uruchomienie

1. Najpierw uruchom serwer backendowy:  
   cd kover-tattoo\server
   node server.js
2. Następnie zainstaluj zależności dla frontend:
    cd kover-tattoo
    npm install
3. Backend działa pod adresem:
    http://localhost:5000
