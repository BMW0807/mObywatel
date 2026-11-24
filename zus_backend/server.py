# -*- coding: utf-8 -*-
"""Serwer REST API dla ZUS i e-ZLA (L4).
Uruchomienie: python3 zus_backend/server.py [port]  (domyślnie 8795)
"""

import json
import os
import sys
import urllib.parse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any, Optional, Tuple

if __package__:
    from .models import Rola, waliduj_pesel, waliduj_nip
    from .baza import BAZA
    from .auth import (
        pobierz_sesje_z_naglowka,
        uwierzytelnij,
        SesjaUzytkownika,
        AKTYWNE_SESJE,
        UZYTKOWNICY_DEMO
    )
    from .kalkulator import (
        kalkuluj_zasilek_chorobowy,
        symuluj_skladki_jdg_2026,
        symuluj_emeryture
    )
    from .openapi import OPENAPI_SPEC, generuj_swagger_html
else:
    _dir = os.path.dirname(os.path.abspath(__file__))
    _parent = os.path.dirname(_dir)
    if _parent not in sys.path:
        sys.path.insert(0, _parent)
    from zus_backend.models import Rola, waliduj_pesel, waliduj_nip
    from zus_backend.baza import BAZA
    from zus_backend.auth import (
        pobierz_sesje_z_naglowka,
        uwierzytelnij,
        SesjaUzytkownika,
        AKTYWNE_SESJE,
        UZYTKOWNICY_DEMO
    )
    from zus_backend.kalkulator import (
        kalkuluj_zasilek_chorobowy,
        symuluj_skladki_jdg_2026,
        symuluj_emeryture
    )
    from zus_backend.openapi import OPENAPI_SPEC, generuj_swagger_html


class BrakAutoryzacji(Exception): pass
class BrakUprawnien(Exception): pass


class ZUSRequestHandler(BaseHTTPRequestHandler):
    server_version = "ZUS-REST-API/1.0"
    MAX_JSON_PAYLOAD = 262144  # 256 KB

    def _dozwolone_origin(self) -> str:
        origin = self.headers.get("Origin", "")
        host = self.headers.get("Host", "")
        if origin:
            try:
                from urllib.parse import urlparse
                parsed_origin = urlparse(origin)
                if parsed_origin.netloc == host or parsed_origin.hostname in ("127.0.0.1", "localhost"):
                    return origin
            except Exception:
                pass
        dozwolone = {
            "http://127.0.0.1:8790", "http://localhost:8790",
            "http://127.0.0.1:8795", "http://localhost:8795"
        }
        custom = os.environ.get("ALLOWED_ORIGINS", "")
        if custom:
            dozwolone.update(o.strip() for o in custom.split(",") if o.strip())
        if origin in dozwolone:
            return origin
        return origin if origin else "http://127.0.0.1:8790"

    def _wyslij_odpowiedz(self, status: int, cialo: Any, content_type: str = "application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        origin_val = self._dozwolone_origin()
        if origin_val:
            self.send_header("Access-Control-Allow-Origin", origin_val)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.end_headers()

        if isinstance(cialo, str):
            bajt_cialo = cialo.encode("utf-8")
        elif isinstance(cialo, (dict, list)):
            bajt_cialo = json.dumps(cialo, ensure_ascii=False, indent=2).encode("utf-8")
        elif cialo is None:
            bajt_cialo = b""
        else:
            bajt_cialo = str(cialo).encode("utf-8")

        self.wfile.write(bajt_cialo)

    def do_OPTIONS(self):
        """Obsługa CORS preflight."""
        self._wyslij_odpowiedz(204, None)

    def _odczytaj_json(self) -> Dict[str, Any]:
        """Bezpiecznie odczytuje i parsuje treść żądania JSON z limitem rozmiaru."""
        try:
            dlugosc = int(self.headers.get("Content-Length", 0))
            if dlugosc <= 0:
                return {}
            if dlugosc > self.MAX_JSON_PAYLOAD:
                raise ValueError(f"Przekroczono dopuszczalny rozmiar żądania ({self.MAX_JSON_PAYLOAD} B)")
            surowe = self.rfile.read(dlugosc).decode("utf-8")
            return json.loads(surowe)
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Nieprawidłowy format JSON: {str(e)}")

    def _pobierz_sesje(self) -> Optional[SesjaUzytkownika]:
        """Pobiera sesję z nagłówka Authorization lub X-API-Key."""
        auth_h = self.headers.get("Authorization")
        key_h = self.headers.get("X-API-Key")
        return pobierz_sesje_z_naglowka(auth_h, key_h)

    def _wymagaj_sesji(self) -> SesjaUzytkownika:
        sesja = self._pobierz_sesje()
        if not sesja:
            raise BrakAutoryzacji("Wymagana autoryzacja. Podaj nagłówek Authorization: Bearer <token>")
        return sesja

    def _sprawdz_pesel(self, sesja: SesjaUzytkownika, pesel: str):
        if sesja.rola != Rola.URZEDNIK_ZUS and sesja.pesel != pesel:
            raise BrakUprawnien(f"Brak uprawnień do przeglądania danych PESEL {pesel}.")

    def _sprawdz_nip(self, sesja: SesjaUzytkownika, nip: str):
        if sesja.rola != Rola.URZEDNIK_ZUS and (sesja.rola != Rola.PLATNIK or sesja.nip != nip):
            raise BrakUprawnien(f"Brak uprawnień do przeglądania danych płatnika NIP {nip}.")

    # --- Routing GET ---

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        sciezka = parsed.path.rstrip("/") or "/"
        query = urllib.parse.parse_qs(parsed.query)

        try:
            # Dokumentacja i metadane
            if sciezka in ("", "/", "/docs", "/zus/docs"):
                html = generuj_swagger_html()
                return self._wyslij_odpowiedz(200, html, content_type="text/html; charset=utf-8")

            if sciezka in ("/openapi.json", "/zus/openapi.json"):
                return self._wyslij_odpowiedz(200, OPENAPI_SPEC)

            if sciezka in ("/api/health", "/api/zus/health"):
                return self._wyslij_odpowiedz(200, {"status": "ok", "service": "ZUS & e-ZLA Backend API", "wersja": "1.0.0"})

            # ZUS: Konto ubezpieczonego
            if sciezka == "/api/zus/konto":
                sesja = self._wymagaj_sesji()
                pesel = query.get("pesel", [sesja.pesel])[0]
                self._sprawdz_pesel(sesja, pesel)
                konto = BAZA.pobierz_konto(pesel)
                if not konto:
                    return self._wyslij_odpowiedz(404, {"blad": f"Nie znaleziono konta ZUS dla PESEL {pesel}"})
                return self._wyslij_odpowiedz(200, konto)

            # ZUS: Symulacja składek JDG
            if sciezka == "/api/zus/skladki/symulacja":
                forma = query.get("forma", ["pelny"])[0]
                dochod = float(query.get("dochod", [10000.0])[0])
                chorobowe = query.get("chorobowe", ["true"])[0].lower() in ("true", "1", "tak")
                wynik = symuluj_skladki_jdg_2026(forma=forma, dochod_miesieczny=dochod, z_chorobowym=chorobowe)
                return self._wyslij_odpowiedz(200, wynik)

            # ZUS: Symulacja emerytury
            if sciezka == "/api/zus/emerytura/symulacja":
                sesja = self._wymagaj_sesji()
                pesel = query.get("pesel", [sesja.pesel])[0]
                self._sprawdz_pesel(sesja, pesel)
                konto = BAZA.pobierz_konto(pesel) or {}
                stan_k = float(query.get("stan_konta", [konto.get("stan_konta_emerytalnego", 184320.50)])[0])
                stan_sub = float(query.get("stan_subkonta", [konto.get("stan_subkonta", 72150.80)])[0])
                wiek = int(query.get("wiek", [konto.get("aktualny_wiek_lata", 36)])[0])
                wiek_em = int(query.get("wiek_emerytalny", [konto.get("wiek_emerytalny_lata", 60)])[0])
                skladka_m = float(query.get("srednia_skladka", [1850.0])[0])

                wynik = symuluj_emeryture(
                    stan_konta=stan_k,
                    stan_subkonta=stan_sub,
                    wiek_aktualny=wiek,
                    wiek_emerytalny=wiek_em,
                    srednia_miesieczna_skladka=skladka_m
                )
                return self._wyslij_odpowiedz(200, wynik)

            # ZUS: Terminy e-wizyt
            if sciezka == "/api/zus/ewizyty/terminy":
                temat = query.get("temat", [None])[0]
                data_od = query.get("data_od", [None])[0]
                terminy = BAZA.pobierz_wolne_terminy_ewizyt(temat=temat, data_od=data_od)
                return self._wyslij_odpowiedz(200, {"liczba": len(terminy), "terminy": terminy})

            # ZUS: Zarezerwowane e-wizyty klienta
            if sciezka == "/api/zus/ewizyty/moje":
                sesja = self._wymagaj_sesji()
                pesel = sesja.pesel or "90031501245"
                wizyty = BAZA.pobierz_ewizyty_klienta(pesel)
                return self._wyslij_odpowiedz(200, {"liczba": len(wizyty), "ewizyty": wizyty})

            # ZUS: Wnioski złożone przez klienta
            if sciezka == "/api/zus/wnioski/moje":
                sesja = self._wymagaj_sesji()
                pesel = sesja.pesel or "90031501245"
                wnioski = BAZA.pobierz_wnioski_klienta(pesel)
                return self._wyslij_odpowiedz(200, {"liczba": len(wnioski), "wnioski": wnioski})

            # L4: Lista zwolnień lekarskich pacjenta
            if sciezka == "/api/l4/moje":
                sesja = self._wymagaj_sesji()
                pesel = query.get("pesel", [sesja.pesel])[0]
                self._sprawdz_pesel(sesja, pesel)
                zwolnienia = BAZA.pobierz_zwolnienia_pacjenta(pesel)
                return self._wyslij_odpowiedz(200, {
                    "pesel": pesel,
                    "liczba_zwolnien": len(zwolnienia),
                    "zwolnienia": zwolnienia
                })

            # L4: Szczegóły e-ZLA
            if sciezka == "/api/l4/szczegoly":
                id_ezla = query.get("id", [None])[0]
                if not id_ezla:
                    return self._wyslij_odpowiedz(400, {"blad": "Wymagany parametr 'id'."})
                sesja = self._wymagaj_sesji()
                dla_platnika = (sesja.rola == Rola.PLATNIK)
                ezla = BAZA.pobierz_ezla_po_id(id_ezla, dla_platnika=dla_platnika)
                if not ezla:
                    return self._wyslij_odpowiedz(404, {"blad": f"Nie znaleziono e-ZLA o ID {id_ezla}"})
                dostep = (
                    sesja.rola == Rola.URZEDNIK_ZUS or
                    (sesja.rola == Rola.LEKARZ and sesja.pwz == ezla.get("pwz_lekarza")) or
                    (sesja.pesel and sesja.pesel == ezla.get("pesel_pacjenta")) or
                    (sesja.rola == Rola.PLATNIK and sesja.nip and sesja.nip == ezla.get("nip_platnika"))
                )
                if not dostep:
                    raise BrakUprawnien(f"Brak uprawnień do przeglądania e-ZLA {id_ezla}.")
                return self._wyslij_odpowiedz(200, ezla)

            # L4: Widok płatnika składek (pracodawcy)
            if sciezka == "/api/l4/platnik":
                sesja = self._wymagaj_sesji()
                nip = query.get("nip", [sesja.nip])[0]
                self._sprawdz_nip(sesja, nip)
                zwolnienia = BAZA.pobierz_zwolnienia_platnika(nip)
                return self._wyslij_odpowiedz(200, {
                    "nip_platnika": nip,
                    "liczba_zwolnien_pracownikow": len(zwolnienia),
                    "zwolnienia": zwolnienia,
                    "uwaga_prawne": "Zgodnie z prawem, dane medyczne (kod ICD-10) są ukryte przed pracodawcą."
                })

            # Nieznana ścieżka GET
            self._wyslij_odpowiedz(404, {"blad": f"Nie znaleziono endpointu GET: {sciezka}"})

        except BrakAutoryzacji as ba:
            self._wyslij_odpowiedz(401, {"blad": str(ba)})
        except BrakUprawnien as bu:
            self._wyslij_odpowiedz(403, {"blad": str(bu)})
        except ValueError as ve:
            kod_bledu = 413 if "rozmiar" in str(ve).lower() else 422
            self._wyslij_odpowiedz(kod_bledu, {"blad": "Błąd walidacji danych", "szczegoly": str(ve)})
        except KeyError as ke:
            self._wyslij_odpowiedz(404, {"blad": str(ke)})
        except PermissionError as pe:
            self._wyslij_odpowiedz(403, {"blad": str(pe)})
        except Exception:
            self._wyslij_odpowiedz(500, {"blad": "Wewnętrzny błąd serwera"})

    # --- Routing POST ---

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        sciezka = parsed.path.rstrip("/") or "/"

        try:
            dane = self._odczytaj_json()

            # Autoryzacja: Logowanie
            if sciezka == "/api/auth/login":
                login = dane.get("login", "")
                haslo = dane.get("haslo", "")
                sesja = uwierzytelnij(login, haslo)
                if not sesja:
                    return self._wyslij_odpowiedz(401, {"blad": "Nieprawidłowy login lub hasło."})
                return self._wyslij_odpowiedz(200, {
                    "komunikat": "Pomyślnie zalogowano",
                    "sesja": sesja.to_dict()
                })

            # ZUS: Wpłata na indywidualny rachunek składkowy NRS
            if sciezka == "/api/zus/wplata-nrs":
                sesja = self._wymagaj_sesji()
                pesel = dane.get("pesel", sesja.pesel or "82041203471")
                self._sprawdz_pesel(sesja, pesel)
                kwota = float(dane.get("kwota", 0.0))
                tytul = dane.get("tytul", "Wpłata na składki ZUS")
                if kwota <= 0:
                    return self._wyslij_odpowiedz(400, {"blad": "Kwota wpłaty musi być większa od zera."})
                wynik = BAZA.zarejestruj_wplate_nrs(pesel, kwota, tytul)
                return self._wyslij_odpowiedz(200, wynik)

            # ZUS: Rezerwacja e-wizyty
            if sciezka == "/api/zus/ewizyty/rezerwuj":
                sesja = self._wymagaj_sesji()
                id_terminu = dane.get("id_terminu")
                pesel = sesja.pesel or dane.get("pesel", "90031501245")
                self._sprawdz_pesel(sesja, pesel)
                imie_nazwisko = sesja.nazwa or dane.get("imie_nazwisko", "Marta Kowalska")
                if not id_terminu:
                    return self._wyslij_odpowiedz(400, {"blad": "Wymagany parametr 'id_terminu'."})
                wizyta = BAZA.zarezerwuj_ewizyte(pesel, id_terminu, imie_nazwisko)
                return self._wyslij_odpowiedz(201, wizyta)

            # ZUS: Anulowanie e-wizyty
            if sciezka == "/api/zus/ewizyty/anuluj":
                sesja = self._wymagaj_sesji()
                id_wizyty = dane.get("id_wizyty")
                pesel = sesja.pesel or dane.get("pesel", "90031501245")
                self._sprawdz_pesel(sesja, pesel)
                if not id_wizyty:
                    return self._wyslij_odpowiedz(400, {"blad": "Wymagany parametr 'id_wizyty'."})
                wynik = BAZA.anuluj_ewizyte(id_wizyty, pesel)
                return self._wyslij_odpowiedz(200, wynik)

            # ZUS: Złożenie wniosku zasiłkowego
            if sciezka == "/api/zus/wnioski":
                sesja = self._wymagaj_sesji()
                pesel = sesja.pesel or dane.get("pesel", "90031501245")
                self._sprawdz_pesel(sesja, pesel)
                typ = dane.get("typ_wniosku", "Wniosek o zasiłek chorobowy ZAS-12")
                dodatkowe = dane.get("dane", {})
                wniosek = BAZA.zloz_wniosek_zasilkowy(pesel, typ, dodatkowe)
                return self._wyslij_odpowiedz(201, wniosek)

            # L4: Wystawienie e-ZLA przez lekarza
            if sciezka == "/api/l4/wystaw":
                sesja = self._wymagaj_sesji()
                if sesja.rola != Rola.LEKARZ and sesja.rola != Rola.URZEDNIK_ZUS:
                    raise BrakUprawnien("Brak uprawnień lekarza. Wymagana rola lekarza z ważnym numerem PWZ.")

                pwz = sesja.pwz or (sesja.rola == Rola.URZEDNIK_ZUS and dane.get("pwz_lekarza"))
                if not pwz:
                    raise BrakUprawnien("Brak ważnego numeru PWZ lekarza w sesji.")

                dane["pwz_lekarza"] = pwz
                dane["imie_nazwisko_lekarza"] = sesja.nazwa or dane.get("imie_nazwisko_lekarza", "Lekarz")

                nowe_ezla = BAZA.wystaw_ezla(dane)
                return self._wyslij_odpowiedz(201, {
                    "komunikat": "Zaświadczenie lekarskie e-ZLA zostało pomyślnie wystawione i przekazane do PUE ZUS oraz płatnika składek.",
                    "ezla": nowe_ezla
                })

            # L4: Anulowanie e-ZLA
            if sciezka == "/api/l4/anuluj":
                sesja = self._wymagaj_sesji()
                if sesja.rola not in (Rola.LEKARZ, Rola.URZEDNIK_ZUS):
                    raise BrakUprawnien("Tylko lekarz lub urzędnik ZUS może anulować zaświadczenie e-ZLA.")

                id_ezla = dane.get("id_ezla")
                powod = dane.get("powod", "Pomyłka w dacie lub danych pacjenta")
                if not id_ezla:
                    return self._wyslij_odpowiedz(400, {"blad": "Wymagany parametr 'id_ezla'."})

                ezla = BAZA.pobierz_ezla_po_id(id_ezla)
                if not ezla:
                    return self._wyslij_odpowiedz(404, {"blad": f"Nie znaleziono e-ZLA o ID {id_ezla}"})

                if sesja.rola == Rola.LEKARZ and sesja.pwz and ezla.get("pwz_lekarza") != sesja.pwz:
                    raise BrakUprawnien("Lekarz może anulować wyłącznie wystawione przez siebie e-ZLA.")

                anulowane = BAZA.anuluj_ezla(id_ezla, powod)
                return self._wyslij_odpowiedz(200, {"komunikat": "Zwolnienie zostało anulowane", "ezla": anulowane})

            # L4: Kalkulator zasiłku chorobowego
            if sciezka == "/api/l4/kalkulator-zasilku":
                pesel = dane.get("pesel", "90031501245")
                wynagrodzenie = float(dane.get("srednie_wynagrodzenie_brutto", 9500.0))
                dni = int(dane.get("dni_zwolnienia", 7))
                dni_wczesniej = int(dane.get("dni_choroby_w_tym_roku_wczesniej", 0))
                kody = dane.get("kody_literowe", [])
                jest_szpital = bool(dane.get("jest_szpital", False))
                jest_wypadek = bool(dane.get("jest_wypadek", False))
                typ_ub = dane.get("typ_ubezpieczenia", "obowiazkowe")
                dni_ub = int(dane.get("dni_ubezpieczenia", 365))

                kalkulacja = kalkuluj_zasilek_chorobowy(
                    pesel=pesel,
                    srednie_wynagrodzenie_brutto=wynagrodzenie,
                    dni_zwolnienia=dni,
                    dni_choroby_w_tym_roku_wczesniej=dni_wczesniej,
                    kody_literowe=kody,
                    jest_szpital=jest_szpital,
                    jest_wypadek=jest_wypadek,
                    typ_ubezpieczenia=typ_ub,
                    dni_ubezpieczenia=dni_ub
                )
                from dataclasses import asdict
                return self._wyslij_odpowiedz(200, asdict(kalkulacja))

            # Nieznana ścieżka POST
            self._wyslij_odpowiedz(404, {"blad": f"Nie znaleziono endpointu POST: {sciezka}"})

        except BrakAutoryzacji as ba:
            self._wyslij_odpowiedz(401, {"blad": str(ba)})
        except BrakUprawnien as bu:
            self._wyslij_odpowiedz(403, {"blad": str(bu)})
        except ValueError as ve:
            kod_bledu = 413 if "rozmiar" in str(ve).lower() else 422
            self._wyslij_odpowiedz(kod_bledu, {"blad": "Błąd walidacji danych", "szczegoly": str(ve)})
        except KeyError as ke:
            self._wyslij_odpowiedz(404, {"blad": str(ke)})
        except PermissionError as pe:
            self._wyslij_odpowiedz(403, {"blad": str(pe)})
        except Exception:
            self._wyslij_odpowiedz(500, {"blad": "Wewnętrzny błąd serwera"})


def uruchom_serwer(port: int = 8795):
    host = os.environ.get("HOST", "127.0.0.1")
    try:
        serwer = ThreadingHTTPServer((host, port), ZUSRequestHandler)
    except Exception as e:
        print(f"Błąd uruchamiania serwera ZUS na {host}:{port}: {e}", file=sys.stderr, flush=True)
        return
        return
    print(f"================================================================")
    print(f"  ZUS & e-ZLA (L4) REST API Server uruchomiony na porcie {port}")
    print(f"  Dokumentacja Swagger UI: http://localhost:{port}/docs")
    print(f"  Specyfikacja OpenAPI:    http://localhost:{port}/openapi.json")
    print(f"  Health Check:            http://localhost:{port}/api/health")
    print(f"================================================================")
    try:
        serwer.serve_forever()
    except (KeyboardInterrupt, SystemExit):
        print("\nZatrzymywanie serwera ZUS...")
        serwer.server_close()
    except Exception as e:
        print(f"Błąd serwera ZUS: {e}", file=sys.stderr, flush=True)
        try:
            serwer.server_close()
        except Exception:
            pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8795
    uruchom_serwer(port)
