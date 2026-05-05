var Clay = require('pebble-clay');
var clayConfig = require('./config');
var weather = require('./weather');
var calendar = require('./calendar');
var languages = require('./languages');
var keys = require('message_keys');

var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

Pebble.addEventListener('ready', function(e) {
  console.log('JS component is now READY');

  if(window.localStorage.getItem('disable_weather') === null) {
    window.localStorage.setItem('disable_weather', 'yes');
  }

  if(window.localStorage.getItem('disable_weather') != 'yes') {
    weather.updateWeather();
  }

  if(window.localStorage.getItem('show_next_appt') === 'yes') {
    calendar.updateCalendar();
  }
});

Pebble.addEventListener('appmessage', function(msg) {
  console.log('Received message: ' + JSON.stringify(msg.payload));

  window.localStorage.setItem('disable_weather', 'no');
  weather.updateWeather();

  if(window.localStorage.getItem('show_next_appt') === 'yes') {
    calendar.updateCalendar();
  }
});

Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if(e && !e.response) {
    console.log('No settings changed!');
    return;
  }

  var dict = clay.getResponsePayload(e.response);
  console.log('Config data received: ' + JSON.stringify(dict));

  // extract language ID for two-phase send
  var languageId = dict[keys.SettingLanguageID];

  // handle localStorage-only settings from Clay response
  var claySettings = JSON.parse(decodeURIComponent(e.response));
  if(claySettings) {
    // weather location fields
    if(claySettings.weather_loc !== undefined) {
      window.localStorage.setItem('weather_loc', claySettings.weather_loc);
    }
    // calendar iCal URL
    if(claySettings.calendar_ical_url !== undefined) {
      window.localStorage.setItem('calendar_ical_url', claySettings.calendar_ical_url);
    }
  }

  // determine weather enable/disable from widget selections
  var widgetIDs = [
    dict[keys.SettingWidget0ID],
    dict[keys.SettingWidget1ID],
    dict[keys.SettingWidget2ID],
    dict[keys.SettingWidget3ID]
  ];

  var disableWeather = 'yes';
  if(widgetIDs.indexOf(7) != -1 || widgetIDs.indexOf(8) != -1 || widgetIDs.indexOf(15) != -1 ||
     widgetIDs.indexOf('7') != -1 || widgetIDs.indexOf('8') != -1 || widgetIDs.indexOf('15') != -1) {
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
  if(window.localStorage.getItem('show_next_appt') === 'yes') {
    calendar.updateCalendar();
  }
}
