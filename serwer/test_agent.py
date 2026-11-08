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


if __name__ == '__main__':
    unittest.main()
