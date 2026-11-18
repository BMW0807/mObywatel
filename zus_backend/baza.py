# -*- coding: utf-8 -*-
"""Repozytorium danych w pamięci (mock ZUS/e-ZLA) z pełnym zestawem operacji."""

import threading
import uuid
from dataclasses import asdict
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from .models import (
    ZwolnienieLekarskie,
    StatusEZLA,
    KontoZUS,
    SkladkaPozycja,
    EWizyta,
    waliduj_pesel,
    waliduj_nip,
    parsuj_date
)


class BazaZUS:
    """Wielowątkowa baza danych w pamięci symulująca rejestry ZUS i PUE e-ZLA."""

    def __init__(self):
        self._lock = threading.RLock()
        self.konta: Dict[str, KontoZUS] = {}
        self.zwolnienia: Dict[str, ZwolnienieLekarskie] = {}
        self.ewizyty: Dict[str, EWizyta] = {}
        self.terminy_ewizyt: List[Dict[str, Any]] = []
        self.wnioski_zasilkowe: List[Dict[str, Any]] = []
        self.wplaty_nrs: List[Dict[str, Any]] = []
        self._zainicjalizuj_dane()

    def _zainicjalizuj_dane(self):
        """Inicjalizacja fikcyjnych, realistycznych danych testowych."""
        dzis = date.today()

        # 1. Konto Marty Kowalskiej (Etat - pracownik korporacji)
        pesel_marta = "90031501245"
        self.konta[pesel_marta] = KontoZUS(
            pesel=pesel_marta,
            imie="Marta",
            nazwisko="Kowalska",
            numer_rachunku_skladkowego_nrs="81101000000000900315012450",
            saldo_rozliczen=0.0,
            stan_konta_emerytalnego=184320.50,
            stan_subkonta=72150.80,
            ostatnia_waloryzacja="Czerwiec 2025: wskaźnik 114.87%",
            prognozowana_emerytura_w_wieku_emerytalnym=4850.00,
            wiek_emerytalny_lata=60,
            aktualny_wiek_lata=36,
            lata_skladkowe=14,
            zgloszenia_ubezpieczen=[
                {
                    "platnik_nazwa": "TechPolska Sp. z o.o.",
                    "platnik_nip": "5252525259",
                    "kod_tytulu": "01 10 00",
                    "opis_tytulu": "Pracownik podlegający ubezpieczeniom społecznym i zdrowotnemu",
                    "data_od": "2018-05-01",
                    "status": "aktywne"
                }
            ],
            historia_skladek=[
                {
                    "miesiac": "2026-01",
                    "podstawa": 9500.00,
                    "emerytalna": 1854.40,
                    "rentowa": 760.00,
                    "chorobowa": 232.75,
                    "zdrowotna": 732.18,
                    "status": "rozliczona"
                },
                {
                    "miesiac": "2025-12",
                    "podstawa": 9500.00,
                    "emerytalna": 1854.40,
                    "rentowa": 760.00,
                    "chorobowa": 232.75,
                    "zdrowotna": 732.18,
                    "status": "rozliczona"
                }
            ]
        )

        # 2. Konto Jana Wiśniewskiego (JDG - programista)
        pesel_jan = "82041203471"
        self.konta[pesel_jan] = KontoZUS(
            pesel=pesel_jan,
            imie="Jan",
            nazwisko="Wiśniewski",
            numer_rachunku_skladkowego_nrs="81101000000000820412034710",
            saldo_rozliczen=-1762.67,  # Zaległość za bieżący miesiąc
            stan_konta_emerytalnego=241500.00,
            stan_subkonta=94200.00,
            ostatnia_waloryzacja="Czerwiec 2025: wskaźnik 114.87%",
            prognozowana_emerytura_w_wieku_emerytalnym=5320.00,
            wiek_emerytalny_lata=65,
            aktualny_wiek_lata=44,
            lata_skladkowe=20,
            zgloszenia_ubezpieczen=[
                {
                    "platnik_nazwa": "Jan Wiśniewski Usługi Programistyczne",
                    "platnik_nip": "6762451299",
                    "kod_tytulu": "05 10 00",
                    "opis_tytulu": "Osoba prowadząca pozarolniczą działalność gospodarczą",
                    "data_od": "2015-09-01",
                    "status": "aktywne"
                }
            ],
            historia_skladek=[
                {
                    "miesiac": "2026-01",
                    "podstawa": 5203.80,
                    "emerytalna": 1015.78,
                    "rentowa": 416.30,
                    "chorobowa": 127.49,
                    "zdrowotna": 419.94,
                    "status": "nieoplacona"
                }
            ]
        )

        # 3. Zwolnienia lekarskie (e-ZLA)
        # Aktywne L4 Marty Kowalskiej
        od_marta = (dzis - timedelta(days=2)).isoformat()
        do_marta = (dzis + timedelta(days=5)).isoformat()
        id_ezla_1 = "EZLA/2026/02/8912"
        self.zwolnienia[id_ezla_1] = ZwolnienieLekarskie(
            id_ezla=id_ezla_1,
            pesel_pacjenta=pesel_marta,
            imie_pacjenta="Marta",
            nazwisko_pacjenta="Kowalska",
            data_urodzenia="1990-03-15",
            adres_pobytu="ul. Marszałkowska 10/12, 00-001 Warszawa",
            nip_platnika="5252525259",
            nazwa_platnika="TechPolska Sp. z o.o.",
            pwz_lekarza="7891234",
            imie_nazwisko_lekarza="dr n. med. Tomasz Zieliński",
            placowka_medyczna="Centrum Medyczne Zdrowie Plus, Warszawa",
            data_wystawienia=od_marta,
            okres_od=od_marta,
            okres_do=do_marta,
            dni_kalendarzowych=8,
            wskazania_lekarskie=2,  # Chory może chodzić
            kod_icd10="J06.9",
            opis_rozpoznania="Ostre zakażenie górnych dróg oddechowych, nieokreślone",
            kody_literowe=[],
            status=StatusEZLA.WYSTAWIONE
        )

        # Archiwalne L4 Marty z zeszłego roku (np. ciąża - 100%)
        id_ezla_arch = "EZLA/2025/11/4431"
        self.zwolnienia[id_ezla_arch] = ZwolnienieLekarskie(
            id_ezla=id_ezla_arch,
            pesel_pacjenta=pesel_marta,
            imie_pacjenta="Marta",
            nazwisko_pacjenta="Kowalska",
            data_urodzenia="1990-03-15",
            adres_pobytu="ul. Marszałkowska 10/12, 00-001 Warszawa",
            nip_platnika="5252525259",
            nazwa_platnika="TechPolska Sp. z o.o.",
            pwz_lekarza="5543210",
            imie_nazwisko_lekarza="lek. Anna Wójcik",
            placowka_medyczna="Szpital Kliniczny im. Orłowskiego",
            data_wystawienia="2025-11-03",
            okres_od="2025-11-03",
            okres_do="2025-11-17",
            dni_kalendarzowych=15,
            wskazania_lekarskie=1,  # Chory powinien leżeć
            kod_icd10="O26.8",
            opis_rozpoznania="Inne określone stany związane z ciążą",
            kody_literowe=["B"],
            status=StatusEZLA.WYSTAWIONE
        )

        # 4. Terminy e-wizyt
        tematy = ["Emerytury i renty", "Zasiłki i zwolnienia lekarskie e-ZLA", "Prowadzenie działalności gospodarczej", "Obsługa konta PUE / eZUS"]
        oddzialy = ["I Oddział ZUS w Warszawie", "Oddział ZUS w Krakowie", "Oddział ZUS w Gdańsku", "Oddział ZUS w Poznaniu"]
        godziny = ["09:00", "10:30", "12:00", "13:30", "15:00"]

        for idx, temat in enumerate(tematy):
            for d_idx in range(1, 5):
                data_wizyty = (dzis + timedelta(days=d_idx)).isoformat()
                for godz in godziny[:3]:
                    self.terminy_ewizyt.append({
                        "id_terminu": f"TERM_{idx}_{d_idx}_{godz.replace(':', '')}",
                        "temat": temat,
                        "oddzial": oddzialy[idx % len(oddzialy)],
                        "data": data_wizyty,
                        "godzina": godz,
                        "dostepny": True
                    })

    # --- Operacje na e-ZLA ---

    def pobierz_zwolnienia_pacjenta(self, pesel: str) -> List[Dict[str, Any]]:
        with self._lock:
            wyniki = [
                z.to_dict(dla_platnika=False)
                for z in self.zwolnienia.values()
                if z.pesel_pacjenta == pesel
            ]
            wyniki.sort(key=lambda x: x["okres_od"], reverse=True)
            return wyniki

    def pobierz_zwolnienia_platnika(self, nip: str) -> List[Dict[str, Any]]:
        with self._lock:
            nip_czysty = nip.replace("-", "").strip()
            wyniki = [
                z.to_dict(dla_platnika=True)
                for z in self.zwolnienia.values()
                if z.nip_platnika.replace("-", "").strip() == nip_czysty
            ]
            wyniki.sort(key=lambda x: x["okres_od"], reverse=True)
            return wyniki

    def pobierz_ezla_po_id(self, id_ezla: str, dla_platnika: bool = False) -> Optional[Dict[str, Any]]:
        with self._lock:
            z = self.zwolnienia.get(id_ezla)
            return z.to_dict(dla_platnika=dla_platnika) if z else None

    def wystaw_ezla(self, dane: Dict[str, Any]) -> Dict[str, Any]:
        """Wystawienie nowego zaświadczenia lekarskiego e-ZLA przez lekarza."""
        with self._lock:
            pesel = dane.get("pesel_pacjenta", "")
            if not waliduj_pesel(pesel):
                raise ValueError(f"Niepoprawny numer PESEL: {pesel}")

            nip = dane.get("nip_platnika", "").replace("-", "").strip()
            if not waliduj_nip(nip):
                raise ValueError(f"Niepoprawny numer NIP płatnika: {nip}")

            od_str = dane.get("okres_od")
            do_str = dane.get("okres_do")
            if not od_str or not do_str:
                raise ValueError("Wymagane daty okres_od i okres_do.")

            d_od = parsuj_date(od_str)
            d_do = parsuj_date(do_str)
            if d_do < d_od:
                raise ValueError("Data 'okres_do' nie może być wcześniejsza niż 'okres_od'.")

            # Weryfikacja zwolnienia wstecznego (art. 55 ust. 3: max 3 dni wstecz od daty badania)
            dzis = date.today()
            if (dzis - d_od).days > 3 and "psychiatra" not in dane.get("specjalizacja_lekarza", "").lower():
                # Dopuszczalne ostrzeżenie lub walidacja
                pass

            dni = (d_do - d_od).days + 1
            nowy_id = f"EZLA/{d_od.year}/{d_od.month:02d}/{uuid.uuid4().hex[:6].upper()}"

            ezla = ZwolnienieLekarskie(
                id_ezla=nowy_id,
                pesel_pacjenta=pesel,
                imie_pacjenta=dane.get("imie_pacjenta", "Pacjent"),
                nazwisko_pacjenta=dane.get("nazwisko_pacjenta", ""),
                data_urodzenia=dane.get("data_urodzenia", ""),
                adres_pobytu=dane.get("adres_pobytu", ""),
                nip_platnika=nip,
                nazwa_platnika=dane.get("nazwa_platnika", "Pracodawca"),
                pwz_lekarza=dane.get("pwz_lekarza", ""),
                imie_nazwisko_lekarza=dane.get("imie_nazwisko_lekarza", "Lekarz"),
                placowka_medyczna=dane.get("placowka_medyczna", "Przychodnia"),
                data_wystawienia=dzis.isoformat(),
                okres_od=d_od.isoformat(),
                okres_do=d_do.isoformat(),
                dni_kalendarzowych=dni,
                wskazania_lekarskie=int(dane.get("wskazania_lekarskie", 2)),
                kod_icd10=dane.get("kod_icd10", "Z00"),
                opis_rozpoznania=dane.get("opis_rozpoznania", "Stan chorobowy ogólny"),
                kody_literowe=dane.get("kody_literowe", []),
                status=StatusEZLA.WYSTAWIONE
            )

            self.zwolnienia[nowy_id] = ezla
            return ezla.to_dict(dla_platnika=False)

    def anuluj_ezla(self, id_ezla: str, powod: str) -> Dict[str, Any]:
        """Anulowanie błędnie wystawionego e-ZLA."""
        with self._lock:
            z = self.zwolnienia.get(id_ezla)
            if not z:
                raise KeyError(f"Nie znaleziono zwolnienia o identyfikatorze: {id_ezla}")
            z.status = StatusEZLA.ANULOWANE
            z.powod_anulowania = powod
            return z.to_dict()

    # --- Operacje na Koncie Ubezpieczonego / Składkach ---

    def pobierz_konto(self, pesel: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            k = self.konta.get(pesel)
            return asdict(k) if k else None

    def zarejestruj_wplate_nrs(self, pesel: str, kwota: float, tytul: str) -> Dict[str, Any]:
        """Rejestruje wpływ składki na indywidualny rachunek NRS i koryguje saldo."""
        with self._lock:
            konto = self.konta.get(pesel)
            if not konto:
                raise KeyError(f"Nie znaleziono konta dla PESEL: {pesel}")

            konto.saldo_rozliczen = round(konto.saldo_rozliczen + kwota, 2)
            wpis_wplaty = {
                "id_transakcji": f"NRS_{uuid.uuid4().hex[:8].upper()}",
                "pesel": pesel,
                "nrs": konto.numer_rachunku_skladkowego_nrs,
                "kwota": kwota,
                "data_ksiegowania": date.today().isoformat(),
                "tytul": tytul,
                "nowe_saldo": konto.saldo_rozliczen
            }
            self.wplaty_nrs.append(wpis_wplaty)
            return wpis_wplaty

    # --- Operacje na E-Wizytach ---

    def pobierz_wolne_terminy_ewizyt(self, temat: Optional[str] = None, data_od: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            wyniki = [t for t in self.terminy_ewizyt if t["dostepny"]]
            if temat:
                wyniki = [t for t in wyniki if temat.lower() in t["temat"].lower()]
            if data_od:
                wyniki = [t for t in wyniki if t["data"] >= data_od]
            return wyniki

    def zarezerwuj_ewizyte(self, pesel: str, id_terminu: str, imie_nazwisko: str) -> Dict[str, Any]:
        with self._lock:
            termin = next((t for t in self.terminy_ewizyt if t["id_terminu"] == id_terminu and t["dostepny"]), None)
            if not termin:
                raise ValueError("Wybrany termin jest już niedostępny lub nie istnieje.")

            termin["dostepny"] = False
            id_wizyty = f"EWIZ_{uuid.uuid4().hex[:6].upper()}"
            wizyta = EWizyta(
                id_wizyty=id_wizyty,
                pesel_klienta=pesel,
                imie_nazwisko=imie_nazwisko,
                temat=termin["temat"],
                oddzial_zus=termin["oddzial"],
                data_godzina=f"{termin['data']} {termin['godzina']}",
                czas_trwania_minuty=20,
                link_wideorozmowy=f"https://video.zus.pl/meeting/{id_wizyty}",
                kod_dostepu=f"{uuid.uuid4().hex[:6]}",
                status="potwierdzona"
            )
            self.ewizyty[id_wizyty] = wizyta
            return asdict(wizyta)

    def pobierz_ewizyty_klienta(self, pesel: str) -> List[Dict[str, Any]]:
        with self._lock:
            return [asdict(w) for w in self.ewizyty.values() if w.pesel_klienta == pesel]

    def anuluj_ewizyte(self, id_wizyty: str, pesel: str) -> Dict[str, Any]:
        with self._lock:
            w = self.ewizyty.get(id_wizyty)
            if not w:
                raise KeyError("Nie znaleziono wizyty o podanym ID.")
            if w.pesel_klienta != pesel:
                raise PermissionError("Brak uprawnień do anulowania tej wizyty.")
            w.status = "anulowana"
            return asdict(w)

    # --- Wnioski zasiłkowe ---

    def zloz_wniosek_zasilkowy(self, pesel: str, typ_wniosku: str, dane_dodatkowe: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            id_wniosku = f"WNZ_{date.today().year}/{uuid.uuid4().hex[:6].upper()}"
            wpis = {
                "id_wniosku": id_wniosku,
                "pesel": pesel,
                "typ_wniosku": typ_wniosku,
                "data_zlozenia": datetime.now().isoformat(timespec="seconds"),
                "status": "przyjety_do_rozpatrzenia",
                "szacowany_termin_decyzji": (date.today() + timedelta(days=14)).isoformat(),
                "dane": dane_dodatkowe
            }
            self.wnioski_zasilkowe.append(wpis)
            return wpis

    def pobierz_wnioski_klienta(self, pesel: str) -> List[Dict[str, Any]]:
        with self._lock:
            return [w for w in self.wnioski_zasilkowe if w["pesel"] == pesel]


# Singleton instancja bazy danych
BAZA = BazaZUS()
