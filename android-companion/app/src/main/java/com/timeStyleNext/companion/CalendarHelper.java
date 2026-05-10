package com.timeStyleNext.companion;

import android.content.ContentUris;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CalendarContract;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class CalendarHelper {

    public static class CalendarInfo {
        public final long id;
        public final String displayName;
        public final String accountName;

        public CalendarInfo(long id, String displayName, String accountName) {
            this.id = id;
            this.displayName = displayName;
            this.accountName = accountName;
        }
    }

    public static List<CalendarInfo> getCalendars(Context context) {
        List<CalendarInfo> calendars = new ArrayList<>();
        String[] projection = {
            CalendarContract.Calendars._ID,
            CalendarContract.Calendars.CALENDAR_DISPLAY_NAME,
            CalendarContract.Calendars.ACCOUNT_NAME
        };

        try (Cursor cursor = context.getContentResolver().query(
                CalendarContract.Calendars.CONTENT_URI,
                projection, null, null,
                CalendarContract.Calendars.CALENDAR_DISPLAY_NAME + " ASC")) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    calendars.add(new CalendarInfo(
                        cursor.getLong(0),
                        cursor.getString(1),
                        cursor.getString(2)
                    ));
                }
            }
        }
        return calendars;
    }

    public static List<CalendarEvent> getUpcomingEvents(Context context, Set<Long> calendarIds, int maxCount) {
        List<CalendarEvent> events = new ArrayList<>();
        if (calendarIds.isEmpty()) return events;

        long now = System.currentTimeMillis();
        long weekFromNow = now + 7L * 24 * 60 * 60 * 1000;

        Uri.Builder builder = CalendarContract.Instances.CONTENT_URI.buildUpon();
        ContentUris.appendId(builder, now);
        ContentUris.appendId(builder, weekFromNow);

        StringBuilder idList = new StringBuilder();
        for (Long id : calendarIds) {
            if (idList.length() > 0) idList.append(",");
            idList.append(id);
        }

        String selection = CalendarContract.Instances.ALL_DAY + " = 0 AND " +
            CalendarContract.Instances.AVAILABILITY + " != " +
            CalendarContract.Instances.AVAILABILITY_FREE + " AND " +
            CalendarContract.Instances.CALENDAR_ID + " IN (" + idList + ")";

        String[] projection = {
            CalendarContract.Instances.BEGIN,
            CalendarContract.Instances.TITLE
        };

        try (Cursor cursor = context.getContentResolver().query(
                builder.build(),
                projection,
                selection,
                null,
                CalendarContract.Instances.BEGIN + " ASC")) {
            if (cursor != null) {
                int count = 0;
                while (cursor.moveToNext() && count < maxCount) {
                    long beginMs = cursor.getLong(0);
                    String title = cursor.getString(1);
                    if (title == null || title.isEmpty()) title = "Event";
                    if (title.length() > 31) title = title.substring(0, 31);
                    events.add(new CalendarEvent(beginMs / 1000, title));
                    count++;
                }
            }
        }
        return events;
    }
}
