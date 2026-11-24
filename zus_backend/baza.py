# -*- coding: utf-8 -*-
"""Repozytorium danych w pamięci (mock ZUS/e-ZLA) z pełnym zestawem operacji i opcjonalną persystencją JSON."""

import json
import os
import tempfile
import threading
import uuid
from dataclasses import asdict
from datetime import datetime, date, timedelta
from enum import Enum
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
    """Wielowątkowa baza danych symulująca rejestry ZUS i PUE e-ZLA z trwałością JSON."""

    def __init__(self, db_path: Optional[str] = None):
        self._lock = threading.RLock()
        self._custom_db_path = db_path
        self.konta: Dict[str, KontoZUS] = {}
        self.zwolnienia: Dict[str, ZwolnienieLekarskie] = {}
        self.ewizyty: Dict[str, EWizyta] = {}
        self.terminy_ewizyt: List[Dict[str, Any]] = []
        self.wnioski_zasilkowe: List[Dict[str, Any]] = []
        self.wplaty_nrs: List[Dict[str, Any]] = []
        self._zainicjalizuj_dane()

    @property
    def db_path(self) -> str:
        if self._custom_db_path:
            return self._custom_db_path
        return os.environ.get("ZUS_DB_PATH") or os.path.join(os.path.dirname(__file__), "data", "zus_state.json")

    @property
    def _db_path(self) -> str:
        return self.db_path

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

        # Wczytanie zapisanego stanu JSON jeśli plik istnieje (persystencja)
        if os.path.exists(self.db_path):
            self._wczytaj_stan()

    def _wczytaj_stan(self):
        """Wczytuje i łączy stan z pliku JSON z danymi demonstracyjnymi."""
        path = self.db_path
        if not os.path.exists(path):
            return
        with self._lock:
            try:
                with open(path, "r", encoding="utf-8") as f:
                    dane = json.load(f)
            except Exception:
                return

            if not isinstance(dane, dict):
                return

            # 1. Konta
            for pesel, k_dict in (dane.get("konta") or {}).items():
                try:
                    self.konta[pesel] = KontoZUS(**k_dict)
                except Exception:
                    pass

            # 2. Zwolnienia lekarskie e-ZLA
            for id_ezla, z_dict in (dane.get("zwolnienia") or {}).items():
                try:
                    if "status" in z_dict and isinstance(z_dict["status"], str):
                        z_dict["status"] = StatusEZLA(z_dict["status"])
                    self.zwolnienia[id_ezla] = ZwolnienieLekarskie(**z_dict)
                except Exception:
                    pass

            # 3. E-wizyty
            for id_wizyty, e_dict in (dane.get("ewizyty") or {}).items():
                try:
                    self.ewizyty[id_wizyty] = EWizyta(**e_dict)
                except Exception:
                    pass

            # 4. Terminy e-wizyt
            saved_terminy = dane.get("terminy_ewizyt")
            if isinstance(saved_terminy, list) and saved_terminy:
                terminy_map = {t["id_terminu"]: t for t in saved_terminy if isinstance(t, dict) and "id_terminu" in t}
                for t in self.terminy_ewizyt:
                    if t.get("id_terminu") in terminy_map:
                        t.update(terminy_map[t["id_terminu"]])
                istniejace = {t.get("id_terminu") for t in self.terminy_ewizyt}
                for t_id, t_obj in terminy_map.items():
                    if t_id not in istniejace:
                        self.terminy_ewizyt.append(t_obj)

            # 5. Wnioski zasiłkowe
            saved_wnioski = dane.get("wnioski_zasilkowe")
            if isinstance(saved_wnioski, list):
                istniejace_w = {w.get("id_wniosku") for w in self.wnioski_zasilkowe if isinstance(w, dict)}
                for w in saved_wnioski:
                    if isinstance(w, dict) and w.get("id_wniosku") not in istniejace_w:
                        self.wnioski_zasilkowe.append(w)
                        if w.get("id_wniosku"):
                            istniejace_w.add(w.get("id_wniosku"))

            # 6. Wpłaty NRS
            saved_wplaty = dane.get("wplaty_nrs")
            if isinstance(saved_wplaty, list):
                istniejace_wp = {wp.get("id_transakcji") for wp in self.wplaty_nrs if isinstance(wp, dict)}
                for wp in saved_wplaty:
                    if isinstance(wp, dict) and wp.get("id_transakcji") not in istniejace_wp:
                        self.wplaty_nrs.append(wp)
                        if wp.get("id_transakcji"):
                            istniejace_wp.add(wp.get("id_transakcji"))

    def _zapisz_stan(self):
        """Bezpieczny, atomowy zapis stanu bazy danych do pliku JSON (z blokadą)."""
        with self._lock:
            path = self.db_path
            dir_path = os.path.dirname(os.path.abspath(path))
            try:
                os.makedirs(dir_path, exist_ok=True)
            except OSError:
                pass

            konta_dict = {pesel: asdict(k) for pesel, k in self.konta.items()}
            zwolnienia_dict = {}
            for id_ezla, z in self.zwolnienia.items():
                d = asdict(z)
                if isinstance(d.get("status"), Enum):
                    d["status"] = d["status"].value
                zwolnienia_dict[id_ezla] = d

            ewizyty_dict = {id_wiz: asdict(w) for id_wiz, w in self.ewizyty.items()}

            dane = {
                "konta": konta_dict,
                "zwolnienia": zwolnienia_dict,
                "ewizyty": ewizyty_dict,
                "terminy_ewizyt": self.terminy_ewizyt,
                "wnioski_zasilkowe": self.wnioski_zasilkowe,
                "wplaty_nrs": self.wplaty_nrs
            }

            def _serializator(obj):
                if isinstance(obj, Enum):
                    return obj.value
                if isinstance(obj, (date, datetime)):
                    return obj.isoformat()
                raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")

            tmp_path = None
            try:
                fd, tmp_path = tempfile.mkstemp(dir=dir_path, prefix="zus_state_", suffix=".tmp")
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    json.dump(dane, f, ensure_ascii=False, indent=2, default=_serializator)
                    f.flush()
                    os.fsync(f.fileno())
                os.replace(tmp_path, path)
            except Exception:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass
                raise

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
            self._zapisz_stan()
            return ezla.to_dict(dla_platnika=False)

    def dodaj_zwolnienie(self, dane_lub_obiekt: Any) -> Dict[str, Any]:
        """Dodaje lub wystawia nowe zwolnienie lekarskie e-ZLA."""
        if isinstance(dane_lub_obiekt, ZwolnienieLekarskie):
            with self._lock:
                self.zwolnienia[dane_lub_obiekt.id_ezla] = dane_lub_obiekt
                self._zapisz_stan()
                return dane_lub_obiekt.to_dict(dla_platnika=False)
        return self.wystaw_ezla(dane_lub_obiekt)

    def anuluj_ezla(self, id_ezla: str, powod: str) -> Dict[str, Any]:
        """Anulowanie błędnie wystawionego e-ZLA."""
        with self._lock:
            z = self.zwolnienia.get(id_ezla)
            if not z:
                raise KeyError(f"Nie znaleziono zwolnienia o identyfikatorze: {id_ezla}")
            z.status = StatusEZLA.ANULOWANE
            z.powod_anulowania = powod
            self._zapisz_stan()
            return z.to_dict()

    def anuluj_zwolnienie(self, id_ezla: str, powod: str = "") -> Dict[str, Any]:
        """Anulowanie zwolnienia (alias dla anuluj_ezla)."""
        return self.anuluj_ezla(id_ezla, powod)

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
            self._zapisz_stan()
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
            self._zapisz_stan()
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
            self._zapisz_stan()
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
            self._zapisz_stan()
            return wpis

    def dodaj_wniosek(self, pesel_lub_dane: Any, typ_wniosku: Optional[str] = None, dane_dodatkowe: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Dodaje wniosek zasiłkowy (alias dla zloz_wniosek_zasilkowy)."""
        if isinstance(pesel_lub_dane, dict) and typ_wniosku is None:
            return self.zloz_wniosek_zasilkowy(
                pesel=pesel_lub_dane.get("pesel", ""),
                typ_wniosku=pesel_lub_dane.get("typ_wniosku") or pesel_lub_dane.get("typ", "zasilkowy"),
                dane_dodatkowe=pesel_lub_dane.get("dane", pesel_lub_dane)
            )
        return self.zloz_wniosek_zasilkowy(pesel_lub_dane, typ_wniosku or "zasilkowy", dane_dodatkowe or {})

    def pobierz_wnioski_klienta(self, pesel: str) -> List[Dict[str, Any]]:
        with self._lock:
            return [w for w in self.wnioski_zasilkowe if w["pesel"] == pesel]


# Singleton instancja bazy danych
BAZA = BazaZUS()
