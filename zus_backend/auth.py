# -*- coding: utf-8 -*-
"""Obsługa uwierzytelniania, ról i tokenów dla backendu ZUS/e-ZLA."""

import secrets
import time
from typing import Optional, Dict, Any
from .models import Rola


class SesjaUzytkownika:
    def __init__(self, token: str, login: str, rola: Rola, pesel: Optional[str] = None,
                 nip: Optional[str] = None, pwz: Optional[str] = None, nazwa: str = ""):
        self.token = token
        self.login = login
        self.rola = rola
        self.pesel = pesel
        self.nip = nip
        self.pwz = pwz
        self.nazwa = nazwa
        self.utworzono = time.time()
        self.ostatnia_aktywnosc = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "login": self.login,
            "rola": self.rola.value,
            "pesel": self.pesel,
            "nip": self.nip,
            "pwz": self.pwz,
            "nazwa": self.nazwa,
            "token": self.token
        }


# Baza aktywnych sesji token -> SesjaUzytkownika
AKTYWNE_SESJE: Dict[str, SesjaUzytkownika] = {}

# Predefiniowane konta i stałe tokeny testowe dla ułatwienia testów i integracji
UZYTKOWNICY_DEMO = {
    # Ubezpieczony pracownik etatowy
    "marta.kowalska": {
        "haslo": "haslo123",
        "rola": Rola.UBEZPIECZONY,
        "pesel": "90031501245",
        "nazwa": "Marta Kowalska",
        "domyslny_token": "token-marta-90031501245"
    },
    # Ubezpieczony przedsiębiorca (JDG)
    "jan.wisniewski": {
        "haslo": "haslo123",
        "rola": Rola.UBEZPIECZONY,
        "pesel": "82041203471",
        "nip": "6762451299",
        "nazwa": "Jan Wiśniewski (Usługi IT)",
        "domyslny_token": "token-jan-82041203471"
    },
    # Lekarz uprawniony do wystawiania e-ZLA
    "dr.tomasz": {
        "haslo": "lekarz123",
        "rola": Rola.LEKARZ,
        "pwz": "7891234",
        "nazwa": "dr n. med. Tomasz Zieliński",
        "domyslny_token": "token-lekarz-pwz-7891234"
    },
    # Płatnik składek (Pracodawca - HR)
    "kadry.techpolska": {
        "haslo": "kadry123",
        "rola": Rola.PLATNIK,
        "nip": "5252525259",
        "nazwa": "TechPolska Sp. z o.o.",
        "domyslny_token": "token-platnik-techpolska"
    },
    # Urzędnik / Inspektor ZUS
    "inspektor.zus": {
        "haslo": "zus123",
        "rola": Rola.URZEDNIK_ZUS,
        "nazwa": "Anna Nowak (Oddział I ZUS Warszawa)",
        "domyslny_token": "token-urzednik-zus-admin"
    }
}


def zainicjalizuj_sesje_demo():
    """Rejestruje stałe tokeny demo w pamięci."""
    for login, dane in UZYTKOWNICY_DEMO.items():
        tok = dane["domyslny_token"]
        AKTYWNE_SESJE[tok] = SesjaUzytkownika(
            token=tok,
            login=login,
            rola=dane["rola"],
            pesel=dane.get("pesel"),
            nip=dane.get("nip"),
            pwz=dane.get("pwz"),
            nazwa=dane.get("nazwa", login)
        )


# Inicjalizacja przy imporcie
zainicjalizuj_sesje_demo()


def uwierzytelnij(login: str, haslo: str) -> Optional[SesjaUzytkownika]:
    """Weryfikuje login i hasło oraz generuje nowy token sesji."""
    konto = UZYTKOWNICY_DEMO.get(login)
    if not konto or konto["haslo"] != haslo:
        return None

    nowy_token = f"zus_{secrets.token_hex(24)}"
    sesja = SesjaUzytkownika(
        token=nowy_token,
        login=login,
        rola=konto["rola"],
        pesel=konto.get("pesel"),
        nip=konto.get("nip"),
        pwz=konto.get("pwz"),
        nazwa=konto.get("nazwa", login)
    )
    AKTYWNE_SESJE[nowy_token] = sesja
    return sesja


def pobierz_sesje_z_naglowka(naglowek_auth: Optional[str], naglowek_klucz: Optional[str] = None) -> Optional[SesjaUzytkownika]:
    """Pobiera aktywną sesję na podstawie Authorization Bearer lub X-API-Key."""
    token = None
    if naglowek_auth and naglowek_auth.startswith("Bearer "):
        token = naglowek_auth[len("Bearer "):].strip()
    elif naglowek_klucz:
        token = naglowek_klucz.strip()

    if not token:
        return None

    sesja = AKTYWNE_SESJE.get(token)
    if sesja:
        sesja.ostatnia_aktywnosc = time.time()
    return sesja
