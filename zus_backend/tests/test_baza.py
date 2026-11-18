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


if __name__ == "__main__":
    unittest.main()
