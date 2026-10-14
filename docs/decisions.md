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

Pick a preset, then tap +1, +2, +5 or +10 minutes to start a timer.

## Each tap adds minutes to the running timer

While a preset is selected, every +N adds N minutes to the same timer, so +1 twice rings after 2 minutes. Under the hood the old alarm is cancelled and a new one is scheduled at previous ring time + N. Tapping the open preset again hides its panel without touching the timer; choosing it once more after that starts a separate timer. The current timer is also kept in a ref, so quick consecutive taps never read a stale value.

## Reset for big mistakes, −1 for small ones

A mistake such as +10 twice is fixed with a Reset button that clears the timer back to zero; a -N button would need many taps to undo a big mistake. A single −1 button covers the common small case, such as a preset that starts at 5 minutes when 3 is wanted. It moves the ring time one minute earlier, and if the timer has a minute or less left it stops it like Reset. It is disabled until a timer exists. Cancel in the Active timers list also still works.

## The big countdown sits below the minute buttons

The live countdown stays visible while its preset is selected, even after the buttons hide, and clears when the timer rings. It is placed below the +N row, not above it, so the buttons never move when it first appears and fast repeated taps keep hitting the same spot.

## The ring time is computed in JavaScript

`scheduleTimer` computes the ring time itself and passes it to the native module as a timestamp, so the exact time can be shown to the user and the same value is what Android is given.

## Timer starts immediately; taps within 5 seconds add to it

A timer is scheduled on the first tap, and more taps within 5 seconds of each other add to it. After 5 seconds with no tap the +N buttons and Reset hide, the countdown stays until the timer rings, and the timer stays scheduled. Delaying the start by 5 seconds would lose the timer if the user left the app in that window.

## Menu is a plain button, not a navigation drawer

A drawer needs a navigation library. One menu item (Alarm permissions) doesn't justify the dependency, so ☰ opens a small panel. Revisit if more screens are added.

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

## No custom minutes field

Since every +N tap adds to the running timer and Reset undoes mistakes, any time can be reached with a few taps (45 minutes is +10 four times and +5). The typed-minutes field and its validation were removed to keep the screen and the code smaller. Bring it back if long odd times become common.

## A default time starts the timer on tap

A preset can have an optional default time (for example the pump runs 6 minutes). Tapping it starts that timer at once, so the common case is one tap. The +N buttons and Reset still show for 5 seconds to add time or undo a stray tap. A second tap on the same preset hides the panel instead of starting another timer, so a double tap cannot start two timers. Presets without a default work as before.

## A visible edit button on each preset opens the edit popup

Editing and deleting a preset is reached through a ✎ button on its row, not a long-press, because a hidden gesture is not discoverable. The button opens the same popup as the + button, filled in, with Delete inside it, so a delete is a deliberate two-step action. A preset's default time is also shown on its button (for example "Pump · 6 min") since tapping it starts that timer. Deleting a preset does not cancel a timer already running for it.

## One design system, no UI libraries

Colours, sizes and the two shared components live in `src/ui/`. Plain React Native styles and the built-in `Animated` are enough, so there is no icon, gradient or styling dependency and no native rebuild for UI changes. Large touch targets, labelled controls and a contrast test come from the requirement that older people can use the app (see `docs/design.md`).

## The timer controls are docked at the bottom

With several presets, a countdown placed under the list fell below the visible area and a bottom bar holding the add button took vertical space. The add button is now a floating round "+" (hidden while the panel is open), the countdown, +N buttons and Reset sit in a fixed panel at the bottom, and only the preset list scrolls. The panel keeps the same size before and after the first tap (placeholder countdown, Reset greyed out), so quick taps on +N never land on something that moved.

## The ring screen is native, large and themed

When the alarm rings, the owner may be half asleep or far from the phone, so `RingActivity` shows the name, "Time's up!" and one very large STOP button, in light or dark to match the phone. It stays in Kotlin so it opens without starting JavaScript.

## Cancel closes the panel, Reset keeps it

Cancelling the running timer from the Active timers list also deselects its preset, so the countdown panel disappears and only returns when a preset is chosen again. Reset is meant for fixing a mistake while setting a time, so it cancels the alarm but keeps the preset selected and the +N buttons ready.

## Theme choice uses Appearance.setColorScheme

The Menu lets the user pick Dark, Light or Phone (follow the phone). The choice is applied with React Native's `Appearance.setColorScheme`, which overrides the colour scheme for the whole app, so `useTheme()` and the status bar needed no changes and no context provider was added. In React Native 0.86 "follow the phone" is the value `'unspecified'`, not `null`. The native ring screen is a plain Android activity and keeps following the phone's setting.

## Home-screen widget: one widget per preset

A widget is native Android UI (`AppWidgetProvider` and `RemoteViews`), so it lives in the `alarm-ring` module. Each widget is a single big button for one preset, picked when the widget is added; only presets with a default time are offered, because one tap needs a duration. Tapping starts the timer from a broadcast receiver, so the app does not open and JavaScript does not need to be running. A tap starts a new timer, but a second tap on the same widget within 10 seconds is ignored with an "already started" toast, because it is almost always a mistake and cancelling means opening the app, which defeats the widget. The window is a fixed time rather than "while a timer is running", so two real timers of the same preset (two laundry loads) are still possible, and it only starts after a successful start so a failed tap can be retried at once. The widget cannot read AsyncStorage, so the app copies the presets into `SharedPreferences` whenever they change; a failed copy is logged and ignored because widgets are optional. Timers started by a widget are saved natively and imported into the Active timers list the next time the app opens or returns to the foreground, so they can be seen and cancelled there.

## Plain launch screen

Expo's template splash (a grey grid with circles on white) showed on every launch and ignored dark mode. The launch screen is now only the app's background colour, light `#F4F6FB` or dark `#0F1220` with the phone, so the app opens without a flash. It is set with the `expo-splash-screen` config plugin in `app.json`, which needs a native rebuild. The plugin insists on an image, so `assets/splash-transparent.png` is a 1x1 transparent pixel. If the background colours in `src/ui/theme.ts` change, change them in `app.json` too.

## App icon

The icon is a white stopwatch on the theme's indigo (`#3949AB`), replacing Expo's default chevron. It is an Android adaptive icon: the indigo is a plain `backgroundColor` in `app.json` (no background image), `assets/android-icon-foreground.png` is the glyph kept inside the safe zone so no launcher mask crops it, and the same glyph is the monochrome image for themed icons. Changing the icon needs `npx expo prebuild --platform android --no-install` and a rebuild.
