# -*- coding: utf-8 -*-
"""Modele danych i walidacja dla backendu ZUS i e-ZLA (L4)."""

from dataclasses import dataclass, field, asdict
from datetime import date, datetime
from enum import Enum
from typing import List, Optional, Dict, Any
import re


def waliduj_pesel(pesel: str) -> bool:
    """Sprawdza poprawność numeru PESEL algorytmem sumy kontrolnej."""
    if not pesel or len(pesel) != 11 or not pesel.isdigit():
        return False
    wagi = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    suma = sum(int(pesel[i]) * wagi[i] for i in range(10))
    cyfra_kontrolna = (10 - (suma % 10)) % 10
    return cyfra_kontrolna == int(pesel[10])


def waliduj_nip(nip: str) -> bool:
    """Sprawdza poprawność numeru NIP (bez kresek)."""
    oczyszczony = re.sub(r'[\s-]', '', nip or '')
    if len(oczyszczony) != 10 or not oczyszczony.isdigit():
        return False
    wagi = [6, 5, 7, 2, 3, 4, 5, 6, 7]
    suma = sum(int(oczyszczony[i]) * wagi[i] for i in range(9))
    cyfra_kontrolna = suma % 11
    if cyfra_kontrolna == 10:
        return False
    return cyfra_kontrolna == int(oczyszczony[9])


def parsuj_date(data_str: str) -> date:
    """Parsuje datę w formacie RRRR-MM-DD."""
    if isinstance(data_str, (date, datetime)):
        return data_str if isinstance(data_str, date) else data_str.date()
    return datetime.strptime(data_str, "%Y-%m-%d").date()


class Rola(str, Enum):
    UBEZPIECZONY = "ubezpieczony"       # Pracownik, zleceniobiorca, przedsiębiorca
    LEKARZ = "lekarz"                   # Lekarz z PWZ wystawiający e-ZLA
    PLATNIK = "platnik"                 # Pracodawca / Płatnik składek
    URZEDNIK_ZUS = "urzednik_zus"       # Pracownik ZUS z pełnym wglądem


class ZalecenieLekarskie(int, Enum):
    CHORY_POWINIEN_LEZEC = 1            # Kod 1: Chory powinien leżeć
    CHORY_MOZE_CHODZIC = 2              # Kod 2: Chory może chodzić


class StatusEZLA(str, Enum):
    WYSTAWIONE = "wystawione"           # Ważne i aktywne zwolnienie
    ANULOWANE = "anulowane"             # Anulowane przez lekarza/ZUS
    SKORYGOWANE = "skorygowane"         # Zastąpione nowym zwolnieniem korygującym


class RodzajPlatnikaChorobowego(str, Enum):
    PRACODAWCA = "pracodawca"           # Pierwsze 33 dni (lub 14 dni dla wieku 50+) - wynagrodzenie chorobowe
    ZUS = "zus"                         # Od 34. dnia (lub 15.) lub od początku dla małych firm/JDG - zasiłek chorobowy


@dataclass
class ZwolnienieLekarskie:
    id_ezla: str                         # Unikalny numer e-ZLA (np. EZLA/2026/02/1042)
    pesel_pacjenta: str                  # PESEL pacjenta
    imie_pacjenta: str
    nazwisko_pacjenta: str
    data_urodzenia: str
    adres_pobytu: str                    # Adres przebywania w trakcie rekonwalescencji (do kontroli ZUS)
    nip_platnika: str                    # NIP pracodawcy
    nazwa_platnika: str
    pwz_lekarza: str                     # Prawo Wykonywania Zawodu lekarza
    imie_nazwisko_lekarza: str
    placowka_medyczna: str               # Nazwa przychodni/szpitala
    data_wystawienia: str                # RRRR-MM-DD
    okres_od: str                        # RRRR-MM-DD
    okres_do: str                        # RRRR-MM-DD
    dni_kalendarzowych: int
    wskazania_lekarskie: int             # 1 (leżeć) lub 2 (może chodzić)
    kod_icd10: str                       # Kod rozpoznania medycznego (np. J06.9, M54.5)
    opis_rozpoznania: str                # Słowny opis jednostki chorobowej
    kody_literowe: List[str] = field(default_factory=list) # A, B (ciąża - 100%), C, D (gruźlica), E
    status: StatusEZLA = StatusEZLA.WYSTAWIONE
    powod_anulowania: Optional[str] = None
    skorygowane_przez: Optional[str] = None

    def to_dict(self, dla_platnika: bool = False) -> Dict[str, Any]:
        """Zwraca słownik. Zgodnie z prawem, płatnik nie widzi kodu ICD-10 ani opisu rozpoznania medycznego."""
        d = asdict(self)
        if dla_platnika:
            d["kod_icd10"] = "UKRYTE (ochrona danych medycznych)"
            d["opis_rozpoznania"] = "UKRYTE"
        return d


@dataclass
class KalkulacjaZasilku:
    pesel: str
    liczba_dni_zwolnienia: int
    podstawa_wymiaru_brutto: float       # Średnie wynagrodzenie z ostatnich 12 miesięcy pomniejszone o 13,71%
    stawka_procentowa: float             # 80% lub 100%
    stawka_dzienna_brutto: float         # Podstawa / 30 * stawka_procentowa
    kwota_calkowita_brutto: float
    zaliczka_podatek_pit: float          # 12% (zasiłek ZUS nie ma kosztów uzyskania)
    kwota_netto_do_wyplaty: float
    kto_wyplaca: RodzajPlatnikaChorobowego
    dni_pracodawcy: int                  # Dni finansowane przez pracodawcę (max 33 / 14 w roku)
    dni_zus: int                         # Dni finansowane przez ZUS
    okres_wyczekiwania_spelniony: bool
    uzasadnienie: str


@dataclass
class SkladkaPozycja:
    kod_ubezpieczenia: str               # np. "01 10 00" (pracownik), "05 10 00" (działalność)
    miesiac: str                         # RRRR-MM (np. 2026-01)
    emerytalna: float
    rentowa: float
    chorobowa: float
    wypadkowa: float
    zdrowotna: float
    fundusz_pracy: float
    fgsp: float
    suma: float
    termin_platnosci: str                # np. 2026-02-20
    status: str                          # "oplacona", "nieoplacona", "przeterminowana"


@dataclass
class KontoZUS:
    pesel: str
    imie: str
    nazwisko: str
    numer_rachunku_skladkowego_nrs: str  # Indywidualny rachunek składkowy do wpłat
    saldo_rozliczen: float               # Dodatnie = nadpłata, ujemne = zaległość
    stan_konta_emerytalnego: float       # Środki na I filarze (ZUS)
    stan_subkonta: float                 # Środki na subkoncie (II filar)
    ostatnia_waloryzacja: str            # np. "Czerwiec 2025: wskaźnik 114.87%"
    prognozowana_emerytura_w_wieku_emerytalnym: float
    wiek_emerytalny_lata: int            # 60 dla kobiet, 65 dla mężczyzn
    aktualny_wiek_lata: int
    lata_skladkowe: int
    zgloszenia_ubezpieczen: List[Dict[str, Any]] = field(default_factory=list)
    historia_skladek: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class EWizyta:
    id_wizyty: str
    pesel_klienta: str
    imie_nazwisko: str
    temat: str                           # np. "Emerytury i renty", "Zasiłki i L4", "Prowadzenie firmy"
    oddzial_zus: str                     # np. "I Oddział ZUS w Warszawie"
    data_godzina: str                    # RRRR-MM-DD HH:MM
    czas_trwania_minuty: int
    link_wideorozmowy: str
    kod_dostepu: str
    status: str                          # "potwierdzona", "anulowana", "zakonczona"
