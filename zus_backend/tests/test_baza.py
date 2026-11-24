# -*- coding: utf-8 -*-
import unittest
from datetime import date, timedelta
from zus_backend.baza import BazaZUS
from zus_backend.models import waliduj_pesel, waliduj_nip, StatusEZLA


class TestBazaZUS(unittest.TestCase):

    def setUp(self):
        self.baza = BazaZUS()

    def test_walidacja_pesel_i_nip(self):
        # Prawidłowy PESEL
        self.assertTrue(waliduj_pesel("90031501245"))
        self.assertTrue(waliduj_pesel("82041203471"))
        # Nieprawidłowy PESEL
        self.assertFalse(waliduj_pesel("90031501249"))
        self.assertFalse(waliduj_pesel("123"))
        self.assertFalse(waliduj_pesel("tekst123456"))

        # Prawidłowy NIP
        self.assertTrue(waliduj_nip("5252525259"))
        self.assertTrue(waliduj_nip("6762451299"))
        # Nieprawidłowy NIP
        self.assertFalse(waliduj_nip("1234567890"))
        self.assertFalse(waliduj_nip("525-252-52-51"))

    def test_pobierz_konto_pacjenta(self):
        konto = self.baza.pobierz_konto("90031501245")
        self.assertIsNotNone(konto)
        self.assertEqual(konto["imie"], "Marta")
        self.assertEqual(konto["nazwisko"], "Kowalska")
        self.assertGreater(konto["stan_konta_emerytalnego"], 100000)

    def test_wystaw_i_pobierz_ezla(self):
        dzis = date.today()
        dane_ezla = {
            "pesel_pacjenta": "90031501245",
            "imie_pacjenta": "Marta",
            "nazwisko_pacjenta": "Kowalska",
            "data_urodzenia": "1990-03-15",
            "adres_pobytu": "Warszawa",
            "nip_platnika": "5252525259",
            "nazwa_platnika": "TechPolska Sp. z o.o.",
            "pwz_lekarza": "7891234",
            "imie_nazwisko_lekarza": "dr Tomasz",
            "placowka_medyczna": "Przychodnia",
            "okres_od": dzis.isoformat(),
            "okres_do": (dzis + timedelta(days=6)).isoformat(),
            "wskazania_lekarskie": 2,
            "kod_icd10": "J10.1",
            "opis_rozpoznania": "Grypa",
            "kody_literowe": []
        }

        nowe_ezla = self.baza.wystaw_ezla(dane_ezla)
        self.assertIn("id_ezla", nowe_ezla)
        self.assertEqual(nowe_ezla["dni_kalendarzowych"], 7)
        self.assertEqual(nowe_ezla["status"], StatusEZLA.WYSTAWIONE.value)

        # Sprawdzenie w widoku pacjenta
        zwolnienia_pacjenta = self.baza.pobierz_zwolnienia_pacjenta("90031501245")
        id_nowego = nowe_ezla["id_ezla"]
        znalezione = next((z for z in zwolnienia_pacjenta if z["id_ezla"] == id_nowego), None)
        self.assertIsNotNone(znalezione)
        self.assertEqual(znalezione["kod_icd10"], "J10.1")

        # Sprawdzenie w widoku pracodawcy (dane medyczne ukryte)
        zwolnienia_platnika = self.baza.pobierz_zwolnienia_platnika("5252525259")
        dla_firmy = next((z for z in zwolnienia_platnika if z["id_ezla"] == id_nowego), None)
        self.assertIsNotNone(dla_firmy)
        self.assertIn("UKRYTE", dla_firmy["kod_icd10"])

    def test_anuluj_ezla(self):
        # Pobieramy istniejące L4
        zwolnienia = self.baza.pobierz_zwolnienia_pacjenta("90031501245")
        id_ezla = zwolnienia[0]["id_ezla"]

        anulowane = self.baza.anuluj_ezla(id_ezla, "Pomyłka lekarska")
        self.assertEqual(anulowane["status"], StatusEZLA.ANULOWANE.value)
        self.assertEqual(anulowane["powod_anulowania"], "Pomyłka lekarska")

    def test_wplata_nrs(self):
        konto_przed = self.baza.pobierz_konto("82041203471")
        saldo_przed = konto_przed["saldo_rozliczen"]

        wplata = self.baza.zarejestruj_wplate_nrs("82041203471", 1000.0, "Wpłata na składki ZUS")
        self.assertEqual(wplata["kwota"], 1000.0)

        konto_po = self.baza.pobierz_konto("82041203471")
        self.assertAlmostEqual(konto_po["saldo_rozliczen"], saldo_przed + 1000.0, places=2)

    def test_ewizyty_rezerwacja_i_anulowanie(self):
        terminy = self.baza.pobierz_wolne_terminy_ewizyt()
        self.assertGreater(len(terminy), 0)
        wybrany = terminy[0]

        rezerwacja = self.baza.zarezerwuj_ewizyte(
            pesel="90031501245",
            id_terminu=wybrany["id_terminu"],
            imie_nazwisko="Marta Kowalska"
        )
        self.assertEqual(rezerwacja["status"], "potwierdzona")
        self.assertIn("https://video.zus.pl", rezerwacja["link_wideorozmowy"])

        # Sprawdzenie na liście wizyt
        moje = self.baza.pobierz_ewizyty_klienta("90031501245")
        self.assertIn(rezerwacja["id_wizyty"], [w["id_wizyty"] for w in moje])

        # Anulowanie
        anulowana = self.baza.anuluj_ewizyte(rezerwacja["id_wizyty"], "90031501245")
        self.assertEqual(anulowana["status"], "anulowana")


class TestBazaPersystencja(unittest.TestCase):

    def setUp(self):
        import tempfile, os
        self.tmp_dir = tempfile.TemporaryDirectory()
        self.db_path = os.path.join(self.tmp_dir.name, "zus_state.json")

    def tearDown(self):
        self.tmp_dir.cleanup()

    def test_persystencja_pelny_cykl_zapisu_i_odczytu(self):
        import os, json
        # Inicjalizacja bazy ze ścieżką w katalogu tymczasowym
        baza1 = BazaZUS(db_path=self.db_path)
        self.assertFalse(os.path.exists(self.db_path))

        # 1. Wpłata NRS
        konto_przed = baza1.pobierz_konto("82041203471")
        saldo_przed = konto_przed["saldo_rozliczen"]
        wplata = baza1.zarejestruj_wplate_nrs("82041203471", 300.0, "Składka testowa")
        self.assertTrue(os.path.exists(self.db_path))

        # 2. Dodanie zwolnienia lekarskiego (wystaw_ezla / dodaj_zwolnienie)
        dzis = date.today()
        dane_ezla = {
            "pesel_pacjenta": "90031501245",
            "imie_pacjenta": "Marta",
            "nazwisko_pacjenta": "Kowalska",
            "data_urodzenia": "1990-03-15",
            "adres_pobytu": "Warszawa",
            "nip_platnika": "5252525259",
            "nazwa_platnika": "TechPolska Sp. z o.o.",
            "pwz_lekarza": "7891234",
            "imie_nazwisko_lekarza": "dr Tomasz",
            "placowka_medyczna": "Przychodnia",
            "okres_od": dzis.isoformat(),
            "okres_do": (dzis + timedelta(days=4)).isoformat(),
            "wskazania_lekarskie": 2,
            "kod_icd10": "J06.9",
            "opis_rozpoznania": "Przeziębienie",
            "kody_literowe": []
        }
        nowe_ezla = baza1.dodaj_zwolnienie(dane_ezla)
        id_ezla = nowe_ezla["id_ezla"]

        # 3. Anulowanie istniejącego L4 (anuluj_zwolnienie)
        baza1.anuluj_zwolnienie("EZLA/2026/02/8912", "Błędne rozpoznanie")

        # 4. Rezerwacja e-wizyty
        terminy = baza1.pobierz_wolne_terminy_ewizyt()
        id_term = terminy[0]["id_terminu"]
        wizyta = baza1.zarezerwuj_ewizyte("90031501245", id_term, "Marta Kowalska")
        id_wiz = wizyta["id_wizyty"]

        # 5. Anulowanie e-wizyty
        baza1.anuluj_ewizyte(id_wiz, "90031501245")

        # 6. Dodanie wniosku zasiłkowego (dodaj_wniosek)
        wniosek = baza1.dodaj_wniosek("90031501245", "ZASILKOWY_CHOROBOWY", {"dni": 5})
        id_wniosku = wniosek["id_wniosku"]

        # Weryfikacja poprawności formatu pliku JSON
        with open(self.db_path, "r", encoding="utf-8") as f:
            dane_json = json.load(f)
        self.assertIn("konta", dane_json)
        self.assertIn("zwolnienia", dane_json)
        self.assertIn("ewizyty", dane_json)
        self.assertIn("wplaty_nrs", dane_json)
        self.assertIn("wnioski_zasilkowe", dane_json)

        # Inicjalizacja nowej instancji BazaZUS ze wskazanym plikiem stanu (test odczytu/scalania)
        baza2 = BazaZUS(db_path=self.db_path)

        # Weryfikacja stanu w baza2
        konto_po = baza2.pobierz_konto("82041203471")
        self.assertAlmostEqual(konto_po["saldo_rozliczen"], saldo_przed + 300.0, places=2)

        ezla2 = baza2.pobierz_ezla_po_id(id_ezla)
        self.assertIsNotNone(ezla2)
        self.assertEqual(ezla2["kod_icd10"], "J06.9")
        self.assertEqual(baza2.zwolnienia[id_ezla].status, StatusEZLA.WYSTAWIONE)

        ezla_anul = baza2.pobierz_ezla_po_id("EZLA/2026/02/8912")
        self.assertEqual(ezla_anul["status"], StatusEZLA.ANULOWANE.value)
        self.assertEqual(baza2.zwolnienia["EZLA/2026/02/8912"].status, StatusEZLA.ANULOWANE)

        moje_wizyty = baza2.pobierz_ewizyty_klienta("90031501245")
        znaleziona_wiz = next((w for w in moje_wizyty if w["id_wizyty"] == id_wiz), None)
        self.assertIsNotNone(znaleziona_wiz)
        self.assertEqual(znaleziona_wiz["status"], "anulowana")

        moje_wnioski = baza2.pobierz_wnioski_klienta("90031501245")
        znaleziony_wn = next((w for w in moje_wnioski if w["id_wniosku"] == id_wniosku), None)
        self.assertIsNotNone(znaleziony_wn)
        self.assertEqual(znaleziony_wn["typ_wniosku"], "ZASILKOWY_CHOROBOWY")

    def test_zmienna_srodowiskowa_zus_db_path(self):
        import os
        orig = os.environ.get("ZUS_DB_PATH")
        try:
            os.environ["ZUS_DB_PATH"] = self.db_path
            baza = BazaZUS()
            self.assertEqual(baza.db_path, self.db_path)
            baza.zarejestruj_wplate_nrs("82041203471", 50.0, "Wpłata ze zmiennej env")
            self.assertTrue(os.path.exists(self.db_path))
        finally:
            if orig is not None:
                os.environ["ZUS_DB_PATH"] = orig
            else:
                os.environ.pop("ZUS_DB_PATH", None)


if __name__ == "__main__":
    unittest.main()
