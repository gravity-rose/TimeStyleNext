package com.timeStyleNext.companion;

public class CalendarEvent {
    public final long startTimeUnix;
    public final String title;

    public CalendarEvent(long startTimeUnix, String title) {
        this.startTimeUnix = startTimeUnix;
        this.title = title;
    }
}
