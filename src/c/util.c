// SPDX-License-Identifier: MIT AND CC-BY-NC-SA-4.0
// Original: MIT (freakified/plarus)  Modifications: CC-BY-NC-SA-4.0 (gravity-rose)
#include <pebble.h>
#include <math.h>
#include "settings.h"
#include "util.h"

bool recolor_iterator_cb(GDrawCommand *command, uint32_t index, void *context) {
  GColor *colors = (GColor *)context;

  gdraw_command_set_fill_color(command, colors[0]);
  gdraw_command_set_stroke_color(command, colors[1]);

  return true;
}

/*
 * For the specified GDrawCommandImage, recolors it with
 * the specified fill and stroke colors
 */
void image_recolor(GDrawCommandImage *img, GColor fill_color, GColor stroke_color) {
  GColor colors[2];
  colors[0] = fill_color;
  colors[1] = stroke_color;

  gdraw_command_list_iterate(gdraw_command_image_get_command_list(img),
                             recolor_iterator_cb, &colors);
}

void util_image_draw(GContext* ctx, GDrawCommandImage *img, int xPosition, int yPosition) {
  image_recolor(img, dynamicSettings.iconFillColor, dynamicSettings.iconStrokeColor);
  gdraw_command_image_draw(ctx, img, GPoint(xPosition, yPosition));
}

void util_image_draw_inverted_color(GContext* ctx, GDrawCommandImage *img, int xPosition, int yPosition) {
  image_recolor(img, dynamicSettings.iconStrokeColor, dynamicSettings.iconFillColor);
  gdraw_command_image_draw(ctx, img, GPoint(xPosition, yPosition));
}

int16_t get_obstruction_height(Layer *s_window_layer) {
    GRect fullscreen = layer_get_bounds(s_window_layer);
    GRect unobstructed_bounds = layer_get_unobstructed_bounds(s_window_layer);

    return fullscreen.size.h - unobstructed_bounds.size.h;
}

void seconds_to_minutes_hours_text(HealthValue seconds, char * hours_text, char * minutes_text) {

    // convert to hours/minutes
    int minutes = seconds / 60;
    int hours   = minutes / 60;

    // find minutes remainder
    minutes %= 60;

    snprintf(hours_text, 4, "%ih", hours);
    snprintf(minutes_text, 4, "%im", minutes);
}

void seconds_to_text(HealthValue seconds, char * hours_minutes_text) {

    // convert to hours/minutes
    int minutes = seconds / 60;
    int hours   = minutes / 60;

    // find minutes remainder
    minutes %= 60;

    snprintf(hours_minutes_text, 8, "%ih%i", hours, minutes);
}

void distance_to_metric_text(HealthValue distance, char * metric_text) {
    if(distance < 100) {
      snprintf(metric_text, 8, "%lim", distance);
    } else if(distance < 1000) {
      distance /= 100;
      snprintf(metric_text, 8, "%c%likm", settings.decimalSeparator, distance);
    } else {
      distance /= 1000;
      snprintf(metric_text, 8, "%likm", distance);
    }
}

void distance_to_imperial_text(HealthValue distance, char * imperial_text) {
    int miles_tenths = distance * 10 / 1609 % 10;
    int miles_whole  = (int)roundf(distance / 1609.0f);

    if(miles_whole > 0) {
      snprintf(imperial_text, 8, "%imi", miles_whole);
    } else {
      snprintf(imperial_text, 8, "%c%imi", settings.decimalSeparator, miles_tenths);
    }
}

void steps_to_text(HealthValue steps, char * steps_text) {
    // format step string
    if(steps < 1000) {
      snprintf(steps_text, 8, "%li", steps);
    } else {
      int steps_thousands = steps / 1000;
      int steps_hundreds  = steps / 100 % 10;

      if (steps < 10000) {
        snprintf(steps_text, 8, "%i%c%ik", steps_thousands, settings.decimalSeparator, steps_hundreds);
      } else {
        snprintf(steps_text, 8, "%ik", steps_thousands);
      }
    }
}

void kCalories_to_text(HealthValue kcalories, char * kcalories_text) {
    // format kcalories string
    if(kcalories < 1000) {
      snprintf(kcalories_text, 8, "%likc", kcalories);
    } else {
      int kcalories_thousands = kcalories / 1000;
      int kcalories_hundreds  = kcalories / 100 % 10;

      if (kcalories < 10000) {
        snprintf(kcalories_text, 8, "%i%c%iMc", kcalories_thousands, settings.decimalSeparator, kcalories_hundreds);
      } else {
        snprintf(kcalories_text, 8, "%iMc", kcalories_thousands);
      }
    }
}
