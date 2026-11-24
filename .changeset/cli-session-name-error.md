---
'@tevm/cli': patch
---

Report a missing `--session` name as `error: --session requires a name` (or a JSON failure envelope under `--json`) with exit code 1, instead of crashing with a stack trace.
