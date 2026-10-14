---
description: Industry-standard code review of the app (optionally pass files, folders, a branch or a focus area)
disable-model-invocation: true
---

Use the `code-reviewer` agent to review the code. Pass it this target and any instructions: $ARGUMENTS

If no target is given, tell the agent to review all uncommitted work: modified files from `git diff HEAD` and every untracked file in full. If there are no changes, review the whole of `src/` and `modules/`.

The agent runs typecheck, lint and tests itself and reviews both the TypeScript and the Kotlin module. Relay its full report to the user without softening or trimming it, then ask which findings they want fixed. Do not fix anything unprompted.
