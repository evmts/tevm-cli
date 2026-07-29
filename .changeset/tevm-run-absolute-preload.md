---
'tevm-run': patch
---

Fix `tevm-run` failing with `preload not found "./plugins.js"` when invoked from any directory other than the package's own.

Bun resolves a `bunfig.toml` `preload` entry relative to the current working directory rather than to the config file, so the packaged relative path only worked when Bun happened to run from inside the `tevm-run` package. `run()` now generates an equivalent config with an absolute preload path via the new `resolveConfigPath()` export, which behaves identically from any working directory. The existing `configPath` export is unchanged and still points at the packaged file.
