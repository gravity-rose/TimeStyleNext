package com.timeStyleNext.companion;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.getpebble.android.kit.PebbleKit;
import com.getpebble.android.kit.util.PebbleDictionary;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class PebbleReceiver extends PebbleKit.PebbleDataReceiver {
    private static final String TAG = "TimeStyleCompanion";
    private static final UUID WATCHFACE_UUID =
        UUID.fromString("c81c76b1-b007-49cf-8030-5f4030650b16");

    private static final int KEY_REQUEST_APPT_DATA = 10066;
    private static final int KEY_APPT_COUNT = 10067;
    private static final int KEY_APPT_START_TIME_BASE = 10019;
    private static final int KEY_APPT_TITLE_BASE = 10025;

    static final String PREFS_NAME = "timestyle_companion";
    static final String PREF_SELECTED_CALENDARS = "selected_calendar_ids";

    public PebbleReceiver() {
        super(WATCHFACE_UUID);
    }

    @Override
    public void receiveData(Context context, int transactionId, PebbleDictionary data) {
        PebbleKit.sendAckToPebble(context, transactionId);

        if (!data.contains(KEY_REQUEST_APPT_DATA)) return;

        Log.d(TAG, "Received appointment data request from watch");

        Set<Long> selectedIds = loadSelectedCalendarIds(context);
        if (selectedIds.isEmpty()) {
            Log.d(TAG, "No calendars selected, sending empty response");
            sendEvents(context, new ArrayList<>());
            return;
        }

        try {
            List<CalendarEvent> events =
                CalendarHelper.getUpcomingEvents(context, selectedIds, 6);
            Log.d(TAG, "Sending " + events.size() + " events to watch");
            sendEvents(context, events);
        } catch (SecurityException e) {
            Log.e(TAG, "Calendar permission not granted", e);
            sendEvents(context, new ArrayList<>());
        }
    }

    static void pushEventsToWatch(Context context) {
        Set<Long> selectedIds = loadSelectedCalendarIds(context);
        List<CalendarEvent> events;
        try {
            events = CalendarHelper.getUpcomingEvents(context, selectedIds, 6);
        } catch (SecurityException e) {
            events = new ArrayList<>();
        }
        sendEvents(context, events);
    }

    private static void sendEvents(Context context, List<CalendarEvent> events) {
        PebbleDictionary dict = new PebbleDictionary();
        dict.addUint8(KEY_APPT_COUNT, (byte) events.size());

        for (int i = 0; i < events.size(); i++) {
            dict.addInt32(KEY_APPT_START_TIME_BASE + i,
                (int) events.get(i).startTimeUnix);
            dict.addString(KEY_APPT_TITLE_BASE + i,
                events.get(i).title);
        }

        PebbleKit.sendDataToPebble(context, WATCHFACE_UUID, dict);
    }

    static Set<Long> loadSelectedCalendarIds(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        Set<Long> ids = new HashSet<>();
        String saved = prefs.getString(PREF_SELECTED_CALENDARS, "");
        if (!saved.isEmpty()) {
            for (String s : saved.split(",")) {
                try { ids.add(Long.parseLong(s.trim())); }
                catch (NumberFormatException ignored) {}
            }
        }
        return ids;
    }

    static void saveSelectedCalendarIds(Context context, Set<Long> ids) {
        StringBuilder sb = new StringBuilder();
        for (Long id : ids) {
            if (sb.length() > 0) sb.append(",");
            sb.append(id);
        }
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(PREF_SELECTED_CALENDARS, sb.toString())
            .apply();
    }
}
