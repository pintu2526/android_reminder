# Decisions

## Local-only, no backend

Timers and presets live on the device, and Android's AlarmManager fires the alarm. A server adds network delay and failure points to a stove timer and gives nothing in return. Storage sits behind one small module so Express/MongoDB sync can be added later without a rewrite.

## Expo development build, not Expo Go

Exact-alarm permission and a full-screen ringing screen need native code that Expo Go can't run.

## Alarm-style notifications

Scheduled local notifications use a high-importance channel with alarm audio usage, so the alarm still rings in silent mode and with the screen off. Exact alarms need `SCHEDULE_EXACT_ALARM`; on some phones the user must also exempt the app from battery optimization.

## Two-tap flow

Pick a preset, then tap +1, +2, +5 or +10 minutes to start a timer. Open question: whether each tap sets the timer from now or adds to a running timer.

## Full-screen ringing screen is phase 2

It needs a native module (full-screen intent). The first version relies on the alarm-style notification.
