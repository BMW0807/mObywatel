# -*- coding: utf-8 -*-
"""Silnik obliczeniowy zasiłków chorobowych, świadczeń i składek ZUS.
Implementacja zgodna z ustawą o świadczeniach pieniężnych z ubezpieczenia społecznego
w razie choroby i macierzyństwa oraz Kodeksem Pracy.
"""

from typing import Dict, Any, List, Optional
from datetime import date
from .models import (
    KalkulacjaZasilku,
    RodzajPlatnikaChorobowego,
    parsuj_date
)


def wylicz_wiek(pesel: str, na_dzien: Optional[date] = None) -> int:
    """Wylicza wiek w latach na podstawie numeru PESEL."""
    if not pesel or len(pesel) != 11:
        return 35
    if na_dzien is None:
        na_dzien = date.today()

    rok = int(pesel[0:2])
    miesiac = int(pesel[2:4])
    dzien = int(pesel[4:6])

    if 1 <= miesiac <= 12:
        stulecie = 1900
    elif 21 <= miesiac <= 32:
        stulecie = 2000
        miesiac -= 20
    elif 81 <= miesiac <= 92:
        stulecie = 1800
        miesiac -= 80
    else:
        stulecie = 1900

    urodzenie = date(stulecie + rok, miesiac, dzien)
    wiek = na_dzien.year - urodzenie.year - ((na_dzien.month, na_dzien.day) < (urodzenie.month, urodzenie.day))
    return wiek


def sprawdz_okres_wyczekiwania(
    typ_ubezpieczenia: str,
    dni_ubezpieczenia: int,
    jest_absolwentem: bool = False,
    wypadek_przy_pracy_lub_droga: bool = False,
    lata_stazu_pracy: int = 0
) -> Dict[str, Any]:
    """Weryfikuje prawo do zasiłku w oparciu o okres wyczekiwania (karencję).
    - 30 dni: ubezpieczenie obowiązkowe (np. umowa o pracę)
    - 90 dni: ubezpieczenie dobrowolne (np. zlecenie, JDG)
    - 0 dni (brak karencji): absolwenci, wypadki przy pracy, ubezpieczeni >= 10 lat
    """
    if wypadek_przy_pracy_lub_droga:
        return {"spelniony": True, "wymagane_dni": 0, "powod": "Wypadek przy pracy lub w drodze do/z pracy - prawo od 1. dnia"}
    if jest_absolwentem:
        return {"spelniony": True, "wymagane_dni": 0, "powod": "Absolwent szkoły/uczelni podlegający ubezpieczeniu w ciągu 90 dni od ukończenia nauki"}
    if lata_stazu_pracy >= 10:
        return {"spelniony": True, "wymagane_dni": 0, "powod": "Stały staż ubezpieczeniowy powyżej 10 lat - brak okresu karencji"}

    wymagane = 90 if typ_ubezpieczenia.lower() in ("dobrowolne", "jdg", "dzialalnosc", "zlecenie") else 30
    spelniony = dni_ubezpieczenia >= wymagane
    return {
        "spelniony": spelniony,
        "wymagane_dni": wymagane,
        "aktualne_dni": dni_ubezpieczenia,
        "powod": "Okres karencji spełniony" if spelniony else f"Brak wymaganego okresu ubezpieczenia ({dni_ubezpieczenia}/{wymagane} dni)"
    }


def kalkuluj_zasilek_chorobowy(
    pesel: str,
    srednie_wynagrodzenie_brutto: float,
    dni_zwolnienia: int,
    dni_choroby_w_tym_roku_wczesniej: int = 0,
    kody_literowe: Optional[List[str]] = None,
    jest_szpital: bool = False,
    jest_wypadek: bool = False,
    typ_ubezpieczenia: str = "obowiazkowe",
    dni_ubezpieczenia: int = 365,
    jest_absolwentem: bool = False,
    staz_lat: int = 5
) -> KalkulacjaZasilku:
    """Kompleksowe wyliczenie świadczenia chorobowego.

    Zasady:
    - Podstawa wymiaru = średnie brutto pomniejszone o 13,71% składek społecznych pracownika.
    - Stawka dzienna = podstawa / 30.
    - Procent:
        * 100% jeśli ciąża (kod B), wypadek w pracy / drodze, badania dawców.
        * 80% standardowo (w tym pobyt w szpitalu).
    - Limit pracodawcy: 33 dni w roku kalendarzowym (14 dni dla pracowników 50+).
    """
    kody = [k.upper() for k in (kody_literowe or [])]
    wiek = wylicz_wiek(pesel)
    limit_pracodawcy = 14 if wiek >= 50 else 33

    karencja = sprawdz_okres_wyczekiwania(
        typ_ubezpieczenia=typ_ubezpieczenia,
        dni_ubezpieczenia=dni_ubezpieczenia,
        jest_absolwentem=jest_absolwentem,
        wypadek_przy_pracy_lub_droga=jest_wypadek,
        lata_stazu_pracy=staz_lat
    )

    if not karencja["spelniony"]:
        return KalkulacjaZasilku(
            pesel=pesel,
            liczba_dni_zwolnienia=dni_zwolnienia,
            podstawa_wymiaru_brutto=0.0,
            stawka_procentowa=0.0,
            stawka_dzienna_brutto=0.0,
            kwota_calkowita_brutto=0.0,
            zaliczka_podatek_pit=0.0,
            kwota_netto_do_wyplaty=0.0,
            kto_wyplaca=RodzajPlatnikaChorobowego.PRACODAWCA,
            dni_pracodawcy=0,
            dni_zus=0,
            okres_wyczekiwania_spelniony=False,
            uzasadnienie=karencja["powod"]
        )

    # 1. Podstawa wymiaru: brutto pomniejszone o 13.71%
    odliczenie_skladki = 0.1371
    podstawa_wymiaru = round(srednie_wynagrodzenie_brutto * (1.0 - odliczenie_skladki), 2)

    # 2. Stawka procentowa (100% vs 80%)
    jest_100_proc = "B" in kody or jest_wypadek
    stawka_procentowa = 1.0 if jest_100_proc else 0.8

    # 3. Stawka dzienna brutto (zgodnie z ustawą zawsze dzielimy przez 30)
    stawka_dzienna_brutto = round((podstawa_wymiaru / 30.0) * stawka_procentowa, 2)
    kwota_calkowita_brutto = round(stawka_dzienna_brutto * dni_zwolnienia, 2)

    # 4. Podział dni między pracodawcę a ZUS
    if typ_ubezpieczenia.lower() in ("jdg", "dzialalnosc"):
        # Osoby na własnej działalności otrzymują zasiłek z ZUS od 1. dnia
        dni_pracodawcy = 0
        dni_zus = dni_zwolnienia
        kto_glowny = RodzajPlatnikaChorobowego.ZUS
    else:
        pozostalo_limitu = max(0, limit_pracodawcy - dni_choroby_w_tym_roku_wczesniej)
        dni_pracodawcy = min(dni_zwolnienia, pozostalo_limitu)
        dni_zus = max(0, dni_zwolnienia - dni_pracodawcy)
        kto_glowny = RodzajPlatnikaChorobowego.PRACODAWCA if dni_pracodawcy >= dni_zus else RodzajPlatnikaChorobowego.ZUS

    # 5. Podatek dochodowy PIT (12% od świadczenia ZUS / chorobowego)
    zaliczka_pit = round(kwota_calkowita_brutto * 0.12, 2)
    kwota_netto = round(kwota_calkowita_brutto - zaliczka_pit, 2)

    opis_stawek = "100% (ciąża / wypadek)" if jest_100_proc else "80% (standardowa stawka)"
    uzasadnienie = (
        f"Wyliczenie na podstawie art. 92 KP i ustawy zasiłkowej. Stawka {opis_stawek}. "
        f"Dni u pracodawcy: {dni_pracodawcy} (limit roczny {limit_pracodawcy} dni), dni ZUS: {dni_zus}."
    )

    return KalkulacjaZasilku(
        pesel=pesel,
        liczba_dni_zwolnienia=dni_zwolnienia,
        podstawa_wymiaru_brutto=podstawa_wymiaru,
        stawka_procentowa=stawka_procentowa,
        stawka_dzienna_brutto=stawka_dzienna_brutto,
        kwota_calkowita_brutto=kwota_calkowita_brutto,
        zaliczka_podatek_pit=zaliczka_pit,
        kwota_netto_do_wyplaty=kwota_netto,
        kto_wyplaca=kto_glowny,
        dni_pracodawcy=dni_pracodawcy,
        dni_zus=dni_zus,
        okres_wyczekiwania_spelniony=True,
        uzasadnienie=uzasadnienie
    )


def symuluj_skladki_jdg_2026(
    forma: str = "pelny",
    dochod_miesieczny: float = 10000.0,
    z_chorobowym: bool = True
) -> Dict[str, Any]:
    """Kalkulator składek ZUS dla przedsiębiorców na 2026 rok.
    Formy:
    - 'ulga_na_start' (tylko składka zdrowotna przez pierwsze 6 miesięcy)
    - 'preferencyjny' (podstawa 30% min. wynagrodzenia)
    - 'pelny' (standardowy tzw. duży ZUS, 60% prognozowanego przeciętnego wynagrodzenia)
    - 'maly_zus_plus' (podstawa zależna od dochodu)
    """
    forma = forma.lower()

    # Prognozowane przeciętne wynagrodzenie 2026 (szacunek 8673 zł) -> podstawa 60% = 5203.80 zł
    podstawa_pelny = 5203.80
    # Minimalne wynagrodzenie 2026 (szacunek 4666 zł) -> podstawa preferencyjny 30% = 1399.80 zł
    podstawa_preferencyjny = 1399.80

    if forma == "ulga_na_start":
        podstawa_spoleczne = 0.0
    elif forma == "preferencyjny":
        podstawa_spoleczne = podstawa_preferencyjny
    elif forma == "maly_zus_plus":
        # Uproszczony algorytm: dochód z poprzedniego roku / 2 (min 30% min., max 60% przeciętnego)
        podstawa_spoleczne = max(podstawa_preferencyjny, min(podstawa_pelny, round(dochod_miesieczny * 0.5, 2)))
    else:  # 'pelny'
        podstawa_spoleczne = podstawa_pelny

    if podstawa_spoleczne > 0:
        emerytalna = round(podstawa_spoleczne * 0.1952, 2)
        rentowa = round(podstawa_spoleczne * 0.0800, 2)
        chorobowa = round(podstawa_spoleczne * 0.0245, 2) if z_chorobowym else 0.0
        wypadkowa = round(podstawa_spoleczne * 0.0167, 2) # stopa 1.67%
        # Fundusz Pracy tylko przy pełnym ZUS lub podstawie >= minimalnego
        fp = round(podstawa_spoleczne * 0.0245, 2) if podstawa_spoleczne >= 4666.0 else 0.0
    else:
        emerytalna = rentowa = chorobowa = wypadkowa = fp = 0.0

    # Składka zdrowotna (skala podatkowa 9% od dochodu, min. ~419.94 zł)
    min_zdrowotna = 419.94
    zdrowotna = max(min_zdrowotna, round(dochod_miesieczny * 0.09, 2))

    suma_spoleczne = round(emerytalna + rentowa + chorobowa + wypadkowa + fp, 2)
    suma_calkowita = round(suma_spoleczne + zdrowotna, 2)

    return {
        "forma": forma,
        "podstawa_wymiaru_spoleczne": podstawa_spoleczne,
        "emerytalna": emerytalna,
        "rentowa": rentowa,
        "chorobowa": chorobowa,
        "wypadkowa": wypadkowa,
        "fundusz_pracy": fp,
        "suma_spoleczne": suma_spoleczne,
        "skladka_zdrowotna": zdrowotna,
        "suma_laczna": suma_calkowita,
        "termin_platnosci": "20. dzień następnego miesiąca"
    }


def symuluj_emeryture(
    stan_konta: float,
    stan_subkonta: float,
    wiek_aktualny: int,
    wiek_emerytalny: int,
    srednia_miesieczna_skladka: float,
    wskaznik_waloryzacji_rocznej: float = 1.055
) -> Dict[str, Any]:
    """Symulator hipotetycznej emerytury ZUS.
    Zgodnie z polskim systemem zdefiniowanej składki:
    Emerytura = (Zgromadzony kapitał zwaloryzowany) / (Średnie dalsze trwanie życia w miesiącach - tablice GUS)
    """
    lata_do_emerytury = max(0, wiek_emerytalny - wiek_aktualny)
    kapital = stan_konta + stan_subkonta

    # Narastanie kapitału i waloryzacja przez pozostałe lata
    for _ in range(lata_do_emerytury):
        kapital = (kapital + srednia_miesieczna_skladka * 12) * wskaznik_waloryzacji_rocznej

    # Średnie dalsze trwanie życia wg tablic GUS dla wieku emerytalnego:
    # 60 lat (kobiety): ok. 260 miesięcy; 65 lat (mężczyźni): ok. 210 miesięcy
    miesiace_dozycia = 260 if wiek_emerytalny <= 60 else 210

    emerytura_miesieczna = round(kapital / miesiace_dozycia, 2)

    return {
        "wiek_aktualny": wiek_aktualny,
        "wiek_emerytalny": wiek_emerytalny,
        "lata_do_emerytury": lata_do_emerytury,
        "szacowany_kapital_na_emeryturze": round(kapital, 2),
        "miesiace_dozycia_gus": miesiace_dozycia,
        "prognozowana_emerytura_brutto": emerytura_miesieczna,
        "prognozowana_emerytura_netto": round(emerytura_miesieczna * 0.88, 2)
    }
