---
'tevm-run': patch
---

Forward every argument after the script path verbatim, including flags such as `--network optimism`, instead of rejecting them. Log only the script path so forwarded secrets stay out of logs, and export `runArgs`.
