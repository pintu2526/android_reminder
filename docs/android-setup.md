# Android setup

## Tooling on this machine

- Node 24, npm 11 and Java 21 are installed.
- The Android SDK is not installed (`ANDROID_HOME` is unset and there is no `adb`). To run the app, either install Android Studio, or build in the cloud with EAS.

## Running the app

The app needs a development build, not Expo Go, because it uses exact alarms and (later) a full-screen intent.

1. Install Android Studio (SDK, platform tools, an emulator or a USB-debugging phone).
2. `npm run android` builds the development build and installs it.
3. `npm start` starts the dev server the build connects to.

## Permissions

Declared in `app.json`:

- `SCHEDULE_EXACT_ALARM`: lets timers fire at the exact time on Android 12+.
- `POST_NOTIFICATIONS`: needed on Android 13+; the app must also ask for it at runtime.

On some phones the user must also exempt the app from battery optimization, or the system may delay or kill alarms.

## Config

- The notification channel default is `timers`.
- The Android package id is `com.pintu.quickreminder`. Change it in `app.json` before publishing.
- Changing plugins or permissions in `app.json` requires a rebuild.

## Known issue

`npm audit` reports vulnerabilities in Expo's own build-tool dependencies. They are not fixed with `npm audit fix --force`, which can break the SDK. Upgrade Expo SDK versions instead.
