// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// Copyright (c) 2026 gravity-rose / TimeStyle Next
#include <pebble.h>
#include "appointment.h"

AppointmentQueue Appointment_queue;

static void load_test_data(void) {
  Appointment_clearQueue();

  time_t now = time(NULL);
  struct tm *local = localtime(&now);
  local->tm_hour = 14;
  local->tm_min = 45;
  local->tm_sec = 0;
  time_t base = mktime(local);

  const char *titles[] = {
    "Team Standup",
    "Code Review",
    "Design Sync",
    "1:1 w/ Manager",
    "Sprint Planning",
    "Lunch Break",
    "Architecture Review",
    "Demo Prep",
    "All Hands"
  };

  for(int i = 0; i < 9; i++) {
    Appointment_addEvent(base + i * 15 * 60, titles[i]);
  }
}

void Appointment_init(void) {
  if(persist_exists(APPT_PERSIST_KEY)) {
    persist_read_data(APPT_PERSIST_KEY, &Appointment_queue, sizeof(AppointmentQueue));
  } else {
    Appointment_clearQueue();
  }

  // always load test data for now
  load_test_data();
}

void Appointment_deinit(void) {
  Appointment_saveData();
}

void Appointment_tick(void) {
  if(!Appointment_hasCurrentEvent()) return;

  time_t now = time(NULL);
  AppointmentEvent *current = Appointment_getCurrentEvent();

  if(now > current->startTime + APPT_STALE_SECONDS) {
    if(Appointment_queue.currentIdx + 1 < Appointment_queue.count) {
      Appointment_queue.currentIdx++;
    }
  }
}

bool Appointment_hasCurrentEvent(void) {
  return Appointment_queue.count > 0
      && Appointment_queue.currentIdx < Appointment_queue.count;
}

AppointmentEvent* Appointment_getCurrentEvent(void) {
  if(!Appointment_hasCurrentEvent()) return NULL;
  return &Appointment_queue.events[Appointment_queue.currentIdx];
}

void Appointment_formatTime(const AppointmentEvent *event, char *buf, size_t buf_size) {
  struct tm *t = localtime(&event->startTime);
  if(clock_is_24h_style()) {
    snprintf(buf, buf_size, "%d:%02d", t->tm_hour, t->tm_min);
  } else {
    int hour = t->tm_hour % 12;
    if(hour == 0) hour = 12;
    snprintf(buf, buf_size, "%d:%02d%s", hour, t->tm_min,
             t->tm_hour < 12 ? "a" : "p");
  }
}

void Appointment_clearQueue(void) {
  memset(&Appointment_queue, 0, sizeof(AppointmentQueue));
}

void Appointment_addEvent(time_t startTime, const char *title) {
  if(Appointment_queue.count >= APPT_QUEUE_SIZE) return;

  AppointmentEvent *e = &Appointment_queue.events[Appointment_queue.count];
  e->startTime = startTime;
  strncpy(e->title, title, APPT_TITLE_MAX_LEN - 1);
  e->title[APPT_TITLE_MAX_LEN - 1] = '\0';
  Appointment_queue.count++;
}

void Appointment_saveData(void) {
  persist_write_data(APPT_PERSIST_KEY, &Appointment_queue, sizeof(AppointmentQueue));
}
