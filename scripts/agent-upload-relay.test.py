#!/usr/bin/env python3

import importlib.util
import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib import error, request


SHA = "a" * 40


class MockExternalHandler(BaseHTTPRequestHandler):
    run_status = "RUNNING"

    def log_message(self, *_args):
        pass

    def send_json(self, payload):
        body = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.endswith("/runs"):
            self.send_json({"run": {"id": "run-test-1", "status": "CREATING"}})
            return
        self.send_error(404)

    def do_GET(self):
        if self.path.endswith("/runs/run-test-1"):
            self.send_json({"id": "run-test-1", "status": self.run_status})
            return
        if "/commits/" in self.path:
            self.send_json({"sha": SHA})
            return
        if self.path.endswith(f"/{SHA}/index.html"):
            body = b"<html><body>generated</body></html>"
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_error(404)


def json_request(url, payload):
    req = request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with request.urlopen(req, timeout=5) as response:
        return response.status, response.headers, json.loads(response.read())


class RelayFlowTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.external = ThreadingHTTPServer(("127.0.0.1", 0), MockExternalHandler)
        threading.Thread(target=cls.external.serve_forever, daemon=True).start()
        external_url = f"http://127.0.0.1:{cls.external.server_port}"

        path = Path(__file__).with_name("agent-upload-relay.py")
        spec = importlib.util.spec_from_file_location("agent_upload_relay", path)
        cls.relay_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(cls.relay_module)
        relay = cls.relay_module
        relay.UPLOAD_TOKEN = "test-token"
        relay.CURSOR_API_KEY = "cursor-test"
        relay.DRY_RUN = False
        relay.CURSOR_API_BASE = external_url
        relay.GITHUB_API_BASE = external_url
        relay.RAW_GITHUB_BASE = external_url
        relay.PAGE_CACHE.clear()
        cls.temp = TemporaryDirectory()
        relay.DASHBOARD_PATH = Path(cls.temp.name) / "missing.xhtml"

        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), relay.UploadHandler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.external.shutdown()
        cls.temp.cleanup()

    def test_upload_status_and_generated_page(self):
        status, _, uploaded = json_request(
            f"{self.base}/upload",
            {"token": "test-token", "notes": "test", "images": []},
        )
        self.assertEqual(status, 200)
        self.assertEqual(uploaded["runId"], "run-test-1")

        _, _, running = json_request(
            f"{self.base}/status",
            {"token": "test-token", "runId": "run-test-1"},
        )
        self.assertEqual(running["status"], "RUNNING")

        MockExternalHandler.run_status = "FINISHED"
        _, _, finished = json_request(
            f"{self.base}/status",
            {"token": "test-token", "runId": "run-test-1"},
        )
        self.assertEqual(finished["status"], "FINISHED")
        self.assertEqual(finished["commitSha"], SHA)
        self.assertEqual(finished["pageUrl"], f"{self.base}/page/{SHA}")
        preview = (
            "https://htmlpreview.github.io/?"
            f"https://github.com/Lelouchzhu/MediDash/blob/{SHA}/index.html"
        )
        self.assertEqual(finished["githubUrl"], preview)
        self.assertEqual(finished["cdnUrl"], preview)

        with request.urlopen(finished["pageUrl"], timeout=5) as response:
            self.assertEqual(response.headers["Content-Type"].split(";")[0],
                             "text/html")
            self.assertIn(b"generated", response.read())

        with request.urlopen(f"{self.base}/latest", timeout=5) as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(response.url, f"{self.base}/latest")
            self.assertEqual(response.headers["Content-Type"].split(";")[0],
                             "text/html")
            self.assertIn(b"generated", response.read())

    def test_prompt_skips_cdn_and_tag(self):
        prompt = self.relay_module.build_prompt({"notes": "x"})
        self.assertIn("htmlpreview.github.io", prompt)
        self.assertIn("不要运行 build-index-xhtml.py", prompt)
        self.assertIn("不要移动 tag upload", prompt)
        self.assertNotIn("jsd.onmicrosoft.cn/gh/", prompt)

    def test_status_requires_token(self):
        with self.assertRaises(error.HTTPError) as raised:
            json_request(
                f"{self.base}/status",
                {"token": "wrong", "runId": "run-test-1"},
            )
        self.assertEqual(raised.exception.code, 401)


if __name__ == "__main__":
    unittest.main()
