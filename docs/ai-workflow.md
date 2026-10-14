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

## Prompts worth reusing

- "Run the app on the Pixel_8_Pro emulator and confirm it launches." States the goal and what done looks like.
- "Propose a short plan for X and wait for my approval."
- "Give me a detailed plan for X, with what you verified and what you are assuming." Gets a plan with the unknowns marked.
- "Done when: I can <action> and see <result>." Gives the AI a check it can run itself.
