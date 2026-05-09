#!/usr/bin/env python3
"""Serves the Clay config page over HTTP and forwards saves to the emulator."""
import http.server, os, subprocess, sys, threading, time

html_file = sys.argv[1]
platform = sys.argv[2] if len(sys.argv) > 2 else 'emery'

with open(html_file) as f:
    html_raw = f.read()

import json, urllib.parse, dbm, glob

def find_emu_localstorage():
    """Find the pypkjs localStorage db for this platform's emulator."""
    sdk_dir = os.path.expanduser(f'~/.pebble-sdk')
    pattern = os.path.join(sdk_dir, '*', platform, 'localstorage', '*.dir')
    matches = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=True)
    if matches:
        return matches[0].rsplit('.', 1)[0]
    return None

def load_watch_settings():
    """Read clay-settings from the emulator's pypkjs localStorage."""
    db_path = find_emu_localstorage()
    if not db_path:
        return None
    try:
        db = dbm.open(db_path, 'r')
        raw = db.get(b'clay-settings', None)
        db.close()
        if raw:
            return json.loads(raw.decode())
    except Exception as e:
        print(f"Failed to read emulator settings: {e}")
    return None

PLATFORM_SCRIPT = """<script>window._tsOverridePlatform='""" + platform + """';</script>"""


def kill_stale_emu_configs():
    """Kill any leftover pebble emu-app-config processes."""
    try:
        out = subprocess.check_output(['pgrep', '-f', 'emu-app-config'],
                                      stderr=subprocess.DEVNULL).decode()
        for pid in out.strip().split('\n'):
            if pid:
                subprocess.run(['kill', pid], stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        pass

def forward_to_emulator(query):
    """Spawn a fresh emu-app-config, then hit its callback port with the settings."""
    import re, urllib.request
    kill_stale_emu_configs()
    proc = None
    try:
        proc = subprocess.Popen(
            ['pebble', 'emu-app-config', '--emulator', platform],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )

        port = None
        for attempt in range(20):
            time.sleep(0.5)
            try:
                out = subprocess.check_output(
                    ['ss', '-tlnp'], stderr=subprocess.DEVNULL
                ).decode()
                for line in out.splitlines():
                    if f'pid={proc.pid}' in line and 'pebble' in line:
                        m = re.search(r':(\d+)\s', line)
                        if m:
                            port = m.group(1)
                            break
            except Exception:
                pass
            if port:
                break

        if port:
            fwd = f'http://localhost:{port}/close?{query}'
            sys.stderr.write(f"Forwarding to emulator at port {port}...\n")
            urllib.request.urlopen(fwd, timeout=10)
            sys.stderr.write(f"Settings forwarded OK\n")
            time.sleep(1)
        else:
            sys.stderr.write(f"Could not find emu-app-config port (pid={proc.pid})\n")
    except Exception as e:
        sys.stderr.write(f"Forward failed: {e}\n")
    finally:
        if proc:
            proc.kill()


class ConfigHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/close?'):
            query = self.path[len('/close?'):]
            sys.stderr.write(f"Received settings ({len(query)} chars)\n")

            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<html><body><h2>Settings sent to watch.</h2>'
                             b'<p>Check the emulator.</p>'
                             b'</body></html>')

            threading.Thread(target=forward_to_emulator, args=(query,), daemon=True).start()
        else:
            port = self.server.server_address[1]
            page = html_raw.replace('$$RETURN_TO$$',
                                    f'http://localhost:{port}/close?')
            page = page.replace('$$$RETURN_TO$$$',
                                f'http://localhost:{port}/close?')

            watch_settings = load_watch_settings()
            if watch_settings:
                page = page.replace('window.claySettings={}',
                                    f'window.claySettings={json.dumps(watch_settings)}')
            page = page.replace('</head>', PLATFORM_SCRIPT + '</head>')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(page.encode())

    def log_message(self, *args):
        pass


srv = http.server.HTTPServer(('localhost', 33333), ConfigHandler)
port = srv.server_address[1]
print(f'http://localhost:{port}/')
sys.stdout.flush()
try:
    srv.serve_forever()
except KeyboardInterrupt:
    pass
