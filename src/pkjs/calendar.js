var weatherCommon = require('./weather');
var keys = require('message_keys');

function updateCalendar() {
  var calendarURL = window.localStorage.getItem('calendar_ical_url');
  if(!calendarURL || calendarURL === '') {
    console.log('No calendar URL configured');
    return;
  }

  console.log('Fetching calendar data from: ' + calendarURL);

  weatherCommon.xhrRequest(calendarURL, 'GET', function(responseText) {
    var nextAppt = parseICalForNextAlertEvent(responseText);
    if(nextAppt) {
      console.log('Next appointment: ' + nextAppt.time + ' ' + nextAppt.title);

      var dict = {};
      dict[keys.ApptTitle] = nextAppt.title.substring(0, 31);
      dict[keys.ApptTime] = nextAppt.time;

      Pebble.sendAppMessage(dict, function() {
        console.log('Appointment data sent to Pebble');
      }, function() {
        console.log('Failed to send appointment data');
      });
    } else {
      console.log('No upcoming appointments with alerts found');
    }
  });
}

function parseICalForNextAlertEvent(icalText) {
  var events = icalText.split('BEGIN:VEVENT');
  var now = new Date();
  var bestEvent = null;
  var bestDate = null;

  for(var i = 1; i < events.length; i++) {
    var block = events[i].split('END:VEVENT')[0];

    if(block.indexOf('BEGIN:VALARM') === -1) continue;

    var dtStart = parseDTSTART(block);
    if(!dtStart) continue;

    if(dtStart <= now) continue;

    if(bestDate === null || dtStart < bestDate) {
      bestDate = dtStart;

      var summaryMatch = block.match(/SUMMARY[^:]*:(.*)/);
      var title = summaryMatch ? summaryMatch[1].replace(/\\n/g, ' ').replace(/\\,/g, ',').trim() : 'Appointment';

      var hours = dtStart.getHours();
      var minutes = dtStart.getMinutes();
      var timeStr = pad(hours) + ':' + pad(minutes);

      bestEvent = {
        title: title,
        time: timeStr
      };
    }
  }

  return bestEvent;
}

function parseDTSTART(block) {
  var dtStartMatch = block.match(/DTSTART[^:]*:(\d{8})(T(\d{6}))?(Z)?/);
  if(!dtStartMatch) return null;

  var dateStr = dtStartMatch[1];
  var timeStr = dtStartMatch[3];
  var isUTC = dtStartMatch[4] === 'Z';

  var year = parseInt(dateStr.substr(0, 4), 10);
  var month = parseInt(dateStr.substr(4, 2), 10) - 1;
  var day = parseInt(dateStr.substr(6, 2), 10);

  var hour = 0, minute = 0, second = 0;
  if(timeStr) {
    hour = parseInt(timeStr.substr(0, 2), 10);
    minute = parseInt(timeStr.substr(2, 2), 10);
    second = parseInt(timeStr.substr(4, 2), 10);
  }

  if(isUTC) {
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  } else {
    return new Date(year, month, day, hour, minute, second);
  }
}

function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}

module.exports.updateCalendar = updateCalendar;
