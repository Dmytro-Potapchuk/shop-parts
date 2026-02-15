# Sklep Motoryzacyjny - API Backendu (partsShop)

## Zespół Projektowy
- Dmytro Potapchuk

## Opis Projektu
Backend API dla internetowego sklepu motoryzacyjnego. System zarządza produktami (częściami samochodowymi), użytkownikami, procesem składania zamówień oraz autentykacją. Zbudowany przy użyciu frameworka NestJS.

## Główne Funkcjonalności
- Rejestrację i logowanie użytkowników
- Autentykację opartą na JWT
- Obsługę **Access Token + Refresh Token**
- Kontrolę dostępu opartą na rolach (RBAC)
- Operacje CRUD na częściach
- Symulację zakupu części
- Zarządzanie stanem magazynowym
- Automatycznie generowaną dokumentację API (Swagger)
- Testy jednostkowe i E2E
- Automatyczny pipeline CI/CD

Projekt przygotowany zgodnie z dobrymi praktykami bezpieczeństwa i testowania.

# 🏗 Architektura
Projekt oparty na modularnej architekturze NestJS:

# ⚙️ Technologie

| Warstwa | Technologia |
|----------|------------|
| Framework | NestJS |
| Język | TypeScript |
| ORM | TypeORM |
| Baza danych | MySQL (dev/prod), SQLite (test) |
| Autentykacja | JWT |
| Hashowanie | bcrypt |
| Dokumentacja | Swagger |
| Testy | Jest + Supertest |
| CI/CD | GitHub Actions |

# 🔐 Bezpieczeństwo

## ✅ JWT Authentication
- Access Token
- Refresh Token
- Konfigurowalny czas wygasania
- Oddzielne sekrety dla access i refresh

## ✅ Refresh Token Flow
- Refresh token zapisywany w bazie
- Refresh token hashowany (bcrypt)
- Możliwość unieważnienia (logout)

## ✅ RBAC (Role-Based Access Control)
Role:
- `admin`
- `client`

Zaimplementowano:
- Dekorator `@Roles()`
- Globalny `RolesGuard`
- Zabezpieczenie endpointów administracyjnych

## ✅ Rate Limiting
Globalny `ThrottlerGuard`
- Ochrona przed spamem i brute-force

## ✅ Hashowanie haseł
- bcrypt (salt rounds 10)

## ✅ Walidacja danych
- class-validator
- class-transformer
- whitelist + forbidNonWhitelisted

---

# 🧪 Testy

Projekt zawiera:

### ✅ Testy jednostkowe
- Services
- Controllers
- Guards (RolesGuard, ThrottlerGuard)
- GlobalExceptionFilter
- Interceptors
- AuthModule
- AppModule
- Migracje
- TypeORM CLI config

### ✅ Testy E2E
- Rejestracja użytkownika
- Logowanie
- Dostęp do chronionych endpointów
- Tworzenie części
- Zakup

### ✅ Pokrycie kodu

Średnie pokrycie testami:

~85–90%

# 🚀 CI/CD – GitHub Actions

Pipeline uruchamia się automatycznie przy:
- Push do `main`
- Pull Request do `main`

Workflow:
- Instalacja zależności
- Uruchomienie testów
- Generowanie coverage
- Fail build przy błędach testów

Plik:
.github/workflows/backend-ci.yml

## Wymagania Wstępne
- Node.js (zalecana wersja LTS, np. v18.x lub nowsza)
- Menedżer pakietów npm lub yarn
- Działający serwer bazy danych MySQL (lub inna baza danych zgodna z konfiguracją TypeORM)

## Instalacja i Uruchomienie Lokalne

1.  **Klonowanie Repozytorium:**
    ```bash
    git clone <URL_TWOJEGO_REPOZYTORIUM_BACKENDU>
    cd partsShop
    ```

2.  **Instalacja Zależności:**
    ```bash
    npm install
    ```
    lub jeśli używasz yarn:
    ```bash
    yarn install
    ```

3.  **Konfiguracja Środowiska:**
    * Skopiuj plik `.env.example` (jeśli istnieje) do nowego pliku o nazwie `.env`.
    * Wypełnij plik `.env` odpowiednimi danymi konfiguracyjnymi:
      ```dotenv
      # Ustawienia Bazy Danych
      DB_HOST=localhost
      DB_PORT=3306
      DB_USER=twoj_uzytkownik_db
      DB_PASS=twoje_haslo_db
      DB_NAME=nazwa_twojej_bazy
      TYPEORM_SYNCHRONIZE=true # Ustaw na `false` na produkcji!

      # Ustawienia JWT
      JWT_SECRET=TWOJ_BARDZO_SILNY_I_UNIKALNY_SEKRET_JWT
      JWT_EXPIRES_IN=1h # np. 1h, 7d, 3600s

      # Port aplikacji
      PORT=3000
      ```
    * **Ważne:** `TYPEORM_SYNCHRONIZE=true` jest przeznaczone **tylko dla środowiska deweloperskiego**. Na produkcji używaj migracji TypeORM.
    * **Ważne:** `JWT_SECRET` musi być silnym, losowym ciągiem znaków.

4.  **Konfiguracja Bazy Danych:**
    * Upewnij się, że Twój serwer MySQL jest uruchomiony.
    * Stwórz bazę danych o nazwie podanej w `DB_NAME` w pliku `.env`.
    * Jeśli `TYPEORM_SYNCHRONIZE=true`, schemat bazy danych zostanie automatycznie utworzony/zaktualizowany przy pierwszym uruchomieniu aplikacji.
  
    * 🗄 Migracje

Tworzenie migracji:

npm run typeorm migration:generate -- -n MigrationName


Uruchomienie migracji:

npm run typeorm migration:run

5.  **Uruchomienie Aplikacji (tryb deweloperski):**
    ```bash
    npm run start:dev
    ```
    lub
    ```bash
    yarn start:dev
    ```
    Serwer powinien być dostępny pod adresem `http://localhost:3000` (lub innym portem zdefiniowanym w `.env` jako `PORT`).

## Dokumentacja API (Swagger)
Po uruchomieniu aplikacji, interaktywna dokumentacja API generowana przez Swagger UI będzie dostępna pod adresem:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Główne Endpointy API (Przykłady)
Pełna lista endpointów dostępna jest w dokumentacji Swagger.
- `POST /users/register` - Rejestracja nowego użytkownika
- `POST /users/login` - Logowanie użytkownika
- `GET /parts` - Pobranie listy wszystkich części
- `POST /parts` - Dodanie nowej części (wymaga autoryzacji admina)
- `GET /parts/:id` - Pobranie szczegółów konkretnej części
- `PUT /parts/:id` - Aktualizacja części (wymaga autoryzacji admina)
- `DELETE /parts/:id` - Usunięcie części (wymaga autoryzacji admina)
- `POST /parts/:id/purchase` - Symulacja zakupu części (może wymagać autoryzacji)

## Dostępne Skrypty NPM/Yarn
- `npm run build` / `yarn build` - Kompilacja aplikacji do kodu JavaScript.
- `npm run start` / `yarn start` - Uruchomienie aplikacji w trybie produkcyjnym (po wcześniejszym zbudowaniu).
- `npm run start:dev` / `yarn start:dev` - Uruchomienie aplikacji w trybie deweloperskim z automatycznym przeładowywaniem.
- `npm run lint` / `yarn lint` - Sprawdzenie kodu za pomocą ESLint.
- `npm run test` / `yarn test` - Uruchomienie testów jednostkowych.


## Osiągnięcia Projektowe

Wdrożono:

✔ Pełne RBAC
✔ Globalny RolesGuard
✔ Refresh Token z hashowaniem
✔ GlobalExceptionFilter z pełnym pokryciem testowym
✔ Globalny LoggingInterceptor
✔ Globalny Rate Limiting
✔ Testy jednostkowe + E2E
✔ CI/CD GitHub Actions
✔ Pokrycie kodu ~90%
✔ Migracje TypeORM
✔ Środowisko testowe SQLite
---
