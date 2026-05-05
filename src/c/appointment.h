#pragma once
#include <pebble.h>

#define APPT_TITLE_MAX_LEN 32
#define APPT_PERSIST_KEY 3

typedef struct {
  char title[APPT_TITLE_MAX_LEN];
  char time[6];
  bool hasData;
} AppointmentInfo;

extern AppointmentInfo Appointment_info;

void Appointment_init(void);
void Appointment_deinit(void);
void Appointment_setData(const char* title, const char* time);
void Appointment_clearData(void);
void Appointment_saveData(void);
