# TimeStyle Next

A stylish, modern watchface for Pebble watches, updated for the Rebble era.

TimeStyle Next is a fork of [plarus/TimeStyleBBPebble](https://github.com/plarus/TimeStyleBBPebble), which itself forked from [freakified/TimeStylePebble](https://github.com/freakified/TimeStylePebble). This version adds new features, broader platform support, and upstream improvements.

## What's New in 2.0

- **Next Appointment Bar** -- When the widget bar is horizontal (top or bottom), an optional compact bar on the opposite side shows your next calendar appointment with an alert/reminder. Configurable via the settings page.
- **Open-Meteo Weather** -- Replaced OpenWeatherMap and Weather Underground with [Open-Meteo](https://open-meteo.com/), a free weather API that requires no API key.
- **UV Index Widget** -- New widget type showing the current UV index from Open-Meteo.
- **Pebble Clay Config** -- Settings page is now built with the Clay framework, self-contained in the app (no external HTML dependency).
- **Flint & Gabbro Support** -- Added support for the Flint (144x168, B&W) and Gabbro (260x260, round, color) platforms.
- **Emery Proper Sizing** -- Proportionally scaled widget bar and dynamic sidebar width for the Emery display (200x228).
- **Alt Timezone Fix** -- Alt timezone offset now correctly normalizes to UTC before applying the offset, fixing incorrect times in non-UTC locales.
- **Settings Refactor** -- Cleaner separation of persisted and runtime-computed settings, with size safety checks.
- **B&W Display Fix** -- White bars with black text on B&W platforms (Diorite, Flint) instead of dithered gray.

## Supported Platforms

| Platform | Resolution | Display | Shape |
|----------|-----------|---------|-------|
| Basalt | 144x168 | Color | Rectangular |
| Chalk | 180x180 | Color | Round |
| Diorite | 144x168 | B&W | Rectangular |
| Emery | 200x228 | Color | Rectangular |
| Flint | 144x168 | B&W | Rectangular |
| Gabbro | 260x260 | Color | Round |

## Features

- **Readable** -- Over 80% of the display devoted to time, with 6 font options and antialiased text rendering via FCTX.
- **Configurable Sidebar** -- Position the widget bar on any edge (top, bottom, left, right) or hide it. Up to 4 widgets in horizontal mode, 3 in vertical.
- **16 Widget Types** -- Battery, weather (current and forecast), UV index, date, seconds, week number, alt timezone, steps, distance, sleep, heart rate, Swatch beats, and more.
- **Next Appointment** -- Optional compact bar showing your next calendar event (horizontal bar modes only).
- **Auto-Notifications** -- Automatic battery warning at low charge, optional disconnect vibration and icon.
- **38 Languages** -- English, French, German, Spanish, Italian, Dutch, Turkish, Czech, Slovak, Portuguese, Greek, Swedish, Polish, Romanian, Vietnamese, Catalan, Norwegian, Russian, Estonian, Basque, Finnish, Danish, Lithuanian, Slovenian, Hungarian, Croatian, Serbian, Irish, Latvian, Ukrainian, Chinese, Indonesian, Welsh, Galician, Japanese, Korean, Hebrew, and Bulgarian.

## Building

Requires the Pebble SDK (4.9+):

```
pebble build
pebble install --emulator basalt
```

## Issues

Report issues at: https://github.com/gravity-rose/TimeStyleNext/issues

## License

Dual licensed. Original code from freakified/plarus retains the **MIT License**. New and modified code in this fork is licensed under **CC BY-NC-SA 4.0**. See [LICENSE](LICENSE) for details. Individual source files carry SPDX headers indicating which license(s) apply.

## Credits

- Original TimeStyle by [freakified](https://github.com/freakified/TimeStylePebble)
- TimeStyle BB fork by [plarus](https://github.com/plarus/TimeStyleBBPebble)
- Open-Meteo weather integration ported from upstream freakified
- Alt timezone fix by Flynn Duniho
