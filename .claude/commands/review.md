---
description: Run the code-reviewer agent on the app (optionally pass files, folders or focus)
disable-model-invocation: true
---

Use the `code-reviewer` agent to review the code. Pass it this target and any instructions: $ARGUMENTS

If no target is given, tell the agent to review the most recently changed code (or the whole `src`/`app` source if it can't tell what changed). Relay the agent's full report to the user without softening or trimming it.
