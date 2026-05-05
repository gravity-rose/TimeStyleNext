// SPDX-License-Identifier: MIT AND CC-BY-NC-SA-4.0
// Original: MIT (freakified/plarus)  Modifications: CC-BY-NC-SA-4.0 (gravity-rose)
#pragma once
#include <pebble.h>

extern int sidebarWidth;

// "public" functions
void Sidebar_init(Window* window);
void Sidebar_deinit(void);
void Sidebar_set_layer(void);
void Sidebar_redraw(void);
#ifndef PBL_ROUND
void Sidebar_set_hidden(bool hide);
#endif

// Appointment bar (opposite side of horizontal widget bar)
void ApptBar_init(Window* window);
void ApptBar_deinit(void);
void ApptBar_set_layer(void);
void ApptBar_redraw(void);
int ApptBar_get_height(void);
