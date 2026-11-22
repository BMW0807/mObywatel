import json
import unittest
from unittest.mock import patch

import agent


class _Response:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode()


class ZgodnyClientTests(unittest.TestCase):
    def test_tool_call_history_uses_null_assistant_content(self):
        messages = [
            {'role': 'assistant', 'content': [
                {'type': 'tool_use', 'id': 'call-1', 'name': 'status_pesel', 'input': {}},
            ]},
            {'role': 'user', 'content': [
                {'type': 'tool_result', 'tool_use_id': 'call-1', 'content': 'wynik'},
            ]},
        ]

        chat = agent.do_chat(messages)

        self.assertIsNone(chat[1]['content'])

    def test_request_omits_unsupported_parallel_tool_calls(self):
        captured = {}
        payload = {'id': 'x', 'model': 'test', 'choices': [
            {'message': {'role': 'assistant', 'content': 'Gotowe'}}
        ]}

        def fake_urlopen(request, timeout):
            captured['body'] = json.loads(request.data)
            return _Response(payload)

        with patch.object(agent, 'ZGODNY_MODEL', 'test-model'), \
                patch.object(agent, 'ZGODNY_BAZA', 'https://example.test/v1'), \
                patch.object(agent.urllib.request, 'urlopen', fake_urlopen):
            result = agent.zgodny([], 'test-secret', lambda _: None)

        self.assertEqual(result['content'][0]['text'], 'Gotowe')
        self.assertNotIn('parallel_tool_calls', captured['body'])

    def test_provider_error_redacts_api_key(self):
        class ErrorResponse:
            def read(self):
                return b'authorization test-secret'

            def close(self):
                pass

        import urllib.error

        def fake_urlopen(request, timeout):
            raise urllib.error.HTTPError(
                request.full_url, 401, 'unauthorized', {}, ErrorResponse()
            )

        with patch.object(agent, 'ZGODNY_MODEL', 'test-model'), \
                patch.object(agent, 'ZGODNY_BAZA', 'https://example.test/v1'), \
                patch.object(agent.urllib.request, 'urlopen', fake_urlopen):
            with self.assertRaises(agent.BladAPI) as raised:
                agent.zgodny([], 'test-secret', lambda _: None)

        self.assertNotIn('test-secret', str(raised.exception))
        self.assertIn('[REDACTED]', str(raised.exception))

    def test_pokaz_modul_tool_and_event(self):
        import narzedzia, dane
        self.assertIn('pokaz_modul', narzedzia.NAZWY_ODCZYTOW)
        self.assertIn('pokaz_modul', dane.READ)

        modules = ['zus_zla', 'karta_szczepien', 'ucc', 'pit', 'usc', 'pz', 'hdk', 'osp']
        for m in modules:
            d, k = dane.r_pokaz_modul({'modul': m}, {})
            self.assertEqual(d.get('modul'), m)
            self.assertIsNotNone(k)
            self.assertIn('title', k)
            self.assertIn('rows', k)

        tool_call_resp = {
            'content': [
                {'type': 'tool_use', 'id': 'call-mod-1', 'name': 'pokaz_modul', 'input': {'modul': 'zus_zla'}},
            ],
            'stop_reason': 'tool_use'
        }
        final_text_resp = {
            'content': [
                {'type': 'text', 'text': 'Oto Twoje aktywne zwolnienie lekarskie.'}
            ],
            'stop_reason': 'end_turn'
        }
        with patch.object(agent, 'llm', side_effect=[tool_call_resp, final_text_resp]):
            messages, stan, events, czeka = agent.run(
                [{'role': 'user', 'content': 'Pokaż moje zwolnienie L4'}],
                stan=None,
                osoba='marta'
            )
            modul_events = [e for e in events if e.get('t') == 'modul']
            self.assertEqual(len(modul_events), 1)
            self.assertEqual(modul_events[0].get('modul'), 'zus_zla')
            card_events = [e for e in events if e.get('t') == 'card']
            self.assertEqual(len(card_events), 1)


if __name__ == '__main__':
    unittest.main()
