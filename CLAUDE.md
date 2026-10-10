# Android Quick Reminder

A quick-timer / alarm app. The user taps a preset (e.g. "Milk on stove") and then +1, +2, +5 or +10 minutes, and a timer starts in two taps. The alarm must ring even when the screen is off or the app is closed.

## Stack

- React Native with Expo (development build, not Expo Go)
- TypeScript
- `expo-notifications` for scheduled local notifications with an alarm-style channel
- AsyncStorage (or MMKV) for presets and timer state
- No backend. Everything runs on the device. Express/MongoDB may be added later for sync, so keep storage behind one small module.

## Key decisions

- Local-only: Android's AlarmManager fires alarms, so no server is needed.
- Needs exact-alarm permission, notification permission and a battery-optimization exemption to ring reliably.
- A full-screen ringing screen needs a native module (phase 2).

## Code standards

- Follow industry-standard practices for React Native, TypeScript and Android: clear structure, consistent naming, proper error handling, no hard-coded secrets, and no unnecessary permissions.
- Keep code minimal. Write only what the feature needs, with no speculative abstractions, dead code or unused dependencies.
- Make code easy for a human to read: descriptive names, small focused functions and components, simple control flow.
- Add comments only where they are necessary, such as explaining why something non-obvious is done. Do not comment what the code already says.

## Workflow

- The owner is a MERN developer learning React Native and Android. Explain the why briefly as you go, and name each new concept the first time it appears.
- Work in small steps. Finish and verify one piece before starting the next.
- Ask before adding dependencies, changing the stack, or making large structural changes.
- Before calling work done, run typecheck, lint and tests (once they exist) and report any failures honestly.
- Never commit to git unless asked.

## Learning AI while building

A second goal of this project is for the owner to learn to work well with AI tools.

- When using or suggesting a Claude Code feature (CLAUDE.md, slash commands, agents, hooks, permissions, plan mode, memory, MCP), say what it is and why it fits here, in a sentence or two.
- When a prompt could be clearer, briefly show how to ask better (specific goal, constraints, what "done" looks like).
- Before a large task, propose a short plan and wait for approval, so the owner sees how to steer AI work.
- Say plainly when you are unsure, when something is an assumption, and how it was verified.
- After finishing a milestone, suggest one AI-workflow improvement worth trying next.
- Capture the useful lessons in `docs/ai-workflow.md`: what worked, what didn't, and prompts worth reusing.

## Commands

- `npm start`: start the dev server (needs a development build installed on the phone, not Expo Go)
- `npm run android`: build and run on a connected Android device or emulator (needs the Android SDK)
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run format`
- `npx expo install <package>`: always use this instead of `npm install` for Expo/React Native packages, so versions match the SDK
- `npx expo-doctor`: diagnose dependency and config problems

Expo SDK 57. Expo APIs change between SDK versions, so check https://docs.expo.dev/versions/v57.0.0/ before using an Expo or React Native API instead of relying on memory. Changes to `app.json` plugins or permissions need a native rebuild.

## Folder structure

- `App.tsx`, `index.ts`: app entry
- `src/`: app code (features, storage module, tests in `src/__tests__/`)
- `docs/`: documentation
- `.claude/`: project commands (`/docs`, `/review`) and the `code-reviewer` agent

## Documentation rules

- Keep documentation in `docs/`, one markdown file per topic (for example `docs/architecture.md`, `docs/android-setup.md`).
- When a new feature is added or an existing one is updated, update the relevant file in `docs/` in the same change. Create the file if it doesn't exist.
- Record non-obvious decisions (the why) in `docs/decisions.md`.
- Do not keep a changelog file. Docs describe how the app works now, not a history of changes.
- Run `/docs` to sync all docs with the current code in one pass.
