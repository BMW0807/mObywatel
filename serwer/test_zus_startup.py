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
        os.environ.pop('START_ZUS', None)
        sys.argv = ['server.py']
        self.assertFalse(server.czy_uruchomic_zus())

    def test_czy_uruchomic_zus_ze_zmiennej_srodowiskowej(self):
        sys.argv = ['server.py']
        for val in ('1', 'true', 'True', 'yes', 'tak', 'on'):
            os.environ['START_ZUS'] = val
            self.assertTrue(server.czy_uruchomic_zus(), f"Wartość '{val}' powinna włączyć ZUS")

        for val in ('0', 'false', 'no', 'nie', 'off', ''):
            os.environ['START_ZUS'] = val
            self.assertFalse(server.czy_uruchomic_zus(), f"Wartość '{val}' nie powinna włączyć ZUS")

    def test_czy_uruchomic_zus_z_flagi_cli(self):
        os.environ.pop('START_ZUS', None)
        sys.argv = ['server.py', '--start-zus']
        self.assertTrue(server.czy_uruchomic_zus())

        sys.argv = ['server.py', '8790', '--zus']
        self.assertTrue(server.czy_uruchomic_zus())

        # --no-zus wymusza wyłączenie nawet przy START_ZUS=1
        os.environ['START_ZUS'] = '1'
        sys.argv = ['server.py', '--no-zus']
        self.assertFalse(server.czy_uruchomic_zus())

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
