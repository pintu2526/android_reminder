# Android setup

## Tooling on this machine

- Node 24, npm 11 and Java 21 are installed.
- The Android SDK is at `~/Android/Sdk` (`ANDROID_HOME` is set). Emulators: `Pixel_8_Pro` and `Medium_Phone_API_37.0`.

## Running the app

The app needs a development build, not Expo Go, because it contains a local native module (`modules/alarm-ring/`) for exact alarms and the ringing screen.

1. Start an emulator: `~/Android/Sdk/emulator/emulator -avd Pixel_8_Pro` (or use a USB-debugging phone). `adb devices` should list it. Do not add `-no-audio`: the emulator then plays no sound, and the ring looks silent even though it works.
2. `npm run android` builds the development build, installs it on the device adb finds, and starts the dev server.
3. After the first install, `npm start` and pressing `a` is enough. Rebuild only after native changes (`app.json` plugins or permissions, new native packages).

## Permissions

Declared in `app.json`:

- `SCHEDULE_EXACT_ALARM`: lets timers fire at the exact time on Android 12+.
- `POST_NOTIFICATIONS`: needed on Android 13+; the app asks for it at runtime.

Declared by the native module's manifest: `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `WAKE_LOCK`, `VIBRATE` and `USE_FULL_SCREEN_INTENT`.

The user has to turn two of these on by hand, and the ☰ → Alarm permissions screen shows their status with shortcuts:

- "Alarms & reminders" (exact alarms) is off after a fresh install on Android 13+. Without it the app cannot schedule a timer.
- Full-screen alerts can be off on Android 14+ if the system or the user revoked them.

Timers will not start while Notifications are off, because the Stop button and ring screen live in the notification.

On some phones the user must also exempt the app from battery optimization, or the system may delay or kill alarms.

## Testing on the emulator

- Grant exact alarms from the command line: `adb shell cmd appops set com.pintu.quickreminder SCHEDULE_EXACT_ALARM allow`.
- Check a scheduled alarm: `adb shell dumpsys alarm | grep -B1 -A3 alarmring`.
- Check the ring: `adb shell dumpsys activity services com.pintu.quickreminder` (is `RingService` running) and `adb shell dumpsys audio` (is a `USAGE_ALARM` player `started`).
- To close the app without cancelling its alarms, swipe it away in Recents. `adb shell am force-stop` cancels the app's alarms.
- Theme and text size: `adb shell cmd uimode night yes` (or `no`, `auto`) switches dark mode, and `adb shell settings put system font_scale 1.3` enlarges text (set it back to `1.0`).
- The emulator can stall under load (for example during a Gradle build): the Expo dev launcher may show "isn't responding" while the main thread waits on the emulator's graphics. That is the emulator, not the app. Let the build finish, or restart the emulator.
- To test the lock screen, set a PIN with `adb shell locksettings set-pin 1234` and remove it with `adb shell locksettings clear --old 1234`.

## Config

- The ringing notification channel is `ringing_timers`, created by the native module.
- The Android package id is `com.pintu.quickreminder`. Change it in `app.json` before publishing.
- Changing plugins or permissions in `app.json` requires a rebuild.

## Known issue

`npm audit` reports vulnerabilities in Expo's own build-tool dependencies. They are not fixed with `npm audit fix --force`, which can break the SDK. Upgrade Expo SDK versions instead.
