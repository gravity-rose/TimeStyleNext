#include <pebble.h>
#include "appointment.h"

AppointmentInfo Appointment_info;

void Appointment_init(void) {
  if(persist_exists(APPT_PERSIST_KEY)) {
    persist_read_data(APPT_PERSIST_KEY, &Appointment_info, sizeof(AppointmentInfo));
  } else {
    Appointment_clearData();
  }
}

void Appointment_deinit(void) {
  Appointment_saveData();
}

void Appointment_setData(const char* title, const char* time) {
  strncpy(Appointment_info.title, title, APPT_TITLE_MAX_LEN - 1);
  Appointment_info.title[APPT_TITLE_MAX_LEN - 1] = '\0';
  strncpy(Appointment_info.time, time, sizeof(Appointment_info.time) - 1);
  Appointment_info.time[sizeof(Appointment_info.time) - 1] = '\0';
  Appointment_info.hasData = true;
}

void Appointment_clearData(void) {
  Appointment_info.title[0] = '\0';
  Appointment_info.time[0] = '\0';
  Appointment_info.hasData = false;
}

void Appointment_saveData(void) {
  persist_write_data(APPT_PERSIST_KEY, &Appointment_info, sizeof(AppointmentInfo));
}
