// SPDX-License-Identifier: MIT AND CC-BY-NC-SA-4.0
// Original: MIT (freakified/plarus)  Modifications: CC-BY-NC-SA-4.0 (gravity-rose)
#include <pebble.h>
#include "clock_area.h"
#include "settings.h"

Settings settings;
DynamicSettings dynamicSettings;

/*
 * Load defaults settings
 */
void Settings_loadDefaultsSettings(void) {
  // load the default colors
  #ifdef PBL_COLOR
    settings.timeColor      = GColorWhite;
    settings.sidebarColor   = GColorVividCerulean;
  #else
    settings.timeColor      = GColorWhite;
    settings.sidebarColor   = GColorWhite;
  #endif
  settings.timeBgColor      = GColorBlack;
  settings.sidebarTextColor = GColorBlack;

  settings.languageId       = LANGUAGE_EN; // English
  strncpy(settings.languageDayNames[0], "SUN", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageDayNames[1], "MON", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageDayNames[2], "TUE", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageDayNames[3], "WED", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageDayNames[4], "THU", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageDayNames[5], "FRI", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageDayNames[6], "SAT", sizeof(settings.languageDayNames[0]));
  strncpy(settings.languageMonthNames[0], "JAN", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[1], "FEB", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[2], "MAR", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[3], "APR", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[4], "MAY", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[5], "JUN", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[6], "JUL", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[7], "AUG", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[8], "SEP", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[9], "OCT", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[10], "NOV", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageMonthNames[11], "DEC", sizeof(settings.languageMonthNames[0]));
  strncpy(settings.languageWordForWeek, "Wk", sizeof(settings.languageWordForWeek));

  settings.showLeadingZero  = false;
  settings.clockFontId      = FONT_SETTING_DEFAULT;
  settings.btVibe           = false;
  settings.hourlyVibe       = NO_VIBE;
  settings.sidebarLocation  = BOTTOM;

  // set the default widgets
  settings.widgets[0] = BATTERY_METER;
  settings.widgets[1] = WEATHER_CURRENT;
  settings.widgets[2] = PBL_IF_HEALTH_ELSE(HEALTH, BLUETOOTH_DISCONNECT);
  settings.widgets[3] = WEEK_NUMBER;

  settings.useLargeFonts          = false;
  settings.useMetric              = true;
  settings.showBatteryPct         = true;
  settings.disableAutobattery     = false;
  settings.healthActivityDisplay  = STEPS;
  settings.healthUseRestfulSleep  = false;
  settings.decimalSeparator       = '.';
  strncpy(settings.altclockName, "ALT", sizeof(settings.altclockName));
  settings.altclockOffset         = 0;
  settings.activateDisconnectIcon = true;
  settings.centerTime             = false;
  settings.showNextAppt           = true;
  settings.apptPollMinutes        = 30;
}

/*
 * Load the saved settings
 */
void Settings_loadFromStorage(void) {
  Settings_loadDefaultsSettings();

  if(persist_exists(SETTINGS_PERSIST_KEY)) {
    persist_read_data(SETTINGS_PERSIST_KEY, &settings, sizeof(Settings));

    // null-terminate string fields for safety
    for(int i = 0; i < 7; i++) {
      settings.languageDayNames[i][sizeof(settings.languageDayNames[i]) - 1] = '\0';
    }
    for(int i = 0; i < 12; i++) {
      settings.languageMonthNames[i][sizeof(settings.languageMonthNames[i]) - 1] = '\0';
    }
    settings.languageWordForWeek[sizeof(settings.languageWordForWeek) - 1] = '\0';
    settings.altclockName[sizeof(settings.altclockName) - 1] = '\0';
  }

  Settings_updateDynamicSettings();
}

void Settings_saveToStorage(void) {
  _Static_assert(sizeof(Settings) <= 256, "Settings struct too large for persistent storage");

  persist_write_data(SETTINGS_PERSIST_KEY, &settings, sizeof(Settings));
  persist_write_int(SETTINGS_VERSION_PERSIST_KEY, CURRENT_SETTINGS_VERSION);
}

void Settings_updateDynamicSettings(void) {
  dynamicSettings.disableWeather = true;
  dynamicSettings.updateScreenEverySecond = false;
  dynamicSettings.enableAutoBatteryWidget = true;
  dynamicSettings.enableBeats = false;
  dynamicSettings.enableAltTimeZone = false;

  for(int i = 0; i < 4; i++) {
    // if there are any weather widgets, enable weather checking
    if(settings.widgets[i] == WEATHER_CURRENT ||
       settings.widgets[i] == WEATHER_FORECAST_TODAY ||
       settings.widgets[i] == WEATHER_UV_INDEX) {
      dynamicSettings.disableWeather = false;
    }

    // if any widget is "seconds", we'll need to update the sidebar every second
    if(settings.widgets[i] == SECONDS) {
      dynamicSettings.updateScreenEverySecond = true;
    }

    // if any widget is "battery", disable the automatic battery indication
    if(settings.widgets[i] == BATTERY_METER) {
      dynamicSettings.enableAutoBatteryWidget = false;
    }

    // if any widget is "beats", enable the beats calculation
    if(settings.widgets[i] == BEATS) {
      dynamicSettings.enableBeats = true;
    }

    // if any widget is "alt_time_zone", enable the alternative time calculation
    if(settings.widgets[i] == ALT_TIME_ZONE) {
      dynamicSettings.enableAltTimeZone = true;
    }
  }

  // temp: if the sidebar is black, use inverted colors for icons
  if(gcolor_equal(settings.sidebarColor, GColorBlack)) {
    dynamicSettings.iconFillColor = GColorBlack;
    dynamicSettings.iconStrokeColor = settings.sidebarTextColor; // exciting
  } else {
    dynamicSettings.iconFillColor = GColorWhite;
    dynamicSettings.iconStrokeColor = GColorBlack;
  }
}

void Settings_init(void) {
  // first, check if we have any saved settings
  int current_settings_version = persist_exists(SETTINGS_VERSION_PERSIST_KEY) ? persist_read_int(SETTINGS_VERSION_PERSIST_KEY) : -1;
  APP_LOG(APP_LOG_LEVEL_DEBUG,"current_settings_version: %d", current_settings_version);
  if( current_settings_version < CURRENT_SETTINGS_VERSION ) {
    // load all settings
    Settings_loadDefaultsSettings();
  } else {
    // load all settings
    Settings_loadFromStorage();
  }
  Settings_updateDynamicSettings();
}

void Settings_deinit(void) {
  // write all settings to storage
  Settings_saveToStorage();
}
