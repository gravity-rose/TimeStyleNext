// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// Copyright (c) 2026 gravity-rose / TimeStyle Next
#pragma once
#include <pebble.h>

#define APPT_QUEUE_SIZE 24
#define APPT_TITLE_MAX_LEN 32
#define APPT_PERSIST_KEY 3
#define APPT_STALE_SECONDS (5 * 60)

typedef struct {
  time_t startTime;
  char title[APPT_TITLE_MAX_LEN];
} AppointmentEvent;

typedef struct {
  AppointmentEvent events[APPT_QUEUE_SIZE];
  uint8_t count;
  uint8_t currentIdx;
} AppointmentQueue;

extern AppointmentQueue Appointment_queue;

void Appointment_init(void);
void Appointment_deinit(void);
void Appointment_tick(void);

bool Appointment_hasCurrentEvent(void);
AppointmentEvent* Appointment_getCurrentEvent(void);
void Appointment_formatTime(const AppointmentEvent *event, char *buf, size_t buf_size);

void Appointment_clearQueue(void);
void Appointment_addEvent(time_t startTime, const char *title);
void Appointment_saveData(void);
