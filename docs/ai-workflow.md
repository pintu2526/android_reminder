# AI workflow notes

## What worked

- Asking for a plan before a large task, then replying "go". The scope was agreed before any code existed.
- Reading the installed package's TypeScript types (`node_modules/expo-notifications/build`) instead of relying on memory. The SDK 57 API matched what the code needed, and the typechecker confirmed it.
- Running typecheck, lint and tests after each step, so each piece was verified before the next started.
- Plan mode for the native alarm work: research first, one approved plan, then small verified steps. Each step had a concrete check (`dumpsys`, `logcat`, screenshots), not just "it compiles".
- Making the AI state assumptions. The plan said full-screen behavior while the phone is in use was unconfirmed, and testing showed exactly that.

## What went wrong

- A documentation fetch returned a confident answer that `setAlarmClock` needs no exact-alarm permission. The tool admitted the page was truncated and the answer came from memory. A second fetch of the right page showed the opposite. Check where a documentation answer came from before relying on it.
- `adb shell am kill` and `am kill-all` did not close the app, so the first "app closed" test was not a real one. Swiping the app away in Recents did.
- I restarted the emulator with `-no-audio` to keep it quiet, then the owner reported "the ringtone is not playing". The app was fine: Android played the sound, but the emulator had no audio output. When a test environment is started by the AI, record how (flags included) and check that first when a result looks wrong.
- A one-line check printed "ring screen shown after 102s", but the screen had been asleep, so no timer was ever set and nothing rang. A script's success message is not proof. Check the state itself (is an alarm pending, which activity is on top, what do the log timestamps say) before reporting a result.
- I started a second emulator before the first had finished shutting down, and both exited, which the owner noticed. After killing a process, wait until it is gone before starting its replacement.
- An "isn't responding" dialog looked like an app bug. The ANR report's main-thread stack showed it was waiting on the emulator's GPU (`HardwareRenderer.nSyncAndDrawFrame`), and a clean ring afterwards fired and showed the screen within half a second. Read the evidence (`dumpsys dropbox --print data_app_anr`) before changing code.
- A screenshot of the finished screen showed a layout problem that unit tests could not: with five presets, the countdown fell below the fold and the floating button covered it. Look at the real screen with realistic data, not only an empty one.

## Prompts worth reusing

- "Run the app on the Pixel_8_Pro emulator and confirm it launches." States the goal and what done looks like.
- "Propose a short plan for X and wait for my approval."
- "Give me a detailed plan for X, with what you verified and what you are assuming." Gets a plan with the unknowns marked.
- "Done when: I can <action> and see <result>." Gives the AI a check it can run itself.
