# 🤖 Wymień Forse Bot

Bot Discord dla serwera Wymień Forse z pełnym systemem wymian, prowizji, ticketów i reputacji.

## 📋 Wymagania
- Node.js 16.9+
- Konto Discord Developer Portal

## ⚙️ Instalacja

1. **Zainstaluj zależności:**
```bash
npm install
```

2. **Skonfiguruj `.env`:**
```
Skopiuj .env.example do .env i uzupełnij wartości:
```
```
TOKEN=           → Token twojego bota (Discord Developer Portal → Bot → Reset Token)
CLIENT_ID=       → Application ID (General Information)
GUILD_ID=        → ID twojego serwera (Prawy klik na serwer → Kopiuj ID)

OPINIE_CHANNEL_ID=       → ID kanału gdzie mają lecieć +reputy
LEGIT_CHECK_CHANNEL_ID=  → ID kanału legit-check (nazwa się auto-aktualizuje)
TICKET_CATEGORY_ID=      → ID kategorii gdzie tworzyć się mają tickety
WELCOME_CHANNEL_ID=      → ID kanału powitalnego

VERIFIED_ROLE_ID=  → ID roli po weryfikacji
STAFF_ROLE_ID=     → ID roli staff (do ticketów)
ADMIN_ROLE_ID=     → ID roli admin
```

3. **Zarejestruj slash komendy:**
```bash
npm run deploy
```

4. **Uruchom bota:**
```bash
npm start
```

---

## 📌 Komendy

### Dla wszystkich
| Komenda | Opis |
|---|---|
| `/rep @user metoda kwota` | Dodaj +rep użytkownikowi |
| `/oblicz otrzymam kwota z na` | Oblicz ile otrzymasz |
| `/oblicz wyslac kwota z na` | Oblicz ile musisz wysłać |
| `/przenies-rangi @konto` | Przenieś rangi na inne konto |
| `/odzyskaj-rangi klucz` | Odzyskaj rangi przy użyciu klucza |
| `/help` | Lista komend |

### Staff (ManageMessages)
| Komenda | Opis |
|---|---|
| `/send wiadomosc [#kanal]` | Wyślij wiadomość jako bot |
| `/embed tytul opis [kolor] [obrazek]` | Wyślij embed |

### Admin
| Komenda | Opis |
|---|---|
| `/setup weryfikacja [#kanal]` | Wyślij panel weryfikacji |
| `/setup panel_klienta [#kanal]` | Wyślij panel klienta |
| `/setup prowizje [#kanal]` | Wyślij panel prowizji |
| `/setup oblicz [#kanal]` | Wyślij kalkulator prowizji |
| `/setup ticket [#kanal]` | Wyślij panel ticketów |

---

## 🔄 Auto-aktualizacja nazwy kanałów
Po każdym `/rep` automatycznie aktualizują się:
- `opinie→LICZBA` 
- `legit-check→LICZBA`

> ⚠️ Discord rate-limituje zmianę nazwy kanału do 2x na 10 minut — przy dużym ruchu może być lekkie opóźnienie.

---

## 📂 Struktura plików
```
discord-bot/
├── index.js              # Główny plik
├── deploy-commands.js    # Rejestracja komend
├── data.json             # Baza danych (auto-tworzy się)
├── .env                  # Konfiguracja
├── commands/             # Slash komendy
│   ├── rep.js
│   ├── embed.js
│   ├── setup.js
│   ├── oblicz.js
│   ├── send.js
│   ├── przenies-rangi.js
│   ├── odzyskaj-rangi.js
│   └── help.js
├── events/
│   ├── ready.js
│   └── guildMemberAdd.js
└── utils/
    ├── db.js             # Prosta baza JSON
    ├── embeds.js         # Wszystkie embeddy
    ├── selectHandler.js  # Obsługa selectów
    ├── buttonHandler.js  # Obsługa przycisków
    └── modalHandler.js
```
