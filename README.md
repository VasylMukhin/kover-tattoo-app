# 🎨 Kover Tattoo – System Rezerwacji Tatuażu

Aplikacja stworzona jako projekt zespołowy w ramach przedmiotu **Programowanie Aplikacji Internetowych (PAI)**.  
System umożliwia zarządzanie rezerwacjami w salonie tatuażu, kontami użytkowników oraz dostępem administracyjnym.

---

## 👤 Dostępne konta testowe

- **Miki** — `1234`
- **MikiTest** — `1234`
- **kovertattoo** *(konto administratora)* — `1234`

---

## 🛠️ Technologie użyte w projekcie

### Backend:
- **Node.js**, **Express.js**
- **MongoDB (Mongoose)**
- **JWT (JSON Web Token)** — autoryzacja
- **Bcrypt** — szyfrowanie haseł
- **Nodemailer** — obsługa resetu haseł
- **CORS** — dostęp między domenami

### Frontend:
- **React.js**
- **JavaScript (ES6)**
- **CSS Modules**
- **Fetch API**

---

## ✨ Główne funkcjonalności

### 🔒 Użytkownik:
- Rejestracja, logowanie (email/login)
- Resetowanie hasła (email)
- Edycja i usunięcie profilu
- Możliwość rezerwacji wizyty

### 🛠️ Administrator:
- Przegląd i zarządzanie rezerwacjami
- Lista użytkowników z możliwością usuwania
- Edycja dostępnych godzin i cennika

---

## 🧩 Podział zadań i praca zespołowa

Projekt został zrealizowany zespołowo przez trzech członków zespołu.  
Każdy uczestnik miał przypisany zakres odpowiedzialności, a współpraca odbywała się przez system kontroli wersji **GitHub** z użyciem **commitów, gałęzi i pull requestów**.

### 👥 Skład i zakres prac:

1. **Vasyl Mukhin**  
   - Implementacja logowania, rejestracji i panelu użytkownika (frontend)  
   - Konfiguracja backendu i obsługa autoryzacji JWT  
   - Integracja front-back + deploy + struktura repozytorium

2. **Artem Potrymai**  
   - Projektowanie widoków administracyjnych (zarządzanie rezerwacjami, użytkownikami)  
   - Obsługa formularzy i danych w React  
   - Stylizacja komponentów i UI/UX

3. **Mikita Haurylkevich**  
   - Backend: tworzenie modeli MongoDB (User, Reservation, Price)  
   - Wysyłka maili, reset hasła, middleware Express  
   - Testowanie API i komunikacja z frontendem

---

### ✅ Praca zespołowa potwierdzona:

- Każdy członek zespołu wykonywał część zadania i dodawał commity do repozytorium  
- W projekcie znajdują się pull requesty oraz historia zmian świadcząca o pracy grupowej  
- Praca została podzielona równo pomiędzy członków zespołu zgodnie z ich umiejętnościami  
- Wszystkie zmiany były zatwierdzane zgodnie z dobrymi praktykami Git
---

## 📈 Historia zmian i pracy zespołowej

W repozytorium można znaleźć pełną historię zmian (commity), które zostały wykonane przez wszystkich członków zespołu:

### 🔧 Przykładowe commity:
- `VasylMukhin` – "Dodano backend JWT i serwer Express", "Integracja z frontendem", "Initial commit"
- `ArtemPotrymai` – "Dodano panel administratora", "Stylizacja komponentów", "Formularz rezerwacji"
- `sxlitude` – "Modele użytkownika i rezerwacji", "Reset hasła przez email", "Middleware i walidacja"

### 🔁 Pull requesty:
- Pull Request #1 – Dodanie panelu klienta (frontend)
- Pull Request #2 – Funkcjonalność resetowania hasła
- Pull Request #3 – Komponent zarządzania rezerwacjami (admin)

Każdy commit i pull request zawiera rzeczywiste zmiany kodu wykonane przez danego członka zespołu, co potwierdza aktywną współpracę.

Historia zmian jest dostępna w zakładce:  
🔗 [GitHub – Commits](https://github.com/VasylMukhin/kover-tattoo-app/commits/main)

---

---

## 📂 Struktura projektu
kover-tattoo/
│
├── server/ → Backend Node.js + Express
│ ├── models/ → MongoDB Schemas
│ ├── routes/ → API endpoints
│ └── server.js → Punkt startowy aplikacji
│
├── src/ → Frontend React
│ ├── pages/ → Widoki (Login, Home, Admin, itd.)
│ ├── components/ → Komponenty wielokrotnego użytku
│ └── App.js → Główna aplikacja
│
├── public/ → Pliki statyczne
├── team.md → Skład zespołu
└── README.md → Dokumentacja projektu

---

## 🚀 Uruchomienie projektu

### 1. Backend
```bash
cd kover-tattoo/server
node server.js

➡ Serwer dostępny pod adresem: http://localhost:5000
2. Frontend
bash
Копіювати код
cd ../
npm install
npm start
➡ Frontend działa na: http://localhost:3000

✅ Wymagania zaliczeniowe
✔️ Repozytorium z kodem źródłowym aplikacji

✔️ Plik team.md z pełnym składem zespołu

✔️ Dokumentacja w pliku README.md oraz .pdf

✔️ Widoczne commity, pull requesty i podział zadań

✔️ Przydzielony dostęp dla prowadzącego (repozytorium prywatne)
