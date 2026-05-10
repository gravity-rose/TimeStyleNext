// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// Copyright (c) 2026 gravity-rose / TimeStyle Next
module.exports = [
  {
    "type": "heading",
    "defaultValue": "TimeStyle Next"
  },

  // Colors
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Colors"
      },
      {
        "type": "color",
        "messageKey": "SettingColorTime",
        "defaultValue": "0xFFFFFF",
        "label": "Time Color",
        "sunlight": true
      },
      {
        "type": "color",
        "messageKey": "SettingColorBG",
        "defaultValue": "0x000000",
        "label": "Background Color",
        "sunlight": true
      },
      {
        "type": "color",
        "messageKey": "SettingColorSidebar",
        "defaultValue": "0x00AAFF",
        "label": "Sidebar Color",
        "sunlight": true
      },
      {
        "type": "color",
        "messageKey": "SettingSidebarTextColor",
        "defaultValue": "0x000000",
        "label": "Sidebar Text Color",
        "sunlight": true
      }
    ]
  },

  // Clock
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Clock"
      },
      {
        "type": "select",
        "messageKey": "SettingClockFontId",
        "defaultValue": "0",
        "label": "Clock Font",
        "options": [
          {"label": "Avenir", "value": "0"},
          {"label": "LECO", "value": "1"},
          {"label": "Bold", "value": "2"},
          {"label": "Bold Hours", "value": "3"},
          {"label": "Bold Minutes", "value": "4"}
        ]
      },
      {
        "type": "toggle",
        "messageKey": "SettingShowLeadingZero",
        "defaultValue": false,
        "label": "Show Leading Zero"
      },
      {
        "type": "toggle",
        "messageKey": "SettingCenterTime",
        "defaultValue": false,
        "label": "Center Time"
      }
    ]
  },

  // Sidebar
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Sidebar"
      },
      {
        "type": "select",
        "messageKey": "SettingSidebarPosition",
        "defaultValue": "3",
        "label": "Sidebar Position",
        "options": [
          {"label": "None", "value": "0"},
          {"label": "Left", "value": "1"},
          {"label": "Right", "value": "2"},
          {"label": "Bottom", "value": "3"},
          {"label": "Top", "value": "4"}
        ]
      },
      {
        "type": "toggle",
        "messageKey": "SettingUseLargeFonts",
        "defaultValue": false,
        "label": "Large Sidebar Fonts"
      },
      {
        "type": "select",
        "messageKey": "SettingWidget0ID",
        "defaultValue": "2",
        "label": "Widget 1",
        "options": [
          {"label": "Empty", "value": "0"},
          {"label": "Disconnect Icon", "value": "1"},
          {"label": "Battery", "value": "2"},
          {"label": "Alt Timezone", "value": "3"},
          {"label": "Date", "value": "4"},
          {"label": "Seconds", "value": "5"},
          {"label": "Week Number", "value": "6"},
          {"label": "Weather Now", "value": "7"},
          {"label": "Weather Forecast", "value": "8"},
          {"label": "Health", "value": "10"},
          {"label": "Beats", "value": "11"},
          {"label": "Heart Rate", "value": "12"},
          {"label": "Sleep", "value": "13"},
          {"label": "Steps", "value": "14"},
          {"label": "UV Index", "value": "15"}
        ]
      },
      {
        "type": "select",
        "messageKey": "SettingWidget1ID",
        "defaultValue": "7",
        "label": "Widget 2",
        "options": [
          {"label": "Empty", "value": "0"},
          {"label": "Disconnect Icon", "value": "1"},
          {"label": "Battery", "value": "2"},
          {"label": "Alt Timezone", "value": "3"},
          {"label": "Date", "value": "4"},
          {"label": "Seconds", "value": "5"},
          {"label": "Week Number", "value": "6"},
          {"label": "Weather Now", "value": "7"},
          {"label": "Weather Forecast", "value": "8"},
          {"label": "Health", "value": "10"},
          {"label": "Beats", "value": "11"},
          {"label": "Heart Rate", "value": "12"},
          {"label": "Sleep", "value": "13"},
          {"label": "Steps", "value": "14"},
          {"label": "UV Index", "value": "15"}
        ]
      },
      {
        "type": "select",
        "messageKey": "SettingWidget2ID",
        "defaultValue": "10",
        "label": "Widget 3",
        "options": [
          {"label": "Empty", "value": "0"},
          {"label": "Disconnect Icon", "value": "1"},
          {"label": "Battery", "value": "2"},
          {"label": "Alt Timezone", "value": "3"},
          {"label": "Date", "value": "4"},
          {"label": "Seconds", "value": "5"},
          {"label": "Week Number", "value": "6"},
          {"label": "Weather Now", "value": "7"},
          {"label": "Weather Forecast", "value": "8"},
          {"label": "Health", "value": "10"},
          {"label": "Beats", "value": "11"},
          {"label": "Heart Rate", "value": "12"},
          {"label": "Sleep", "value": "13"},
          {"label": "Steps", "value": "14"},
          {"label": "UV Index", "value": "15"}
        ]
      },
      {
        "type": "select",
        "messageKey": "SettingWidget3ID",
        "defaultValue": "6",
        "label": "Widget 4 (Top/Bottom bar only)",
        "options": [
          {"label": "Empty", "value": "0"},
          {"label": "Disconnect Icon", "value": "1"},
          {"label": "Battery", "value": "2"},
          {"label": "Alt Timezone", "value": "3"},
          {"label": "Date", "value": "4"},
          {"label": "Seconds", "value": "5"},
          {"label": "Week Number", "value": "6"},
          {"label": "Weather Now", "value": "7"},
          {"label": "Weather Forecast", "value": "8"},
          {"label": "Health", "value": "10"},
          {"label": "Beats", "value": "11"},
          {"label": "Heart Rate", "value": "12"},
          {"label": "Sleep", "value": "13"},
          {"label": "Steps", "value": "14"},
          {"label": "UV Index", "value": "15"}
        ]
      }
    ]
  },

  // Bluetooth & Vibration
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Bluetooth & Vibration"
      },
      {
        "type": "toggle",
        "messageKey": "SettingDisconnectIcon",
        "defaultValue": true,
        "label": "Show Disconnect Icon"
      },
      {
        "type": "toggle",
        "messageKey": "SettingBluetoothVibe",
        "defaultValue": false,
        "label": "Vibrate on Disconnect"
      },
      {
        "type": "select",
        "messageKey": "SettingHourlyVibe",
        "defaultValue": "0",
        "label": "Hourly Vibration",
        "options": [
          {"label": "None", "value": "0"},
          {"label": "Every Hour", "value": "1"},
          {"label": "Every Half Hour", "value": "2"}
        ]
      }
    ]
  },

  // Weather
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Weather"
      },
      {
        "type": "toggle",
        "messageKey": "SettingUseMetric",
        "defaultValue": true,
        "label": "Celsius (off = Fahrenheit)"
      },
      {
        "type": "input",
        "defaultValue": "",
        "label": "Weather Location (blank = GPS)",
        "attributes": {
          "placeholder": "e.g. New York, NY"
        }
      }
    ]
  },

  // Battery
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Battery"
      },
      {
        "type": "toggle",
        "messageKey": "SettingShowBatteryPct",
        "defaultValue": true,
        "label": "Show Battery Percentage"
      },
      {
        "type": "toggle",
        "messageKey": "SettingDisableAutobattery",
        "defaultValue": false,
        "label": "Disable Auto Battery Warning"
      }
    ]
  },

  // Health
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Health"
      },
      {
        "type": "select",
        "messageKey": "SettingHealthActivityDisplay",
        "defaultValue": "0",
        "label": "Activity Display",
        "options": [
          {"label": "Steps", "value": "0"},
          {"label": "Distance", "value": "1"},
          {"label": "Duration", "value": "2"},
          {"label": "Calories", "value": "3"}
        ]
      },
      {
        "type": "toggle",
        "messageKey": "SettingHealthUseRestfulSleep",
        "defaultValue": false,
        "label": "Show Restful Sleep Only"
      },
      {
        "type": "input",
        "messageKey": "SettingDecimalSep",
        "defaultValue": ".",
        "label": "Decimal Separator",
        "attributes": {
          "limit": 1
        }
      }
    ]
  },

  // Alt Timezone
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Alt Timezone"
      },
      {
        "type": "input",
        "messageKey": "SettingAltClockName",
        "defaultValue": "ALT",
        "label": "Timezone Label",
        "attributes": {
          "limit": 7
        }
      },
      {
        "type": "slider",
        "messageKey": "SettingAltClockOffset",
        "defaultValue": 0,
        "label": "Hour Offset",
        "min": -12,
        "max": 12,
        "step": 1
      }
    ]
  },

  // Calendar / Appointments
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Calendar"
      },
      {
        "type": "toggle",
        "messageKey": "SettingShowNextAppt",
        "defaultValue": false,
        "label": "Show Next Appointment"
      },
      {
        "type": "select",
        "messageKey": "SettingApptPollMinutes",
        "defaultValue": "30",
        "label": "Poll Frequency",
        "options": [
          {"label": "15 minutes", "value": "15"},
          {"label": "30 minutes", "value": "30"},
          {"label": "60 minutes", "value": "60"}
        ]
      },
      {
        "type": "text",
        "defaultValue": "Shows upcoming events from the TimeStyle Companion app. Install the companion app on Android and select your calendars there."
      }
    ]
  },

  // Language
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "Language"
      },
      {
        "type": "select",
        "messageKey": "SettingLanguageID",
        "defaultValue": "0",
        "label": "Language",
        "options": [
          {"label": "English", "value": "0"},
          {"label": "French", "value": "1"},
          {"label": "German", "value": "2"},
          {"label": "Spanish", "value": "3"},
          {"label": "Italian", "value": "4"},
          {"label": "Dutch", "value": "5"},
          {"label": "Turkish", "value": "6"},
          {"label": "Czech", "value": "7"},
          {"label": "Portuguese", "value": "8"},
          {"label": "Greek", "value": "9"},
          {"label": "Swedish", "value": "10"},
          {"label": "Polish", "value": "11"},
          {"label": "Slovak", "value": "12"},
          {"label": "Vietnamese", "value": "13"},
          {"label": "Romanian", "value": "14"},
          {"label": "Catalan", "value": "15"},
          {"label": "Norwegian", "value": "16"},
          {"label": "Russian", "value": "17"},
          {"label": "Estonian", "value": "18"},
          {"label": "Basque", "value": "19"},
          {"label": "Finnish", "value": "20"},
          {"label": "Danish", "value": "21"},
          {"label": "Lithuanian", "value": "22"},
          {"label": "Slovenian", "value": "23"},
          {"label": "Hungarian", "value": "24"},
          {"label": "Croatian", "value": "25"},
          {"label": "Irish", "value": "26"},
          {"label": "Latvian", "value": "27"},
          {"label": "Serbian", "value": "28"},
          {"label": "Chinese", "value": "29"},
          {"label": "Indonesian", "value": "30"},
          {"label": "Ukrainian", "value": "31"},
          {"label": "Welsh", "value": "32"},
          {"label": "Galician", "value": "33"},
          {"label": "Japanese", "value": "34"},
          {"label": "Korean", "value": "35"},
          {"label": "Hebrew", "value": "36"},
          {"label": "Bulgarian", "value": "37"}
        ]
      }
    ]
  },

  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];
