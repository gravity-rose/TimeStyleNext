#!/usr/bin/env python3
"""Serves the Clay config page over HTTP and forwards saves to the emulator."""
import http.server, os, subprocess, sys, threading, time

html_file = sys.argv[1]
platform = sys.argv[2] if len(sys.argv) > 2 else 'emery'

with open(html_file) as f:
    html_raw = f.read()


def forward_to_emulator(query):
    """Spawn a fresh emu-app-config, then hit its callback port with the settings."""
    try:
        proc = subprocess.Popen(
            ['pebble', 'emu-app-config', '--emulator', platform, '--file', '/dev/null'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        time.sleep(2)

        import socket
        # find the port this process is listening on
        port = None
        try:
            out = subprocess.check_output(
                ['ss', '-tlnp'], stderr=subprocess.DEVNULL
            ).decode()
            for line in out.splitlines():
                if f'pid={proc.pid}' in line:
                    import re
                    m = re.search(r':(\d+)\s', line)
                    if m:
                        port = m.group(1)
                        break
        except Exception:
            pass

        if port:
            import urllib.request
            fwd = f'http://localhost:{port}/close?{query}'
            urllib.request.urlopen(fwd, timeout=5)
            print(f"Settings forwarded to emulator via port {port}")
        else:
            print("Could not find emu-app-config callback port")
            proc.kill()
    except Exception as e:
        print(f"Forward failed: {e}")


class ConfigHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/close?'):
            query = self.path[len('/close?'):]

            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h2>Settings saved!</h2>'
                             b'<p>Check the emulator. You can close this tab.</p>'
                             b'</body></html>')

            threading.Thread(target=forward_to_emulator, args=(query,), daemon=True).start()
        else:
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
