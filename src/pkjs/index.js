// SPDX-License-Identifier: MIT AND CC-BY-NC-SA-4.0
// Original: MIT (freakified/plarus)  Modifications: CC-BY-NC-SA-4.0 (gravity-rose)
var Clay = require('pebble-clay');
var clayConfig = require('./config');
var weather = require('./weather');
var languages = require('./languages');
var keys = require('message_keys');

var customConfigUi = function() {
  var clayInstance = this;
  var meta = this.meta || {};
  var wi = meta.activeWatchInfo || {};
  var PLATFORM = wi.platform || 'basalt';
  var isRound = (PLATFORM === 'chalk' || PLATFORM === 'gabbro');
  var isSmallRound = (PLATFORM === 'chalk');
  var isLarge = (PLATFORM === 'gabbro' || PLATFORM === 'emery');
  var CONFIGS_KEY = 'timestyle-saved-configs';
  var EDIT_NAME_KEY = 'timestyle-edit-name';

  var PRESET_DEFAULTS = {
    SettingColorBG: 0x000000, SettingSidebarTextColor: 0x000000,
    SettingClockFontId: '0', SettingShowLeadingZero: false, SettingCenterTime: false,
    SettingSidebarPosition: '3', SettingUseLargeFonts: false,
    SettingWidget0ID: '2', SettingWidget1ID: '7', SettingWidget2ID: '10', SettingWidget3ID: '6',
    SettingDisconnectIcon: true, SettingBluetoothVibe: false, SettingHourlyVibe: '0',
    SettingUseMetric: true, SettingShowBatteryPct: true, SettingDisableAutobattery: false,
    SettingHealthActivityDisplay: '0', SettingHealthUseRestfulSleep: false,
    SettingDecimalSep: '.', SettingAltClockName: 'ALT', SettingAltClockOffset: 0,
    SettingLanguageID: '0', SettingShowNextAppt: true
  };
  function makePreset(name, tc, sc, bg) {
    var s = JSON.parse(JSON.stringify(PRESET_DEFAULTS));
    s.SettingColorTime = tc; s.SettingColorSidebar = sc;
    if (bg !== undefined) { s.SettingColorBG = bg; }
    return { name: name, settings: s };
  }
  var STANDARD_CONFIGS = [
    makePreset('Orange Dreams', 0xFF5500, 0xFF5500),
    makePreset('Blue Screen', 0x00FFFF, 0x00FFFF),
    makePreset('Timeline-Past', 0x000000, 0xFFAAAA, 0xFFFFFF),
    makePreset('Terminal Green', 0x00FF00, 0x00FF00),
    makePreset('Ultra Violet', 0xAA55FF, 0xAA55FF),
    makePreset('Dark Past', 0xFF0000, 0xFFAAAA),
    makePreset('Pretty in Pink', 0xFF55AA, 0xFF55AA),
    makePreset('Red Velvet', 0xFF0000, 0xFF0000),
    makePreset('Lime', 0x000000, 0x55FF00, 0xFFFFFF)
  ];
  function isStandardName(name) {
    return STANDARD_CONFIGS.some(function(c) { return c.name === name; });
  }

  var hasStorage = false;
  try { localStorage.getItem('_ts_test'); hasStorage = true; } catch(e) {}

  if (hasStorage) {
    try {
      var _ef = localStorage.getItem(EDIT_NAME_KEY);
      var _sf = localStorage.getItem('timestyle-auto-send');
      if (_ef || _sf) {
        var _saved = localStorage.getItem('clay-settings');
        if (_saved) {
          var _parsed = JSON.parse(_saved);
          if (_parsed && typeof _parsed === 'object' && Object.keys(_parsed).length > 3) {
            window.claySettings = _parsed;
          }
        }
      }
    } catch(e) {
      try { localStorage.removeItem(EDIT_NAME_KEY); localStorage.removeItem('timestyle-auto-send'); localStorage.removeItem('clay-settings'); } catch(e2) {}
    }
  }

  try {
    var _hash = location.hash || '';
    if (_hash.indexOf('tsc=') !== -1) {
      window._tsSavedConfigs = JSON.parse(decodeURIComponent(_hash.split('tsc=')[1]));
    }
  } catch(e) {}
  if (!window._tsSavedConfigs) window._tsSavedConfigs = [];

  function loadConfigs() {
    if (hasStorage) {
      try { return JSON.parse(localStorage.getItem(CONFIGS_KEY)) || []; } catch(e) {}
    }
    return window._tsSavedConfigs || [];
  }
  function saveConfigs(configs) {
    window._tsSavedConfigs = configs;
    if (hasStorage) localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
  }

  function serializeForm() {
    var types = ['select','toggle','color','input','slider'];
    var targets = document.querySelectorAll('.component-select [data-manipulator-target],.component-toggle [data-manipulator-target],.component-color [data-manipulator-target],.component-input [data-manipulator-target],.component-slider [data-manipulator-target]');
    var settings = {}, ti = 0;
    (window.clayConfig || []).forEach(function(entry) {
      (entry.items || [entry]).forEach(function(item) {
        if (types.indexOf(item.type) === -1) return;
        if (ti >= targets.length) return;
        var el = targets[ti++];
        if (!item.messageKey) return;
        switch (item.type) {
          case 'select': settings[item.messageKey] = el.value; break;
          case 'toggle': settings[item.messageKey] = el.checked; break;
          case 'color': var cv = parseInt(el.value, 10); settings[item.messageKey] = isNaN(cv) ? 0 : cv; break;
          case 'input': settings[item.messageKey] = el.value; break;
          case 'slider': settings[item.messageKey] = parseInt(el.value, 10); break;
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
    'ff00aa':'Pink','ff0055':'Rose','aa0000':'DkRed','005500':'DkGreen',
    '000055':'Navy','550000':'Maroon','005555':'DkTeal','550055':'DkPurple',
    'aaaa00':'Olive','00aa00':'Forest','0000aa':'DkBlue',
    'ffaaaa':'LtPink','aaffaa':'LtGreen','aaaaff':'LtBlue',
    'ffffaa':'LtYellow','ffaaff':'LtMagenta','aaffff':'LtCyan',
    '555500':'DkOlive','aa5500':'Brown','55aa00':'Grass',
    '00aa55':'Jade','0055aa':'Steel','5500aa':'Grape',
    'aa0055':'Berry','aa00aa':'Violet','5555ff':'Periwinkle',
    '55ff55':'Pastel Green','ff5555':'Salmon','ff55ff':'Hot Pink',
    'ffff55':'Bright Yellow','55ffff':'Aqua'
  };
  function colorName(val) {
    if (val === undefined || val === null) return '?';
    var hex = (val & 0xFFFFFF).toString(16).padStart(6,'0').toLowerCase();
    return COLOR_NAMES[hex] || '#' + hex;
  }
  function getDefaultConfigName() {
    var posNames = {0:'None',1:'Left',2:'Right',3:'Bottom',4:'Top'};
    var s = serializeForm();
    return (posNames[s.SettingSidebarPosition] || 'Side') + ' - ' + colorName(s.SettingColorBG) + ' / ' + colorName(s.SettingColorSidebar);
  }

  function doSaveConfig() {
    var editName = (hasStorage && localStorage.getItem(EDIT_NAME_KEY)) || '';
    var name = prompt('Configuration name:', editName || getDefaultConfigName());
    if (!name) return;
    if (isStandardName(name)) { alert('Cannot overwrite standard preset "' + name + '".'); return; }
    var configs = loadConfigs();
    var existing = configs.findIndex(function(c) { return c.name === name; });
    if (existing !== -1) {
      if (!confirm('"' + name + '" exists. Overwrite?')) return;
      configs[existing].settings = serializeForm(); configs[existing].updated = Date.now();
    } else {
      configs.push({ name: name, settings: serializeForm(), created: Date.now() });
    }
    saveConfigs(configs); localStorage.removeItem(EDIT_NAME_KEY);
    alert('"' + name + '" saved.');
  }
  function applySettingsToForm(settings) {
    var types = ['select','toggle','color','input','slider'];
    var targets = document.querySelectorAll('.component-select [data-manipulator-target],.component-toggle [data-manipulator-target],.component-color [data-manipulator-target],.component-input [data-manipulator-target],.component-slider [data-manipulator-target]');
    var ti = 0;
    (window.clayConfig || []).forEach(function(entry) {
      (entry.items || [entry]).forEach(function(item) {
        if (types.indexOf(item.type) === -1) return;
        if (ti >= targets.length) return;
        var el = targets[ti++];
        if (!item.messageKey) return;
        var val = settings[item.messageKey];
        if (val === undefined) return;
        switch (item.type) {
          case 'color': el.value = val; var swatch = el.closest('.component-color'); if (swatch) { var sv = swatch.querySelector('.value'); if (sv) { var hex = (val & 0xFFFFFF).toString(16).padStart(6,'0'); sv.style.backgroundColor = '#' + hex; } } break;
          case 'toggle': el.checked = !!val; break;
          case 'slider': el.value = val; var out = el.parentNode && el.parentNode.querySelector('output'); if (out) out.textContent = val; break;
          default: el.value = '' + val; break;
        }
      });
    });
  }
  function loadConfigIntoForm(config) {
    if (hasStorage) {
      localStorage.setItem('clay-settings', JSON.stringify(config.settings));
      localStorage.setItem(EDIT_NAME_KEY, config.name); location.reload();
    } else {
      applySettingsToForm(config.settings);
      switchTab('edit');
    }
  }
  function sendConfigToWatch(config) {
    if (hasStorage) {
      localStorage.setItem('clay-settings', JSON.stringify(config.settings));
      localStorage.setItem('timestyle-auto-send', 'true'); location.reload();
    } else {
      applySettingsToForm(config.settings);
      switchTab('edit');
      setTimeout(function() { document.querySelector('#main-form button[type=submit]').click(); }, 100);
    }
  }
  function deleteConfig(name) {
    if (!confirm('Delete "' + name + '"?')) return;
    saveConfigs(loadConfigs().filter(function(c) { return c.name !== name; }));
    renderConfigsList();
  }

  var tabBar, configsPage;
  function createTabBar() {
    var mf = document.querySelector('#main-form');
    tabBar = document.createElement('div');
    tabBar.id = 'ts-tabs';
    tabBar.style.cssText = 'display:flex;max-width:400px;margin:0 auto;font-family:sans-serif;';
    tabBar.innerHTML = '<button id="ts-tab-edit" style="flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;">Edit Config</button><button id="ts-tab-saved" style="flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;">Saved Configs</button>';
    mf.parentNode.insertBefore(tabBar, mf);
    configsPage = document.createElement('div');
    configsPage.id = 'configs-page';
    configsPage.style.cssText = 'max-width:400px;margin:0 auto;padding:10px;font-family:sans-serif;display:none;box-sizing:border-box;';
    mf.parentNode.insertBefore(configsPage, mf.nextSibling);
    document.getElementById('ts-tab-edit').addEventListener('click', function() { switchTab('edit'); });
    document.getElementById('ts-tab-saved').addEventListener('click', function() { switchTab('saved'); });
    switchTab('edit');
  }
  function switchTab(tab) {
    var mf = document.querySelector('#main-form');
    var et = document.getElementById('ts-tab-edit'), st = document.getElementById('ts-tab-saved');
    var a = 'flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;background:#4a90d9;color:#fff;';
    var n = 'flex:1;padding:12px;border:none;cursor:pointer;font-size:15px;font-weight:bold;background:#e0e0e0;color:#333;';
    if (tab === 'edit') { mf.style.display=''; configsPage.style.display='none'; et.style.cssText=a; st.style.cssText=n; }
    else { mf.style.display='none'; configsPage.style.display=''; et.style.cssText=n; st.style.cssText=a; renderConfigsList(); }
  }
  function renderConfigCard(c, source, idx, showDelete) {
    var b = 'padding:4px 10px;border:none;border-radius:3px;color:#fff;cursor:pointer;font-size:12px;min-width:0;margin:0;text-transform:none;line-height:normal;flex-shrink:0;';
    var html = '<div style="display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #ddd;border-radius:6px;padding:6px 8px;margin:3px 0;box-sizing:border-box;">' +
      '<span style="flex:1;min-width:0;font-size:15px;color:#222;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + c.name.replace(/</g,'&lt;') + '</span>' +
      '<button data-action="edit" data-source="' + source + '" data-idx="' + idx + '" style="' + b + 'background:#4a90d9;">Edit</button>' +
      '<button data-action="send" data-source="' + source + '" data-idx="' + idx + '" style="' + b + 'background:#5cb85c;">Send</button>';
    if (showDelete) html += '<button data-action="delete" data-source="' + source + '" data-idx="' + idx + '" style="' + b + 'background:#d9534f;">Del</button>';
    return html + '</div>';
  }
  function renderConfigsList() {
    var uc = loadConfigs(), html = '';
    if (uc.length > 0) {
      html += '<p style="font-weight:bold;font-size:13px;color:#555;margin:8px 0 2px 4px;">Your Configs</p>';
      uc.forEach(function(c, i) { html += renderConfigCard(c, 'user', i, true); });
    }
    html += '<p style="font-weight:bold;font-size:13px;color:#555;margin:' + (uc.length > 0 ? '12' : '8') + 'px 0 2px 4px;">Presets</p>';
    STANDARD_CONFIGS.forEach(function(c, i) { html += renderConfigCard(c, 'standard', i, false); });
    html += '<div style="margin:16px 0 8px;"><button id="ts-close-save-bottom" style="display:block;width:100%;padding:10px;border:none;border-radius:4px;background:#888;color:#fff;cursor:pointer;font-size:14px;min-width:0;margin:0;">Close & Save</button></div>';
    configsPage.innerHTML = html;
    document.getElementById('ts-close-save-bottom').addEventListener('click', function(e) {
      e.preventDefault();
      var data = { _tsSavedConfigs: window._tsSavedConfigs || [], _closeOnly: true };
      location.href = (window.returnTo || 'pebblejs://close#') + encodeURIComponent(JSON.stringify(data));
    });
    configsPage.querySelectorAll('[data-action]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var src = btn.dataset.source, idx = parseInt(btn.dataset.idx, 10);
        var config = src === 'standard' ? STANDARD_CONFIGS[idx] : loadConfigs()[idx];
        if (!config) return;
        if (btn.dataset.action === 'edit') loadConfigIntoForm(config);
        else if (btn.dataset.action === 'send') sendConfigToWatch(config);
        else if (btn.dataset.action === 'delete') deleteConfig(config.name);
      });
    });
  }
  function applyTweaks() {
    var sb = document.querySelector('.component-submit button[type=submit]');
    if (!sb) return false;
    sb.textContent = 'Send to Watch';
    if (isRound) { var hd = document.querySelectorAll('.component-heading'); for (var i=0;i<hd.length;i++) if (hd[i].textContent.trim()==='Calendar') { var sec=hd[i].closest('.section'); if(sec) sec.style.display='none'; } }
    if (isLarge) { var lb = document.querySelectorAll('.label'); for (var i=0;i<lb.length;i++) if (lb[i].textContent.indexOf('Top/Bottom bar only')!==-1) lb[i].textContent='Widget 4'; }
    if (isSmallRound) { var sl = document.querySelectorAll('.component-select'); for (var i=0;i<sl.length;i++) { var l=sl[i].querySelector('.label'); if(l&&(l.textContent.indexOf('Widget 2')!==-1||l.textContent.indexOf('Widget 4')!==-1)) sl[i].style.display='none'; } }
    var sc = sb.closest('.component-submit') || sb.parentNode;
    sb.style.cssText = 'display:block;width:100%;padding:12px;border:none;border-radius:4px;background:#5cb85c;color:#fff;cursor:pointer;font-size:15px;margin:0 0 8px;min-width:0;';
    var br = document.createElement('div'); br.style.cssText = 'display:flex;gap:8px;';
    var sv = document.createElement('button'); sv.type='button'; sv.textContent='Save Configuration';
    sv.style.cssText = 'flex:1;padding:10px 0;border:none;border-radius:4px;background:#f0ad4e;color:#fff;cursor:pointer;font-size:14px;min-width:0;margin:0;';
    sv.addEventListener('click', function(e) { e.preventDefault(); doSaveConfig(); });
    var cl = document.createElement('button'); cl.type='button'; cl.textContent='Close & Save';
    cl.style.cssText = 'flex:1;padding:10px 0;border:none;border-radius:4px;background:#888;color:#fff;cursor:pointer;font-size:14px;min-width:0;margin:0;';
    cl.addEventListener('click', function(e) {
      e.preventDefault();
      var data = { _tsSavedConfigs: window._tsSavedConfigs || [], _closeOnly: true };
      location.href = (window.returnTo || 'pebblejs://close#') + encodeURIComponent(JSON.stringify(data));
    });
    sc.appendChild(sb); br.appendChild(sv); br.appendChild(cl); sc.appendChild(br);
    var note = document.createElement('div');
    note.style.cssText = 'max-width:400px;margin:4px auto 0;padding:6px 10px;font-size:11px;color:#888;font-family:sans-serif;text-align:center;';
    note.textContent = 'Use Close & Save to store saved configs without changing watch settings.';
    sc.appendChild(note);
    createTabBar();
    if (hasStorage && localStorage.getItem('timestyle-auto-send') === 'true') {
      localStorage.removeItem('timestyle-auto-send');
      setTimeout(function() { document.querySelector('#main-form button[type=submit]').click(); }, 200);
    }
    return true;
  }
  var att = 0, tmr = setInterval(function() { if (applyTweaks() || ++att > 50) clearInterval(tmr); }, 100);
};

var clay = new Clay(clayConfig, customConfigUi, { autoHandleEvents: false });

Pebble.addEventListener('ready', function(e) {
  console.log('JS component is now READY');

  if(window.localStorage.getItem('disable_weather') === null) {
    window.localStorage.setItem('disable_weather', 'yes');
  }

  if(window.localStorage.getItem('disable_weather') != 'yes') {
    weather.updateWeather();
  }

});

Pebble.addEventListener('appmessage', function(msg) {
  console.log('Received message: ' + JSON.stringify(msg.payload));

  window.localStorage.setItem('disable_weather', 'no');
  weather.updateWeather();

});

Pebble.addEventListener('showConfiguration', function(e) {
  var url = clay.generateUrl();
  var savedConfigs = [];
  try { savedConfigs = JSON.parse(window.localStorage.getItem('timestyle-saved-configs') || '[]'); } catch(ex) {}
  if (savedConfigs.length > 0) {
    url += '#tsc=' + encodeURIComponent(JSON.stringify(savedConfigs));
  }
  console.log('Opening config URL (' + url.length + ' chars, ' + savedConfigs.length + ' saved configs)');
  Pebble.openURL(url);
});

Pebble.addEventListener('webviewclosed', function(e) {
  if(e && !e.response) {
    console.log('No settings changed!');
    return;
  }

  var closeOnly = false;
  try {
    var raw = JSON.parse(decodeURIComponent(e.response));
    if (raw && raw._tsSavedConfigs) {
      console.log('Storing ' + raw._tsSavedConfigs.length + ' saved configs');
      window.localStorage.setItem('timestyle-saved-configs', JSON.stringify(raw._tsSavedConfigs));
      delete raw._tsSavedConfigs;
    }
    if (raw && raw._closeOnly) {
      closeOnly = true;
    } else {
      e.response = encodeURIComponent(JSON.stringify(raw));
    }
  } catch(ex) {
    console.log('webviewclosed parse error: ' + ex.message);
  }

  if (closeOnly) {
    console.log('Close & Save: configs stored, no settings sent to watch');
    return;
  }

  var dict = clay.getSettings(e.response);

  // Clay select components return strings from HTML; C reads value->int8,
  // so numeric strings must become JS numbers (sent as INT32, not CSTRING)
  Object.keys(dict).forEach(function(key) {
    var v = dict[key];
    if(typeof v === 'string' && /^-?\d+$/.test(v)) {
      dict[key] = parseInt(v, 10);
    }
  });

  console.log('Config data received: ' + JSON.stringify(dict));

  // extract language ID for two-phase send
  var languageId = dict[keys.SettingLanguageID];

  // determine weather enable/disable from widget selections
  var widgetIDs = [
    dict[keys.SettingWidget0ID],
    dict[keys.SettingWidget1ID],
    dict[keys.SettingWidget2ID],
    dict[keys.SettingWidget3ID]
  ];

  var disableWeather = 'yes';
  if(widgetIDs.indexOf(7) != -1 || widgetIDs.indexOf(8) != -1 || widgetIDs.indexOf(15) != -1) {
    disableWeather = 'no';
  }
  window.localStorage.setItem('disable_weather', disableWeather);

  // handle appointment settings
  var showAppt = dict[keys.SettingShowNextAppt];
  if(showAppt !== undefined) {
    window.localStorage.setItem('show_next_appt', showAppt ? 'yes' : 'no');
  }

  // send main settings to watch
  Pebble.sendAppMessage(dict, function() {
    console.log('Sent config data to Pebble');

    // phase 2: send language arrays
    if(languageId !== undefined && languageId !== null) {
      var langId = parseInt(languageId, 10);
      var langDict = {};

      for(var i = 0; i < 7; i++) {
        langDict[keys.SettingLanguageDayNames + i] = languages.dayNames[langId][i];
      }
      for(var i = 0; i < 12; i++) {
        langDict[keys.SettingLanguageMonthNames + i] = languages.monthNames[langId][i];
      }
      langDict[keys.SettingLanguageWordForWeek] = languages.wordForWeek[langId];

      console.log('Preparing language message: ' + JSON.stringify(langDict));

      Pebble.sendAppMessage(langDict, function() {
        console.log('Sent language data to Pebble');
        triggerDataUpdates();
      }, function() {
        console.log('Failed to send language data!');
      });
    } else {
      triggerDataUpdates();
    }
  }, function() {
    console.log('Failed to send config data!');
  });
});

function triggerDataUpdates() {
  if(window.localStorage.getItem('disable_weather') != 'yes') {
    weather.updateWeather(true);
  }
}
