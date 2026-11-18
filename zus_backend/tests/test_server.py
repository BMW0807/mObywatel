# -*- coding: utf-8 -*-
import unittest
import json
import threading
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer
from datetime import date, timedelta
from zus_backend.server import ZUSRequestHandler


class TestZUSServer(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        # Uruchomienie serwera na losowym wolnym porcie
        cls.serwer = ThreadingHTTPServer(("127.0.0.1", 0), ZUSRequestHandler)
        cls.port = cls.serwer.server_port
        cls.baza_url = f"http://127.0.0.1:{cls.port}"
        cls.watek = threading.Thread(target=cls.serwer.serve_forever, daemon=True)
        cls.watek.start()

    @classmethod
    def tearDownClass(cls):
        cls.serwer.shutdown()
        cls.serwer.server_close()

    def _zapytanie(self, metoda: str, sciezka: str, dane: dict = None, token: str = None) -> tuple:
        url = f"{self.baza_url}{sciezka}"
        naglowki = {"Content-Type": "application/json"}
        if token:
            naglowki["Authorization"] = f"Bearer {token}"

        dane_bajt = json.dumps(dane).encode("utf-8") if dane else None
        req = urllib.request.Request(url, data=dane_bajt, headers=naglowki, method=metoda)

        try:
            with urllib.request.urlopen(req) as resp:
                kod = resp.getcode()
                cialo = resp.read().decode("utf-8")
                return kod, json.loads(cialo) if resp.headers.get_content_type() == "application/json" else cialo
        except urllib.error.HTTPError as e:
            tresc = e.read().decode("utf-8")
            try:
                parsowane = json.loads(tresc)
            except Exception:
                parsowane = tresc
            return e.code, parsowane

    def test_health_check(self):
        kod, odp = self._zapytanie("GET", "/api/health")
        self.assertEqual(kod, 200)
        self.assertEqual(odp.get("status"), "ok")

    def test_openapi_spec(self):
        kod, odp = self._zapytanie("GET", "/openapi.json")
        self.assertEqual(kod, 200)
        self.assertEqual(odp.get("openapi"), "3.0.3")

    def test_swagger_ui_html(self):
        kod, odp = self._zapytanie("GET", "/docs")
        self.assertEqual(kod, 200)
        self.assertIn("SwaggerUIBundle", odp)

    def test_login(self):
        # Prawidłowe logowanie
        kod, odp = self._zapytanie("POST", "/api/auth/login", {"login": "dr.tomasz", "haslo": "lekarz123"})
        self.assertEqual(kod, 200)
        self.assertIn("token", odp["sesja"])
        self.assertEqual(odp["sesja"]["rola"], "lekarz")

        # Błędne hasło
        kod_bad, _ = self._zapytanie("POST", "/api/auth/login", {"login": "dr.tomasz", "haslo": "zlehaslo"})
        self.assertEqual(kod_bad, 401)

    def test_pobierz_konto_zus(self):
        kod, odp = self._zapytanie("GET", "/api/zus/konto?pesel=90031501245")
        self.assertEqual(kod, 200)
        self.assertEqual(odp["imie"], "Marta")
        self.assertGreater(odp["stan_konta_emerytalnego"], 0)

    def test_symulacja_skladki_jdg(self):
        kod, odp = self._zapytanie("GET", "/api/zus/skladki/symulacja?forma=pelny&dochod=12000")
        self.assertEqual(kod, 200)
        self.assertEqual(odp["forma"], "pelny")
        self.assertGreater(odp["suma_laczna"], 0)

    def test_symulacja_emerytury(self):
        kod, odp = self._zapytanie("GET", "/api/zus/emerytura/symulacja?pesel=90031501245")
        self.assertEqual(kod, 200)
        self.assertIn("prognozowana_emerytura_brutto", odp)

    def test_wplata_nrs(self):
        kod, odp = self._zapytanie("POST", "/api/zus/wplata-nrs", {
            "pesel": "82041203471",
            "kwota": 500.0,
            "tytul": "Częściowa wpłata składki ZUS"
        })
        self.assertEqual(kod, 200)
        self.assertEqual(odp["kwota"], 500.0)

    def test_ewizyty_flow(self):
        # 1. Pobranie wolnych terminów
        kod1, odp1 = self._zapytanie("GET", "/api/zus/ewizyty/terminy")
        self.assertEqual(kod1, 200)
        self.assertGreater(odp1["liczba"], 0)
        id_terminu = odp1["terminy"][0]["id_terminu"]

        # 2. Rezerwacja
        kod2, odp2 = self._zapytanie("POST", "/api/zus/ewizyty/rezerwuj", {
            "id_terminu": id_terminu,
            "pesel": "90031501245",
            "imie_nazwisko": "Marta Kowalska"
        })
        self.assertEqual(kod2, 201)
        id_wizyty = odp2["id_wizyty"]
        self.assertEqual(odp2["status"], "potwierdzona")

        # 3. Lista moich wizyt
        kod3, odp3 = self._zapytanie("GET", "/api/zus/ewizyty/moje", token="token-marta-90031501245")
        self.assertEqual(kod3, 200)
        self.assertIn(id_wizyty, [w["id_wizyty"] for w in odp3["ewizyty"]])

        # 4. Anulowanie
        kod4, odp4 = self._zapytanie("POST", "/api/zus/ewizyty/anuluj", {
            "id_wizyty": id_wizyty,
            "pesel": "90031501245"
        }, token="token-marta-90031501245")
        self.assertEqual(kod4, 200)
        self.assertEqual(odp4["status"], "anulowana")

    def test_l4_flow(self):
        # 1. Lista moich e-ZLA
        kod1, odp1 = self._zapytanie("GET", "/api/l4/moje?pesel=90031501245")
        self.assertEqual(kod1, 200)
        self.assertGreater(odp1["liczba_zwolnien"], 0)

        # 2. Wystawienie nowego e-ZLA przez lekarza
        dzis = date.today()
        dane_wystawienia = {
            "pesel_pacjenta": "90031501245",
            "imie_pacjenta": "Marta",
            "nazwisko_pacjenta": "Kowalska",
            "data_urodzenia": "1990-03-15",
            "adres_pobytu": "Warszawa",
            "nip_platnika": "5252525259",
            "nazwa_platnika": "TechPolska Sp. z o.o.",
            "okres_od": dzis.isoformat(),
            "okres_do": (dzis + timedelta(days=4)).isoformat(),
            "wskazania_lekarskie": 1,
            "kod_icd10": "M54.5",
            "opis_rozpoznania": "Ból dolnej części kręgosłupa",
            "kody_literowe": []
        }
        kod2, odp2 = self._zapytanie("POST", "/api/l4/wystaw", dane_wystawienia, token="token-lekarz-pwz-7891234")
        self.assertEqual(kod2, 201)
        id_nowego = odp2["ezla"]["id_ezla"]

        # 3. Widok pracodawcy (dane medyczne ukryte)
        kod3, odp3 = self._zapytanie("GET", "/api/l4/platnik?nip=5252525259", token="token-platnik-techpolska")
        self.assertEqual(kod3, 200)
        znalezione = next((z for z in odp3["zwolnienia"] if z["id_ezla"] == id_nowego), None)
        self.assertIsNotNone(znalezione)
        self.assertIn("UKRYTE", znalezione["kod_icd10"])

        # 4. Kalkulator zasiłku chorobowego dla tego zwolnienia
        kod4, odp4 = self._zapytanie("POST", "/api/l4/kalkulator-zasilku", {
            "pesel": "90031501245",
            "srednie_wynagrodzenie_brutto": 9500.0,
            "dni_zwolnienia": 5,
            "dni_choroby_w_tym_roku_wczesniej": 0
        })
        self.assertEqual(kod4, 200)
        self.assertEqual(odp4["stawka_procentowa"], 0.8)
        self.assertEqual(odp4["dni_pracodawcy"], 5)
        self.assertGreater(odp4["kwota_netto_do_wyplaty"], 0)

        # 5. Anulowanie zwolnienia
        kod5, odp5 = self._zapytanie("POST", "/api/l4/anuluj", {
            "id_ezla": id_nowego,
            "powod": "Wystawiono w celu testu integracyjnego"
        })
        self.assertEqual(kod5, 200)
        self.assertEqual(odp5["ezla"]["status"], "anulowane")


if __name__ == "__main__":
    unittest.main()
