# -*- coding: utf-8 -*-
import unittest
from datetime import date
from zus_backend.kalkulator import (
    wylicz_wiek,
    sprawdz_okres_wyczekiwania,
    kalkuluj_zasilek_chorobowy,
    symuluj_skladki_jdg_2026,
    symuluj_emeryture
)
from zus_backend.models import RodzajPlatnikaChorobowego


class TestKalkulatorZUS(unittest.TestCase):

    def test_wylicz_wiek(self):
        # Marta Kowalska: 900315... urodzona 15 marca 1990
        # W 2026 roku ma 36 lat (po 15 marca) lub 35 lat (przed 15 marca)
        wiek_przed = wylicz_wiek("90031501245", na_dzien=date(2026, 2, 1))
        self.assertEqual(wiek_przed, 35)

        wiek_po = wylicz_wiek("90031501245", na_dzien=date(2026, 4, 1))
        self.assertEqual(wiek_po, 36)

        # Urodzony po 2000 roku: np. 052415... (15 kwietnia 2005)
        wiek_2000 = wylicz_wiek("05241501234", na_dzien=date(2026, 5, 1))
        self.assertEqual(wiek_2000, 21)

    def test_okres_wyczekiwania(self):
        # Umowa o pracę - wymaga 30 dni
        res1 = sprawdz_okres_wyczekiwania("obowiazkowe", dni_ubezpieczenia=20)
        self.assertFalse(res1["spelniony"])
        self.assertEqual(res1["wymagane_dni"], 30)

        res2 = sprawdz_okres_wyczekiwania("obowiazkowe", dni_ubezpieczenia=35)
        self.assertTrue(res2["spelniony"])

        # JDG / dobrowolne - wymaga 90 dni
        res3 = sprawdz_okres_wyczekiwania("jdg", dni_ubezpieczenia=60)
        self.assertFalse(res3["spelniony"])
        self.assertEqual(res3["wymagane_dni"], 90)

        res4 = sprawdz_okres_wyczekiwania("jdg", dni_ubezpieczenia=95)
        self.assertTrue(res4["spelniony"])

        # Wypadek w pracy - 0 dni
        res5 = sprawdz_okres_wyczekiwania("obowiazkowe", dni_ubezpieczenia=5, wypadek_przy_pracy_lub_droga=True)
        self.assertTrue(res5["spelniony"])

    def test_kalkulacja_zasilku_standardowa_80_proc(self):
        # Brutto 10 000 zł, zwolnienie 10 dni, pierwsze w roku
        kalk = kalkuluj_zasilek_chorobowy(
            pesel="90031501245",
            srednie_wynagrodzenie_brutto=10000.0,
            dni_zwolnienia=10,
            dni_choroby_w_tym_roku_wczesniej=0
        )
        self.assertTrue(kalk.okres_wyczekiwania_spelniony)
        # Podstawa = 10000 * (1 - 0.1371) = 8629.00
        self.assertAlmostEqual(kalk.podstawa_wymiaru_brutto, 8629.0, places=1)
        self.assertEqual(kalk.stawka_procentowa, 0.8)
        # Stawka dzienna = 8629 / 30 * 0.8 = 230.11 zł
        self.assertAlmostEqual(kalk.stawka_dzienna_brutto, 230.11, places=1)
        # Pracodawca płaci do 33 dni
        self.assertEqual(kalk.dni_pracodawcy, 10)
        self.assertEqual(kalk.dni_zus, 0)
        self.assertEqual(kalk.kto_wyplaca, RodzajPlatnikaChorobowego.PRACODAWCA)

    def test_kalkulacja_zasilku_ciaza_100_proc(self):
        # Kod B (ciąża) = 100%
        kalk = kalkuluj_zasilek_chorobowy(
            pesel="90031501245",
            srednie_wynagrodzenie_brutto=10000.0,
            dni_zwolnienia=14,
            kody_literowe=["B"]
        )
        self.assertEqual(kalk.stawka_procentowa, 1.0)
        # Stawka dzienna = 8629 / 30 * 1.0 = 287.63
        self.assertAlmostEqual(kalk.stawka_dzienna_brutto, 287.63, places=1)

    def test_kalkulacja_przejscie_limitu_33_dni_na_zus(self):
        # Pracownik chorował już 30 dni w tym roku. Kolejne zwolnienie trwa 10 dni.
        # Pracodawca płaci za 3 dni (do 33 dni), ZUS płaci za 7 dni.
        kalk = kalkuluj_zasilek_chorobowy(
            pesel="90031501245",
            srednie_wynagrodzenie_brutto=10000.0,
            dni_zwolnienia=10,
            dni_choroby_w_tym_roku_wczesniej=30
        )
        self.assertEqual(kalk.dni_pracodawcy, 3)
        self.assertEqual(kalk.dni_zus, 7)
        self.assertEqual(kalk.kto_wyplaca, RodzajPlatnikaChorobowego.ZUS)

    def test_symulacja_skladki_jdg(self):
        # Duży ZUS
        pelny = symuluj_skladki_jdg_2026("pelny", dochod_miesieczny=12000.0)
        self.assertGreater(pelny["suma_spoleczne"], 1500.0)
        self.assertGreater(pelny["skladka_zdrowotna"], 400.0)
        self.assertGreater(pelny["suma_laczna"], 2000.0)

        # Ulga na start: społeczne = 0
        ulga = symuluj_skladki_jdg_2026("ulga_na_start", dochod_miesieczny=12000.0)
        self.assertEqual(ulga["suma_spoleczne"], 0.0)
        self.assertGreater(ulga["skladka_zdrowotna"], 400.0)
        self.assertEqual(ulga["suma_laczna"], ulga["skladka_zdrowotna"])

    def test_symulacja_emerytury(self):
        prognoza = symuluj_emeryture(
            stan_konta=200000.0,
            stan_subkonta=80000.0,
            wiek_aktualny=40,
            wiek_emerytalny=65,
            srednia_miesieczna_skladka=2000.0
        )
        self.assertEqual(prognoza["lata_do_emerytury"], 25)
        self.assertGreater(prognoza["szacowany_kapital_na_emeryturze"], 800000.0)
        self.assertGreater(prognoza["prognozowana_emerytura_brutto"], 3000.0)


if __name__ == "__main__":
    unittest.main()
