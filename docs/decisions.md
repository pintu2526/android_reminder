# Decisions

## Local-only, no backend

Timers and presets live on the device, and Android's AlarmManager fires the alarm. A server adds network delay and failure points to a stove timer and gives nothing in return. Storage sits behind one small module so Express/MongoDB sync can be added later without a rewrite.

## Expo development build, not Expo Go

Exact-alarm permission and a full-screen ringing screen need native code that Expo Go can't run.

## A native alarm module instead of notifications

A plain notification is easy to miss, and `expo-notifications` cannot loop a sound or open a screen. Notifee, the usual library for this, was archived in April 2026. So a small local Expo module in Kotlin (`modules/alarm-ring/`) sets the alarm, plays the ring and shows the ringing screen. It lives under `modules/` because `android/` is generated and gitignored.

## setAlarmClock for scheduling

`AlarmManager.setAlarmClock` gives precise delivery and shows the alarm icon in the status bar. It still needs the exact-alarm permission (the Android 14 behavior-change page lists it next to `setExact`). I chose it over `setExactAndAllowWhileIdle` because I believe, from general knowledge and not a checked source, that the latter is rate-limited in Doze, which would hurt repeated short timers.

## SCHEDULE_EXACT_ALARM, not USE_EXACT_ALARM

`SCHEDULE_EXACT_ALARM` is switched on by the user in "Alarms & reminders" settings, and the app shows its status. `USE_EXACT_ALARM` is granted on install but Google Play restricts it. Revisit before publishing to Play.

## mediaPlayback foreground service

The ringing runs in a foreground service so Android does not kill it. `mediaPlayback` fits continuous sound and has no eligibility rules. `systemExempted` and `specialUse` need extra justification.

## Native ringing screen, default alarm tone, 2-minute limit

The ringing screen is a plain Kotlin Activity (label and Stop button) so it opens instantly without starting JavaScript. The sound is the phone's default alarm tone, so no sound files are bundled. It rings until Stop, or stops itself after 2 minutes. There is no snooze.

## The notification channel is created when the module loads

Android 13+ shows the notification permission prompt only for apps that already have a notification channel. The native module creates `ringing_timers` at startup so the permission request works. A fresh install showed the prompt without any channel code in JavaScript.

## Two-tap flow

Pick a preset, then tap +1, +2, +5 or +10 minutes to start a timer. Open question: whether each tap sets the timer from now or adds to a running timer.

## Each tap starts a new timer from now

Resolves the open question in "Two-tap flow": tapping +N schedules a separate timer N minutes from now. Timers don't add to each other.

## The ring time is computed in JavaScript

`scheduleTimer` computes the ring time itself and passes it to the native module as a timestamp, so the exact time can be shown to the user and the same value is what Android is given.

## Timer starts immediately; the 5-second window only allows replacing it

A timer is scheduled on the first tap and replaced if the user picks another time within 5 seconds. Delaying the start by 5 seconds would lose the timer if the user left the app in that window.

## Menu is a plain button, not a navigation drawer

A drawer needs a navigation library. One menu item doesn't justify the dependency, so ☰ opens a small panel. Revisit if more screens are added.

## Wake lock through MediaPlayer, tone fallback

`MediaPlayer.setWakeMode` keeps the CPU awake while the ring plays with the screen off, so the sound doesn't stutter or stop. It needs the normal `WAKE_LOCK` permission. If the default alarm tone is missing (some emulators and phones), the service tries the default ringtone and then the notification sound, because a silent alarm is the worst failure for this app.

## No fallback for a refused foreground-service start

Starting `RingService` from the alarm broadcast could in theory be refused on Android 12+. On the emulator the log shows it was allowed because the alarm came from `setAlarmClock` (`ALARM_MANAGER_ALARM_CLOCK`), so no fallback was built. Revisit if a real phone ever shows a silent alarm.

## Reboot persistence is intentionally not built

Alarms are lost on reboot by choice. Timers are short, so the owner accepted this.

## Active timers are stored; finished ones are dropped by time

The list needs ids to cancel alarms, so each timer is saved when scheduled. The ring screen's Stop button is native code that JavaScript is not told about, so JavaScript drops a timer once its ring time has passed instead. The list is an array so several timers can run at once. A timer cancelled by Android's force-stop stays listed until its time passes, because the app cannot detect that.

## Timers need notifications on; vibration if no sound plays

Tested on the emulator: with notification permission denied, the ring service plays but no notification is posted, so there is no Stop button or ring screen and the alarm can only be stopped by waiting out the 2 minutes. The app therefore refuses to start a timer until Notifications are on. Revoking the permission after a timer is scheduled is not covered. If no tone can be played, or the player errors, the service vibrates (needs the normal `VIBRATE` permission) so the alarm is never silent. Vibration is not verified on a device.
