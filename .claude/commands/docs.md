---
description: Sync everything in docs/ with the current state of the app in one pass
disable-model-invocation: true
---

Bring the documentation in `docs/` up to date with the code as it is now.

1. Read `CLAUDE.md` for the documentation rules, then list the files in `docs/` and the app source.
2. Work out which features, screens, permissions, config and decisions exist in the code but are missing or outdated in the docs.
3. Update the relevant `docs/*.md` files, and create new ones for undocumented areas. Add non-obvious decisions to `docs/decisions.md`.
4. Do not create a changelog. Docs describe the current behavior, not the history.
5. Remove or fix doc content that no longer matches the code.
6. Finish with a short list of the doc files you created or changed.

Extra instructions from the user: $ARGUMENTS
