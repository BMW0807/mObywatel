# -*- coding: utf-8 -*-
"""Testy automatyczne uruchamiania serwera ZUS w osobnym wątku."""
import os
import sys
import time
import unittest
import urllib.request
import json

HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

import server


class TestZUSStartup(unittest.TestCase):
    def setUp(self):
        self.orig_environ = dict(os.environ)
        self.orig_argv = list(sys.argv)

    def tearDown(self):
        os.environ.clear()
        os.environ.update(self.orig_environ)
        sys.argv = list(self.orig_argv)

    def test_czy_uruchomic_zus_domyslnie_false(self):
        os.environ.pop('START_ZUS_SEPARATE_PORT', None)
        os.environ.pop('START_ZUS', None)
        sys.argv = ['server.py']
        self.assertFalse(server.czy_uruchomic_zus())

    def test_czy_uruchomic_zus_ze_zmiennej_srodowiskowej(self):
        sys.argv = ['server.py']
        for val in ('1', 'true', 'True', 'yes', 'tak', 'on'):
            os.environ['START_ZUS_SEPARATE_PORT'] = val
            self.assertTrue(server.czy_uruchomic_zus(), f"Wartość '{val}' powinna włączyć ZUS")

        for val in ('0', 'false', 'no', 'nie', 'off', ''):
            os.environ['START_ZUS_SEPARATE_PORT'] = val
            self.assertFalse(server.czy_uruchomic_zus(), f"Wartość '{val}' nie powinna włączyć ZUS")

    def test_czy_uruchomic_zus_z_flagi_cli(self):
        os.environ.pop('START_ZUS_SEPARATE_PORT', None)
        sys.argv = ['server.py', '--start-zus']
        self.assertTrue(server.czy_uruchomic_zus())

        sys.argv = ['server.py', '8790', '--zus']
        self.assertTrue(server.czy_uruchomic_zus())

        # --no-zus wymusza wyłączenie nawet przy flagach
        os.environ['START_ZUS_SEPARATE_PORT'] = '1'
        sys.argv = ['server.py', '--no-zus']
        self.assertFalse(server.czy_uruchomic_zus())

    def test_zus_endpoints_na_glownym_porcie(self):
        test_port = 28791
        srv = server.ThreadingHTTPServer(('127.0.0.1', test_port), server.H)
        import threading
        t = threading.Thread(target=srv.serve_forever, daemon=True)
        t.start()
        try:
            # 1. /api/health zawiera informację o zus
            with urllib.request.urlopen(f"http://127.0.0.1:{test_port}/api/health", timeout=3) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                self.assertEqual(resp.status, 200)
                self.assertTrue(data.get("zus"))

            # 2. /docs (Swagger UI) działa bezpośrednio na głównym porcie
            with urllib.request.urlopen(f"http://127.0.0.1:{test_port}/docs", timeout=3) as resp:
                self.assertEqual(resp.status, 200)

            # 3. /openapi.json działa bezpośrednio na głównym porcie
            with urllib.request.urlopen(f"http://127.0.0.1:{test_port}/openapi.json", timeout=3) as resp:
                spec = json.loads(resp.read().decode('utf-8'))
                self.assertIn("openapi", spec)

            # 4. /api/zus/konto działa bezpośrednio na głównym porcie z autoryzacją
            req = urllib.request.Request(
                f"http://127.0.0.1:{test_port}/api/zus/konto?pesel=90031501245",
                headers={"Authorization": "Bearer token-marta-90031501245"}
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                konto = json.loads(resp.read().decode('utf-8'))
                self.assertEqual(resp.status, 200)
                self.assertEqual(konto.get("imie"), "Marta")
        finally:
            srv.shutdown()
            srv.server_close()

    def test_uruchom_zus_w_tle_i_healthcheck(self):
        # Uruchamiamy na losowym/wolnym porcie powyżej 20000
        test_port = 28795
        thread = server.uruchom_zus_w_tle(zus_port=test_port)
        self.assertIsNotNone(thread)
        self.assertTrue(thread.is_alive())
        self.assertTrue(thread.daemon)

        # Czekamy na gotowość endpointu health
        url = f"http://127.0.0.1:{test_port}/api/health"
        gotowy = False
        odpowiedz = None
        for _ in range(30):
            try:
                with urllib.request.urlopen(url, timeout=1) as resp:
                    if resp.status == 200:
                        gotowy = True
                        odpowiedz = json.loads(resp.read().decode('utf-8'))
                        break
            except Exception:
                time.sleep(0.1)

        self.assertTrue(gotowy, f"Endpoint {url} nie odpowiedział w oczekiwanym czasie")
        self.assertEqual(odpowiedz.get("status"), "ok")
        self.assertIn("ZUS", odpowiedz.get("service", ""))


if __name__ == '__main__':
    unittest.main()
