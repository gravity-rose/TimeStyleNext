#!/usr/bin/env python3
"""Serves the Clay config page over HTTP for WSL/headless emulator testing.

Handles the save redirect by forwarding to emu-app-config's callback port.
"""
import urllib.parse, urllib.request, re, http.server, sys, threading

tmpfile = sys.argv[1]
callback_port = sys.argv[2] if len(sys.argv) > 2 else None

with open(tmpfile) as f:
    content = f.read()

m = re.search(r'(data:text/html;charset=utf-8,[^\s]+)', content)
if not m:
    print("ERROR: No config URL found", file=sys.stderr)
    sys.exit(1)

html_raw = urllib.parse.unquote(m.group(1).replace('data:text/html;charset=utf-8,', ''))


class ConfigHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/close?'):
            query = self.path[len('/close?'):]

            # Forward to emu-app-config's callback
            if callback_port:
                try:
                    fwd = f'http://localhost:{callback_port}/close?{query}'
                    urllib.request.urlopen(fwd, timeout=5)
                    print(f"Settings forwarded to emulator (port {callback_port})")
                except Exception as e:
                    print(f"Forward failed: {e}")

            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h2>Settings saved!</h2>'
                             b'<p>Check the emulator. You can close this tab.</p>'
                             b'</body></html>')
        else:
            # Serve config page with return_to pointing to ourselves
            port = self.server.server_address[1]
            page = html_raw.replace('$$RETURN_TO$$',
                                    f'http://localhost:{port}/close?')
            page = page.replace('$$$RETURN_TO$$$',
                                f'http://localhost:{port}/close?')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(page.encode())

    def log_message(self, *args):
        pass


srv = http.server.HTTPServer(('localhost', 0), ConfigHandler)
port = srv.server_address[1]
print(f'http://localhost:{port}/')
sys.stdout.flush()
try:
    srv.serve_forever()
except KeyboardInterrupt:
    pass
