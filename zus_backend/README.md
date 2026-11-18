# ZUS & e-ZLA (L4) REST API Backend

Kompletna, autonomiczna usługa backendowa REST API bez frontendu dla **Zakładu Ubezpieczeń Społecznych (ZUS)** oraz **elektronicznych zwolnień lekarskich (e-ZLA / L4)**, stworzona w czystym Pythonie (zero zewnętrznych bibliotek).

System obsługuje pełny cykl życia zwolnienia lekarskiego (wystawienie przez lekarza z PWZ, widok pacjenta, widok pracodawcy z ochroną danych medycznych RODO) oraz operacje na koncie ZUS (I i II filar, składki, wpłaty na indywidualny rachunek NRS, symulator emerytury i e-wizyty).

---

## 🚀 Szybki start

### Uruchomienie serwera
```bash
# Uruchomienie na domyślnym porcie 8795
python3 -m zus_backend.server 8795
```

Po uruchomieniu dostępne są:
* 📖 **Interaktywna dokumentacja Swagger UI**: [http://localhost:8795/docs](http://localhost:8795/docs)
* ⚙️ **Specyfikacja OpenAPI 3.0 (JSON)**: [http://localhost:8795/openapi.json](http://localhost:8795/openapi.json)
* 🩺 **Health Check**: [http://localhost:8795/api/health](http://localhost:8795/api/health)

### Uruchomienie testów
```bash
python3 -m unittest discover -s zus_backend/tests
```
*(23 testy jednostkowe i integracyjne: kalkulator zasiłków, baza danych, endpointy HTTP)*

---

## 👥 Konta demonstracyjne i Tokeny

W usłudze zdefiniowano gotowe role i konta testowe:

| Użytkownik | Rola | Identyfikator | Token Bearer (`Authorization: Bearer <token>`) |
| :--- | :--- | :--- | :--- |
| **Marta Kowalska** | Ubezpieczony (Etat) | PESEL: `90031501245` | `token-marta-90031501245` |
| **Jan Wiśniewski** | Ubezpieczony (JDG) | PESEL: `82041203471`, NIP: `6762451299` | `token-jan-82041203471` |
| **dr n. med. Tomasz Zieliński** | Lekarz | PWZ: `7891234` | `token-lekarz-pwz-7891234` |
| **TechPolska Sp. z o.o.** | Płatnik (Pracodawca/Kadry) | NIP: `5252525259` | `token-platnik-techpolska` |
| **Anna Nowak** | Urzędnik / Inspektor ZUS | Oddział I Warszawa | `token-urzednik-zus-admin` |

---

## 🏛️ Logika biznesowa i zgodność z polskim prawem

### 1. Zwolnienia lekarskie e-ZLA (L4)
* **Ochrona danych medycznych (RODO / tajemnica lekarska)**: Pracodawca widzi okres niezdolności i zalecenia (1 - chory powinien leżeć, 2 - chory może chodzić), ale kod rozpoznania ICD-10 oraz opis jednostki chorobowej są **automatycznie maskowane** (`"UKRYTE"`).
* **Wystawianie przez lekarza**: Walidacja uprawnień (numer PWZ), walidacja sumy kontrolnej PESEL oraz NIP, kontrola zwolnienia wstecznego (art. 55 ust. 3: max 3 dni wstecz).
* **Podział kosztów (art. 92 Kodeksu Pracy)**:
  * Do **33 dni** choroby w roku kalendarzowym: wynagrodzenie chorobowe wypłacane przez **pracodawcę**.
  * Dla pracowników w wieku **50+**: pracodawca finansuje tylko pierwsze **14 dni**.
  * Od 34. dnia (lub 15. dnia): zasiłek chorobowy finansowany przez **ZUS**.
  * Dla osób na działalności gospodarczej (JDG): zasiłek wypłaca ZUS od **1. dnia**.
* **Wysokość świadczenia**:
  * **80%** podstawy wymiaru: standardowa wysokość (zarówno pobyt w domu, jak i w szpitalu).
  * **100%** podstawy wymiaru: ciąża (kod **B**), wypadek przy pracy, wypadek w drodze do/z pracy, badania dawców komórek/tkanek.
* **Okres wyczekiwania (karencja)**:
  * 30 dni nieprzerwanego ubezpieczenia przy umowie o pracę (obowiązkowe).
  * 90 dni przy ubezpieczeniu dobrowolnym (JDG, zlecenie).
  * 0 dni m.in. dla absolwentów i osób ze stażem ubezpieczeniowym ≥ 10 lat.

### 2. Składki i Konto ZUS
* **Indywidualny Rachunek Składkowy (NRS)**: Każdy płatnik posiada unikalny numer konta w ZUS, na który trafiają wpłaty; system automatycznie rozlicza zaległości i nadpłaty.
* **Kalkulator JDG 2026**: Uwzględnia formy: Pełny (tzw. Duży ZUS), Preferencyjny (30% min. wynagrodzenia), Mały ZUS Plus oraz Ulga na start.
* **Symulator emerytalny**: Wylicza prognozę świadczenia w oparciu o zwaloryzowany kapitał I i II filaru oraz tablice dalszego trwania życia GUS.

---

## 📡 Przegląd endpointów REST API i przykłady `curl`

### 1. Autoryzacja

#### `POST /api/auth/login`
```bash
curl -X POST http://localhost:8795/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "dr.tomasz", "haslo": "lekarz123"}'
```

---

### 2. Zwolnienia lekarskie (e-ZLA / L4)

#### `GET /api/l4/moje` — Lista zwolnień pacjenta
```bash
curl -H "Authorization: Bearer token-marta-90031501245" \
  http://localhost:8795/api/l4/moje
```

#### `GET /api/l4/platnik` — Widok pracodawcy (dane medyczne ukryte)
```bash
curl -H "Authorization: Bearer token-platnik-techpolska" \
  "http://localhost:8795/api/l4/platnik?nip=5252525259"
```

#### `POST /api/l4/wystaw` — Wystawienie e-ZLA przez lekarza
```bash
curl -X POST http://localhost:8795/api/l4/wystaw \
  -H "Authorization: Bearer token-lekarz-pwz-7891234" \
  -H "Content-Type: application/json" \
  -d '{
    "pesel_pacjenta": "90031501245",
    "imie_pacjenta": "Marta",
    "nazwisko_pacjenta": "Kowalska",
    "data_urodzenia": "1990-03-15",
    "adres_pobytu": "ul. Marszałkowska 10/12, Warszawa",
    "nip_platnika": "5252525259",
    "nazwa_platnika": "TechPolska Sp. z o.o.",
    "okres_od": "2026-02-20",
    "okres_do": "2026-02-27",
    "wskazania_lekarskie": 2,
    "kod_icd10": "J06.9",
    "opis_rozpoznania": "Ostre zakażenie górnych dróg oddechowych",
    "kody_literowe": []
  }'
```

#### `POST /api/l4/kalkulator-zasilku` — Precyzyjny kalkulator świadczeń
```bash
curl -X POST http://localhost:8795/api/l4/kalkulator-zasilku \
  -H "Content-Type: application/json" \
  -d '{
    "pesel": "90031501245",
    "srednie_wynagrodzenie_brutto": 9500.0,
    "dni_zwolnienia": 10,
    "dni_choroby_w_tym_roku_wczesniej": 0
  }'
```
*Odpowiedź zawiera podział na dni pracodawcy, dni ZUS, stawkę dzienną, zaliczkę na podatek PIT oraz kwotę netto do wypłaty.*

#### `POST /api/l4/anuluj` — Anulowanie e-ZLA
```bash
curl -X POST http://localhost:8795/api/l4/anuluj \
  -H "Authorization: Bearer token-lekarz-pwz-7891234" \
  -H "Content-Type: application/json" \
  -d '{
    "id_ezla": "EZLA/2026/02/8912",
    "powod": "Błąd w dacie powrotu do pracy"
  }'
```

---

### 3. Operacje ZUS

#### `GET /api/zus/konto` — Stan konta ubezpieczonego
```bash
curl -H "Authorization: Bearer token-marta-90031501245" \
  http://localhost:8795/api/zus/konto
```

#### `GET /api/zus/skladki/symulacja` — Kalkulator składek dla firm (2026)
```bash
curl "http://localhost:8795/api/zus/skladki/symulacja?forma=pelny&dochod=12000&chorobowe=true"
```

#### `POST /api/zus/wplata-nrs` — Wpłata na indywidualny rachunek składkowy
```bash
curl -X POST http://localhost:8795/api/zus/wplata-nrs \
  -H "Authorization: Bearer token-jan-82041203471" \
  -H "Content-Type: application/json" \
  -d '{
    "pesel": "82041203471",
    "kwota": 1762.67,
    "tytul": "Składki ZUS za styczeń 2026"
  }'
```

#### `GET /api/zus/emerytura/symulacja` — Prognoza emerytalna
```bash
curl -H "Authorization: Bearer token-marta-90031501245" \
  http://localhost:8795/api/zus/emerytura/symulacja
```

#### `GET /api/zus/ewizyty/terminy` — Wolne terminy e-wizyt
```bash
curl "http://localhost:8795/api/zus/ewizyty/terminy?temat=Zasi%C5%82ki"
```

#### `POST /api/zus/ewizyty/rezerwuj` — Rezerwacja wideorozmowy
```bash
curl -X POST http://localhost:8795/api/zus/ewizyty/rezerwuj \
  -H "Authorization: Bearer token-marta-90031501245" \
  -H "Content-Type: application/json" \
  -d '{
    "id_terminu": "TERM_1_1_0900",
    "pesel": "90031501245",
    "imie_nazwisko": "Marta Kowalska"
  }'
```

---

## 📁 Struktura modułu

```
zus_backend/
├── __init__.py           # Wersjonowanie i metadane pakietu
├── server.py             # Wielowątkowy serwer HTTP, routing REST, obsługa CORS
├── models.py             # Klasy danych, walidacja algorytmiczna PESEL i NIP
├── kalkulator.py         # Silnik obliczeniowy zasiłków (art. 92 KP), składek 2026, emerytur
├── baza.py               # Wielowątkowa baza danych w pamięci z danymi początkowymi
├── auth.py               # Uwierzytelnianie, role, generowanie i weryfikacja tokenów
├── openapi.py            # Specyfikacja OpenAPI 3.0 oraz generator Swagger UI
├── README.md             # Kompletna dokumentacja API
└── tests/
    ├── __init__.py
    ├── test_kalkulator.py  # Testy silnika matematyczno-prawnego zasiłków i składek
    ├── test_baza.py        # Testy repozytorium, walidacji PESEL/NIP i uprawnień
    └── test_server.py      # Testy integracyjne HTTP wszystkich endpointów API
```
