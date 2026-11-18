# -*- coding: utf-8 -*-
"""Specyfikacja OpenAPI 3.0 oraz interfejs Swagger UI."""

import json

OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "ZUS & e-ZLA (L4) REST API",
        "version": "1.0.0",
        "description": (
            "Kompletny backend REST API do obsługi Zakładu Ubezpieczeń Społecznych (ZUS) "
            "oraz elektronicznych zwolnień lekarskich (e-ZLA / L4). "
            "Obsługuje role: Ubezpieczony (pacjent/pracownik), Lekarz (wystawianie e-ZLA), "
            "Płatnik (pracodawca/kadry) oraz Urzędnik ZUS."
        ),
        "contact": {
            "name": "Zespół mObywatel / ZUS API",
            "url": "https://www.zus.pl"
        }
    },
    "servers": [
        {"url": "http://localhost:8795", "description": "Lokalny serwer deweloperski API ZUS"}
    ],
    "paths": {
        "/api/health": {
            "get": {
                "summary": "Health check",
                "description": "Zwraca status działania serwera.",
                "responses": {"200": {"description": "Serwer działa poprawnie."}}
            }
        },
        "/api/auth/login": {
            "post": {
                "summary": "Logowanie i pobranie tokenu sesji",
                "description": "Logowanie użytkownika. Dostępne konta demo: marta.kowalska, jan.wisniewski, dr.tomasz, kadry.techpolska, inspektor.zus.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "login": {"type": "string", "example": "marta.kowalska"},
                                    "haslo": {"type": "string", "example": "haslo123"}
                                },
                                "required": ["login", "haslo"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Pomyślnie uwierzytelniono, zwraca token Bearer."},
                    "401": {"description": "Błędne dane logowania."}
                }
            }
        },
        "/api/zus/konto": {
            "get": {
                "summary": "Stan konta ubezpieczonego w ZUS (I i II filar)",
                "description": "Pobiera stan zgromadzonych składek na koncie emerytalnym i subkoncie, wskaźniki waloryzacji oraz zgłoszenia.",
                "parameters": [
                    {"name": "pesel", "in": "query", "schema": {"type": "string"}, "description": "PESEL (opcjonalny, domyślnie z tokenu sesji)"}
                ],
                "responses": {
                    "200": {"description": "Szczegółowy stan konta ubezpieczonego w ZUS."}
                }
            }
        },
        "/api/zus/skladki/symulacja": {
            "get": {
                "summary": "Kalkulator składek ZUS dla przedsiębiorcy (2026)",
                "description": "Wylicza składki społeczne i zdrowotne na 2026 r. dla różnych form (pelny, preferencyjny, ulga_na_start, maly_zus_plus).",
                "parameters": [
                    {"name": "forma", "in": "query", "schema": {"type": "string", "default": "pelny"}},
                    {"name": "dochod", "in": "query", "schema": {"type": "number", "default": 10000.0}},
                    {"name": "chorobowe", "in": "query", "schema": {"type": "boolean", "default": True}}
                ],
                "responses": {
                    "200": {"description": "Szczegółowa kalkulacja składek z terminem płatności."}
                }
            }
        },
        "/api/zus/wplata-nrs": {
            "post": {
                "summary": "Wpłata na indywidualny rachunek składkowy (NRS)",
                "description": "Rejestruje wpływ wpłaty na indywidualny rachunek składkowy ZUS i aktualizuje saldo.",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "kwota": {"type": "number", "example": 1762.67},
                                    "tytul": {"type": "string", "example": "Składki ZUS 01/2026"}
                                },
                                "required": ["kwota"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {"description": "Zaksięgowano wpłatę NRS."}
                }
            }
        },
        "/api/zus/emerytura/symulacja": {
            "get": {
                "summary": "Prognoza hipotetycznej emerytury ZUS",
                "description": "Wylicza szacowaną miesięczną emeryturę brutto/netto na podstawie kapitału i tablic dalszego trwania życia GUS.",
                "responses": {"200": {"description": "Prognoza emerytalna."}}
            }
        },
        "/api/zus/ewizyty/terminy": {
            "get": {
                "summary": "Dostępne terminy e-wizyt w placówkach ZUS",
                "description": "Wyszukiwarka wolnych terminów na wideorozmowę z ekspertem ZUS.",
                "responses": {"200": {"description": "Lista wolnych terminów."}}
            }
        },
        "/api/zus/ewizyty/rezerwuj": {
            "post": {
                "summary": "Rezerwacja e-wizyty w ZUS",
                "description": "Rezerwuje termin wideokonferencji i generuje link oraz kod dostępu.",
                "responses": {"200": {"description": "Potwierdzenie rezerwacji e-wizyty."}}
            }
        },
        "/api/l4/moje": {
            "get": {
                "summary": "Lista zwolnień lekarskich pacjenta (e-ZLA)",
                "description": "Zwraca wszystkie zwolnienia lekarskie aktualnie zalogowanego ubezpieczonego.",
                "responses": {"200": {"description": "Lista e-ZLA pacjenta."}}
            }
        },
        "/api/l4/platnik": {
            "get": {
                "summary": "Zwolnienia lekarskie pracowników (widok pracodawcy)",
                "description": "Zwraca zwolnienia lekarskie wystawione na NIP zalogowanego pracodawcy z ukrytymi danymi medycznymi (RODO/ochrona medyczna).",
                "responses": {"200": {"description": "Lista e-ZLA dla pracodawcy."}}
            }
        },
        "/api/l4/wystaw": {
            "post": {
                "summary": "Wystawienie elektronicznego zaświadczenia lekarskiego e-ZLA",
                "description": "Dostępne wyłącznie dla lekarza posiadającego numer PWZ. Waliduje PESEL, NIP, okres zwolnienia i powiadamia PUE.",
                "responses": {
                    "201": {"description": "Pomyślnie wystawiono e-ZLA."},
                    "403": {"description": "Brak uprawnień lekarza."}
                }
            }
        },
        "/api/l4/kalkulator-zasilku": {
            "post": {
                "summary": "Kalkulator zasiłku chorobowego i wynagrodzenia za czas choroby",
                "description": "Dokładne wyliczenie kwoty świadczenia, stawki dziennej, podziału 33 dni (pracodawca) vs ZUS, podatku PIT i weryfikacja karencji.",
                "responses": {"200": {"description": "Wynik kalkulacji świadczenia chorobowego."}}
            }
        },
        "/api/l4/anuluj": {
            "post": {
                "summary": "Anulowanie wystawionego e-ZLA",
                "description": "Umożliwia lekarzowi lub inspektorowi ZUS anulowanie błędnego zwolnienia lekarskiego.",
                "responses": {"200": {"description": "Zaświadczenie zostało anulowane."}}
            }
        }
    }
}


def generuj_swagger_html() -> str:
    """Generuje kompletny interaktywny interfejs Swagger UI."""
    return f"""<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ZUS & e-ZLA API Docs - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>
    body {{ margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
    .topbar {{ background: #004d3d !important; }}
    .swagger-ui .topbar .download-url-wrapper {{ display: none; }}
    .zus-header {{ background: #006048; color: #fff; padding: 18px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }}
    .zus-header h1 {{ margin: 0 0 6px 0; font-size: 22px; font-weight: 700; }}
    .zus-header p {{ margin: 0; font-size: 14px; opacity: 0.9; }}
    .token-bar {{ background: #e8f5e9; padding: 12px 24px; border-bottom: 1px solid #c8e6c9; font-size: 13px; color: #2e7d32; display: flex; gap: 16px; flex-wrap: wrap; }}
    .token-bar code {{ background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #a5d6a7; font-weight: 600; }}
  </style>
</head>
<body>
  <div class="zus-header">
    <h1>Zakład Ubezpieczeń Społecznych &bull; e-ZLA / L4 REST API</h1>
    <p>Interfejs programistyczny dla pacjentów, lekarzy, płatników składek oraz instytucji ZUS</p>
  </div>
  <div class="token-bar">
    <span>Token Ubezpieczona (Marta): <code>token-marta-90031501248</code></span>
    <span>Token Przedsiębiorca (Jan): <code>token-jan-82041203478</code></span>
    <span>Token Lekarz (PWZ): <code>token-lekarz-pwz-7891234</code></span>
    <span>Token Płatnik (HR): <code>token-platnik-techpolska</code></span>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script>
    window.onload = () => {{
      window.ui = SwaggerUIBundle({{
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      }});
    }};
  </script>
</body>
</html>"""
