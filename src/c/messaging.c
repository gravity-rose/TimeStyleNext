// SPDX-License-Identifier: MIT AND CC-BY-NC-SA-4.0
// Original: MIT (freakified/plarus)  Modifications: CC-BY-NC-SA-4.0 (gravity-rose)
#include <pebble.h>
#include "weather.h"
#include "settings.h"
#include "messaging.h"
#include "appointment.h"

static MessageProcessedCallback message_processed_callback;

static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  bool weatherDataUpdated = false;

  // does this message contain current weather conditions?
  Tuple *weatherTemp_tuple = dict_find(iterator, MESSAGE_KEY_WeatherTemperature);
  Tuple *weatherConditions_tuple = dict_find(iterator, MESSAGE_KEY_WeatherCondition);
  Tuple *weatherUVIndex_tuple = dict_find(iterator, MESSAGE_KEY_WeatherUVIndex);

  if(weatherTemp_tuple != NULL) {
    Weather_weatherInfo.currentTemp = (int)weatherTemp_tuple->value->int32;
    weatherDataUpdated = true;
  }

  if(weatherConditions_tuple != NULL) {
    Weather_setCurrentCondition(weatherConditions_tuple->value->int32);
    weatherDataUpdated = true;
  }

  if(weatherUVIndex_tuple != NULL) {
    Weather_weatherInfo.currentUVIndex = (int)weatherUVIndex_tuple->value->int32;
    weatherDataUpdated = true;
  }

  // does this message contain weather forecast information?
  Tuple *weatherForecastCondition_tuple = dict_find(iterator, MESSAGE_KEY_WeatherForecastCondition);
  Tuple *weatherForecastHigh_tuple = dict_find(iterator, MESSAGE_KEY_WeatherForecastHighTemp);
  Tuple *weatherForecastLow_tuple = dict_find(iterator, MESSAGE_KEY_WeatherForecastLowTemp);

  if(weatherForecastHigh_tuple != NULL) {
    Weather_weatherInfo.todaysHighTemp = (int)weatherForecastHigh_tuple->value->int32;
    weatherDataUpdated = true;
  }

  if(weatherForecastLow_tuple != NULL) {
    Weather_weatherInfo.todaysLowTemp = (int)weatherForecastLow_tuple->value->int32;
    weatherDataUpdated = true;
  }

  if(weatherForecastCondition_tuple != NULL) {
    Weather_setForecastCondition(weatherForecastCondition_tuple->value->int32);
    weatherDataUpdated = true;
  }

  if(weatherDataUpdated) {
    Weather_saveData();
  }

  // TODO: appointment data reception will be redesigned for queue-based protocol

  // does this message contain new config information?
  Tuple *timeColor_tuple = dict_find(iterator, MESSAGE_KEY_SettingColorTime);
  Tuple *bgColor_tuple = dict_find(iterator, MESSAGE_KEY_SettingColorBG);
  Tuple *sidebarColor_tuple = dict_find(iterator, MESSAGE_KEY_SettingColorSidebar);
  Tuple *sidebarPos_tuple = dict_find(iterator, MESSAGE_KEY_SettingSidebarPosition);
  Tuple *sidebarTextColor_tuple = dict_find(iterator, MESSAGE_KEY_SettingSidebarTextColor);
  Tuple *useMetric_tuple = dict_find(iterator, MESSAGE_KEY_SettingUseMetric);
  Tuple *btVibe_tuple = dict_find(iterator, MESSAGE_KEY_SettingBluetoothVibe);
  Tuple *language_tuple = dict_find(iterator, MESSAGE_KEY_SettingLanguageID);
  Tuple *leadingZero_tuple = dict_find(iterator, MESSAGE_KEY_SettingShowLeadingZero);
  Tuple *centerTime_tuple = dict_find(iterator, MESSAGE_KEY_SettingCenterTime);
  Tuple *batteryPct_tuple = dict_find(iterator, MESSAGE_KEY_SettingShowBatteryPct);
  Tuple *clockFont_tuple = dict_find(iterator, MESSAGE_KEY_SettingClockFontId);
  Tuple *hourlyVibe_tuple = dict_find(iterator, MESSAGE_KEY_SettingHourlyVibe);
  Tuple *useLargeFonts_tuple = dict_find(iterator, MESSAGE_KEY_SettingUseLargeFonts);

  Tuple *widget0Id_tuple = dict_find(iterator, MESSAGE_KEY_SettingWidget0ID);
  Tuple *widget1Id_tuple = dict_find(iterator, MESSAGE_KEY_SettingWidget1ID);
  Tuple *widget2Id_tuple = dict_find(iterator, MESSAGE_KEY_SettingWidget2ID);
  Tuple *widget3Id_tuple = dict_find(iterator, MESSAGE_KEY_SettingWidget3ID);

  Tuple *altclockName_tuple = dict_find(iterator, MESSAGE_KEY_SettingAltClockName);
  Tuple *altclockOffset_tuple = dict_find(iterator, MESSAGE_KEY_SettingAltClockOffset);

  Tuple *decimalSeparator_tuple = dict_find(iterator, MESSAGE_KEY_SettingDecimalSep);
  Tuple *healthActivityDisplay_tuple = dict_find(iterator, MESSAGE_KEY_SettingHealthActivityDisplay);
  Tuple *healthUseRestfulSleep_tuple = dict_find(iterator, MESSAGE_KEY_SettingHealthUseRestfulSleep);

  Tuple *autobattery_tuple = dict_find(iterator, MESSAGE_KEY_SettingDisableAutobattery);

  Tuple *activateDisconnectIcon_tuple = dict_find(iterator, MESSAGE_KEY_SettingDisconnectIcon);

  Tuple *showNextAppt_tuple = dict_find(iterator, MESSAGE_KEY_SettingShowNextAppt);

  if(timeColor_tuple != NULL) {
    settings.timeColor = GColorFromHEX(timeColor_tuple->value->int32);
  }

  if(bgColor_tuple != NULL) {
    settings.timeBgColor = GColorFromHEX(bgColor_tuple->value->int32);
  }

  if(sidebarColor_tuple != NULL) {
    settings.sidebarColor = GColorFromHEX(sidebarColor_tuple->value->int32);
  }

  if(sidebarTextColor_tuple != NULL) {
    // text can only be black or white, so we'll enforce that here
    settings.sidebarTextColor = GColorFromHEX(sidebarTextColor_tuple->value->int32);
  }

  if(sidebarPos_tuple != NULL) {
    settings.sidebarLocation = (BarLocationType)sidebarPos_tuple->value->int8;
  }

  if(useMetric_tuple != NULL) {
    settings.useMetric = (bool)useMetric_tuple->value->int8;
  }

  if(btVibe_tuple != NULL) {
    settings.btVibe = (bool)btVibe_tuple->value->int8;
  }

  if(leadingZero_tuple != NULL) {
    settings.showLeadingZero = (bool)leadingZero_tuple->value->int8;
  }

  if(centerTime_tuple != NULL) {
    settings.centerTime = (bool)centerTime_tuple->value->int8;
  }

  if(batteryPct_tuple != NULL) {
    settings.showBatteryPct = (bool)batteryPct_tuple->value->int8;
  }

  if(autobattery_tuple != NULL) {
    settings.disableAutobattery = (bool)autobattery_tuple->value->int8;
  }

  if(clockFont_tuple != NULL) {
    settings.clockFontId = clockFont_tuple->value->int8;
  }

  if(useLargeFonts_tuple != NULL) {
    settings.useLargeFonts = (bool)useLargeFonts_tuple->value->int8;
  }

  if(hourlyVibe_tuple != NULL) {
    settings.hourlyVibe = hourlyVibe_tuple->value->int8;
  }

  if(language_tuple != NULL) {
    settings.languageId = language_tuple->value->int8;
  }

  if(widget0Id_tuple != NULL) {
    settings.widgets[0] = widget0Id_tuple->value->int8;
  }

  if(widget1Id_tuple != NULL) {
    settings.widgets[1] = widget1Id_tuple->value->int8;
  }

  if(widget2Id_tuple != NULL) {
    settings.widgets[2] = widget2Id_tuple->value->int8;
  }

  if(widget3Id_tuple != NULL) {
    settings.widgets[3] = widget3Id_tuple->value->int8;
  }

  if(altclockName_tuple != NULL) {
    strncpy(settings.altclockName, altclockName_tuple->value->cstring, sizeof(settings.altclockName));
  }

  if(altclockOffset_tuple != NULL) {
    settings.altclockOffset = altclockOffset_tuple->value->int8;
  }

  if(decimalSeparator_tuple != NULL) {
    settings.decimalSeparator = (char)decimalSeparator_tuple->value->int8;
  }

  if(healthActivityDisplay_tuple != NULL) {
    settings.healthActivityDisplay = (ActivityDisplayType)healthActivityDisplay_tuple->value->int8;
  }

  if(healthUseRestfulSleep_tuple != NULL) {
    settings.healthUseRestfulSleep = (bool)healthUseRestfulSleep_tuple->value->int8;
  }

  if(activateDisconnectIcon_tuple != NULL) {
    settings.activateDisconnectIcon = (bool)activateDisconnectIcon_tuple->value->int8;
  }

  if(showNextAppt_tuple != NULL) {
    settings.showNextAppt = (bool)showNextAppt_tuple->value->int8;
  }

  // does this message contain new language information?
  Tuple *languageDayNames_tuple = dict_find(iterator, MESSAGE_KEY_SettingLanguageDayNames);
  Tuple *languageMonthNames_tuple = dict_find(iterator, MESSAGE_KEY_SettingLanguageMonthNames);
  Tuple *languageWordForWeek_tuple = dict_find(iterator, MESSAGE_KEY_SettingLanguageWordForWeek);

  if(languageDayNames_tuple != NULL) {
    for(int i = 0;i<7;i++){
      strncpy(settings.languageDayNames[i], languageDayNames_tuple->value->cstring, sizeof(settings.languageDayNames[i]));
      languageDayNames_tuple = dict_find(iterator, MESSAGE_KEY_SettingLanguageDayNames + i + 1);
    }
  }

  if(languageMonthNames_tuple != NULL) {
    for(int i = 0;i<12;i++){
      strncpy(settings.languageMonthNames[i], languageMonthNames_tuple->value->cstring, sizeof(settings.languageMonthNames[i]));
      languageMonthNames_tuple = dict_find(iterator, MESSAGE_KEY_SettingLanguageMonthNames + i + 1);
    }
  }

  if(languageWordForWeek_tuple != NULL) {
    strncpy(settings.languageWordForWeek, languageWordForWeek_tuple->value->cstring, sizeof(settings.languageWordForWeek));
  }

  Settings_updateDynamicSettings();

  // save the new settings to persistent storage
  Settings_saveToStorage();

  // notify the main screen, in case something changed
  message_processed_callback();
}

void messaging_requestNewWeatherData(void) {
  // just send an empty message for now
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);
  dict_write_uint32(iter, 0, 0);
  app_message_outbox_send();
}

void messaging_init(MessageProcessedCallback processed_callback) {
  // register my custom callback
  message_processed_callback = processed_callback;

  // Register callbacks
  app_message_register_inbox_received(inbox_received_callback);

  // Open AppMessage
  app_message_open(1024, 64);

  // APP_LOG(APP_LOG_LEVEL_DEBUG, "Watch messaging is started!");
}
