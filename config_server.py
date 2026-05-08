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

PLATFORM_SCRIPT = """<script>
(function() {
  var PLATFORM = '""" + platform + """';
  var isRound = (PLATFORM === 'chalk' || PLATFORM === 'gabbro');
  var isSmallRound = (PLATFORM === 'chalk');
  var isLarge = (PLATFORM === 'gabbro' || PLATFORM === 'emery');
  var CONFIGS_KEY = 'timestyle-saved-configs';
  var EDIT_NAME_KEY = 'timestyle-edit-name';

  // When loading a saved config (Edit or Send), override window.claySettings.
  // Clear flags immediately to prevent stale flags from breaking future loads.
  try {
    var _editFlag = localStorage.getItem(EDIT_NAME_KEY);
    var _sendFlag = localStorage.getItem('timestyle-auto-send');
    if (_editFlag || _sendFlag) {
      var _saved = localStorage.getItem('clay-settings');
      if (_saved) {
        var _parsed = JSON.parse(_saved);
        if (_parsed && typeof _parsed === 'object' && Object.keys(_parsed).length > 3) {
          window.claySettings = _parsed;
        }
      }
    }
  } catch(e) {
    localStorage.removeItem(EDIT_NAME_KEY);
    localStorage.removeItem('timestyle-auto-send');
    localStorage.removeItem('clay-settings');
  }

  // --- Saved configs storage ---
  function loadConfigs() {
    try { return JSON.parse(localStorage.getItem(CONFIGS_KEY)) || []; }
    catch(e) { return []; }
  }
  function saveConfigs(configs) {
    localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
  }
  function getPlatformConfigs() {
    return loadConfigs().filter(function(c) { return c.platform === PLATFORM; });
  }

  // --- Serialize current form state ---
  function getConfigItems() {
    var items = [];
    (window.clayConfig || []).forEach(function(entry) {
      if (entry.items) {
        entry.items.forEach(function(item) {
          if (item.messageKey) items.push(item);
        });
      } else if (entry.messageKey) {
        items.push(entry);
      }
    });
    return items;
  }

  function serializeForm() {
    var manipulableTypes = ['select','toggle','color','input','slider'];
    var targets = document.querySelectorAll('.component-select [data-manipulator-target],' +
      '.component-toggle [data-manipulator-target],' +
      '.component-color [data-manipulator-target],' +
      '.component-input [data-manipulator-target],' +
      '.component-slider [data-manipulator-target]');
    var settings = {};
    var targetIdx = 0;

    (window.clayConfig || []).forEach(function(entry) {
      var items = entry.items || [entry];
      items.forEach(function(item) {
        if (manipulableTypes.indexOf(item.type) === -1) return;
        if (targetIdx >= targets.length) return;
        var el = targets[targetIdx++];
        if (!item.messageKey) return;
        switch (item.type) {
          case 'select':
            settings[item.messageKey] = el.value; break;
          case 'toggle':
            settings[item.messageKey] = el.checked; break;
          case 'color':
            var cv = parseInt(el.value, 10);
            settings[item.messageKey] = isNaN(cv) ? 0 : cv; break;
          case 'input':
            settings[item.messageKey] = el.value; break;
          case 'slider':
            settings[item.messageKey] = parseInt(el.value, 10); break;
        }
      });
    });
    return settings;
  }

  var COLOR_NAMES = {
    '000000':'Black','ffffff':'White','aaaaaa':'Gray','555555':'DkGray',
    'ff0000':'Red','ff5500':'Orange','ffaa00':'Amber','ffff00':'Yellow',
    'aaff00':'Lime','55ff00':'Green','00ff00':'Bright Green',
    '00ff55':'Mint','00ffaa':'Teal','00ffff':'Cyan',
    '00aaff':'Sky','0055ff':'Blue','0000ff':'Bright Blue',
    '5500ff':'Indigo','aa00ff':'Purple','ff00ff':'Magenta',
    'ff00aa':'Pink','ff0055':'Rose',
    'aa0000':'DkRed','005500':'DkGreen','000055':'Navy',
    '550000':'Maroon','005555':'DkTeal','550055':'DkPurple',
    'aaaa00':'Olive','00aa00':'Forest','0000aa':'DkBlue',
    'ffaaaa':'LtPink','aaffaa':'LtGreen','aaaaff':'LtBlue',
    'ffffaa':'LtYellow','ffaaff':'LtMagenta','aaffff':'LtCyan',
    '555500':'DkOlive','aa5500':'Brown','55aa00':'Grass',
    '00aa55':'Jade','0055aa':'Steel','5500aa':'Grape',
    'aa0055':'Berry','aa00aa':'Violet','5555ff':'Periwinkle',
    '55ff55':'Pastel Green','ff5555':'Salmon','ff55ff':'Hot Pink',
    'ffff55':'Bright Yellow','55ffff':'Aqua','ff5500':'Tangerine'
  };

  function colorName(val) {
    if (val === undefined || val === null) return '?';
    var hex = (val & 0xFFFFFF).toString(16).padStart(6,'0').toLowerCase();
    return COLOR_NAMES[hex] || '#' + hex;
  }

  function getDefaultConfigName() {
    var posNames = {0:'None',1:'Left',2:'Right',3:'Bottom',4:'Top'};
    var settings = serializeForm();
    var pos = posNames[settings.SettingSidebarPosition] || 'Side';
    return pos + ' - ' + colorName(settings.SettingColorBG) + ' / ' + colorName(settings.SettingColorSidebar);
  }

  // --- Save config flow (client-side only, does NOT send to watch) ---
  function doSaveConfig() {
    var editName = localStorage.getItem(EDIT_NAME_KEY) || '';
    var defaultName = editName || getDefaultConfigName();
    var name = prompt('Configuration name:', defaultName);
    if (!name) return;

    var configs = loadConfigs();
    var existing = configs.findIndex(function(c) { return c.name === name && c.platform === PLATFORM; });
    if (existing !== -1) {
      if (!confirm('A configuration named "' + name + '" already exists for ' + PLATFORM + '. Overwrite?')) return;
      configs[existing].settings = serializeForm();
      configs[existing].updated = Date.now();
    } else {
      configs.push({ name: name, platform: PLATFORM, settings: serializeForm(), created: Date.now() });
    }
    saveConfigs(configs);
    localStorage.removeItem(EDIT_NAME_KEY);
    alert('Configuration "' + name + '" saved.');
  }

  // --- Load config into Clay form ---
  function loadConfigIntoForm(config) {
    localStorage.setItem('clay-settings', JSON.stringify(config.settings));
    localStorage.setItem(EDIT_NAME_KEY, config.name);
    location.reload();
  }

  // --- Send config directly to watch ---
  function sendConfigToWatch(config) {
    localStorage.setItem('clay-settings', JSON.stringify(config.settings));
    localStorage.setItem('timestyle-auto-send', 'true');
    location.reload();
  }

  // --- Delete config ---
  function deleteConfig(name) {
    if (!confirm('Delete configuration "' + name + '"?')) return;
    var configs = loadConfigs().filter(function(c) { return !(c.name === name && c.platform === PLATFORM); });
    saveConfigs(configs);
    renderConfigsList();
  }

  // --- Tab bar ---
  var tabBar, configsPage;

  function createTabBar() {
    var mainForm = document.querySelector('#main-form');
    tabBar = document.createElement('div');
    tabBar.id = 'ts-tabs';
    tabBar.style.cssText = 'display:flex;max-width:400px;margin:0 auto;font-family:sans-serif;';
    tabBar.innerHTML =
      '<button id="ts-tab-edit" style="flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;">Edit Config</button>' +
      '<button id="ts-tab-saved" style="flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;">Saved Configs</button>';
    mainForm.parentNode.insertBefore(tabBar, mainForm);

    configsPage = document.createElement('div');
    configsPage.id = 'configs-page';
    configsPage.style.cssText = 'max-width:400px;margin:0 auto;padding:10px;font-family:sans-serif;display:none;';
    mainForm.parentNode.insertBefore(configsPage, mainForm.nextSibling);

    document.getElementById('ts-tab-edit').addEventListener('click', function() { switchTab('edit'); });
    document.getElementById('ts-tab-saved').addEventListener('click', function() { switchTab('saved'); });
    switchTab('edit');
  }

  function switchTab(tab) {
    var mainForm = document.querySelector('#main-form');
    var editTab = document.getElementById('ts-tab-edit');
    var savedTab = document.getElementById('ts-tab-saved');
    var activeStyle = 'flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;background:#4a90d9;color:#fff;';
    var inactiveStyle = 'flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;background:#e0e0e0;color:#333;';

    if (tab === 'edit') {
      mainForm.style.display = '';
      configsPage.style.display = 'none';
      editTab.style.cssText = activeStyle;
      savedTab.style.cssText = inactiveStyle;
    } else {
      mainForm.style.display = 'none';
      configsPage.style.display = '';
      editTab.style.cssText = inactiveStyle;
      savedTab.style.cssText = activeStyle;
      renderConfigsList();
    }
  }

  // --- Configs list page ---
  function renderConfigsList() {
    var configs = getPlatformConfigs();
    var html = '<p style="text-align:center;color:#666;font-size:13px;margin:8px 0;">Platform: ' + PLATFORM + '</p>';

    if (configs.length === 0) {
      html += '<p style="text-align:center;color:#999;padding:20px;">No saved configurations for ' + PLATFORM + '.</p>';
    } else {
      configs.forEach(function(c, idx) {
        var date = new Date(c.updated || c.created).toLocaleDateString();
        html += '<div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:14px;margin:10px 0;">' +
          '<div style="font-weight:bold;font-size:15px;color:#222;margin-bottom:4px;">' + c.name.replace(/</g,'&lt;') + '</div>' +
          '<div style="font-size:12px;color:#888;margin-bottom:10px;">' + date + '</div>' +
          '<div style="display:flex;gap:6px;">' +
          '<button data-action="edit" data-idx="' + idx + '" ' +
            'style="flex:2;padding:8px;border:none;border-radius:4px;background:#4a90d9;color:#fff;cursor:pointer;font-size:13px;min-width:0;">Edit</button>' +
          '<button data-action="send" data-idx="' + idx + '" ' +
            'style="flex:2;padding:8px;border:none;border-radius:4px;background:#5cb85c;color:#fff;cursor:pointer;font-size:13px;min-width:0;">Send</button>' +
          '<button data-action="delete" data-idx="' + idx + '" ' +
            'style="flex:1;padding:8px;border:none;border-radius:4px;background:#d9534f;color:#fff;cursor:pointer;font-weight:bold;font-size:13px;min-width:0;">Del</button>' +
          '</div></div>';
      });
    }
    configsPage.innerHTML = html;

    configsPage.querySelectorAll('[data-action]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var configs = getPlatformConfigs();
        var config = configs[parseInt(btn.dataset.idx, 10)];
        if (!config) return;
        if (btn.dataset.action === 'edit') loadConfigIntoForm(config);
        else if (btn.dataset.action === 'send') sendConfigToWatch(config);
        else if (btn.dataset.action === 'delete') deleteConfig(config.name);
      });
    });
  }

  // (config list buttons use addEventListener via data-action attributes)

  // --- Apply platform tweaks and add buttons ---
  function applyTweaks() {
    var submitBtn = document.querySelector('.component-submit button[type=submit]');
    if (!submitBtn) return false;

    // Rename submit button
    submitBtn.textContent = 'Send to Watch';

    // Platform-specific tweaks
    var headings = document.querySelectorAll('.component-heading');
    if (isRound) {
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].textContent.trim() === 'Calendar') {
          var section = headings[i].closest('.section');
          if (section) section.style.display = 'none';
        }
      }
    }
    if (isLarge) {
      var labels = document.querySelectorAll('.label');
      for (var i = 0; i < labels.length; i++) {
        if (labels[i].textContent.indexOf('Top/Bottom bar only') !== -1) {
          labels[i].textContent = 'Widget 4';
        }
      }
    }
    if (isSmallRound) {
      var selects = document.querySelectorAll('.component-select');
      for (var i = 0; i < selects.length; i++) {
        var lbl = selects[i].querySelector('.label');
        if (lbl && (lbl.textContent.indexOf('Widget 2') !== -1 ||
                    lbl.textContent.indexOf('Widget 4') !== -1)) {
          selects[i].style.display = 'none';
        }
      }
    }

    // Make buttons side-by-side
    var submitComponent = submitBtn.closest('.component-submit') || submitBtn.parentNode;
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:8px;';

    submitBtn.style.cssText = 'flex:1;padding:12px;border:none;border-radius:4px;background:#5cb85c;color:#fff;cursor:pointer;font-size:15px;';

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Save Configuration';
    saveBtn.style.cssText = 'flex:1;padding:12px;border:none;border-radius:4px;background:#f0ad4e;color:#fff;cursor:pointer;font-size:15px;';
    saveBtn.addEventListener('click', function(e) { e.preventDefault(); doSaveConfig(); });

    btnRow.appendChild(submitBtn);
    btnRow.appendChild(saveBtn);
    submitComponent.appendChild(btnRow);

    // Create tab bar
    createTabBar();

    // Auto-send: triggered by sendConfigToWatch after reload
    if (localStorage.getItem('timestyle-auto-send') === 'true') {
      localStorage.removeItem('timestyle-auto-send');
      setTimeout(function() {
        document.querySelector('#main-form button[type=submit]').click();
      }, 200);
    }

    return true;
  }

  var attempts = 0;
  var timer = setInterval(function() {
    if (applyTweaks() || ++attempts > 50) clearInterval(timer);
  }, 100);
})();
</script>"""


def forward_to_emulator(query):
    """Spawn a fresh emu-app-config, then hit its callback port with the settings."""
    try:
        proc = subprocess.Popen(
            ['pebble', 'emu-app-config', '--emulator', platform, '--file', '/dev/null'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
        )
        time.sleep(3)

        port = None
        try:
            out = subprocess.check_output(
                ['ss', '-tlnp'], stderr=subprocess.DEVNULL
            ).decode()
            for line in out.splitlines():
                if f'pid={proc.pid}' in line and 'pebble' in line:
                    import re
                    m = re.search(r':(\d+)\s', line)
                    if m:
                        port = m.group(1)
                        break
        except Exception as e:
            print(f"Port detection failed: {e}")

        if port:
            import urllib.request
            fwd = f'http://localhost:{port}/close?{query}'
            sys.stderr.write(f"Forwarding to emulator at port {port}...\n")
            urllib.request.urlopen(fwd, timeout=10)
            sys.stderr.write(f"Settings forwarded OK\n")
        else:
            sys.stderr.write(f"Could not find emu-app-config port (pid={proc.pid})\n")
            try:
                out = subprocess.check_output(['ss', '-tlnp'], stderr=subprocess.DEVNULL).decode()
                sys.stderr.write(f"Listening sockets:\n{out}\n")
            except Exception:
                pass
            proc.kill()
    except Exception as e:
        sys.stderr.write(f"Forward failed: {e}\n")


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
