import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Absolute path to the `plugins.js` that registers `@tevm/bun-plugin`.
 *
 * Preloading this module is what lets a script `import` a `.sol` file directly.
 *
 * @type {string}
 */
export const pluginsPath = join(__dirname, '..', 'plugins.js')

/**
 * Absolute path to the `bunfig.toml` shipped with the package.
 *
 * Its `preload` entry is written relative to the package directory, so Bun only resolves it
 * when the current working directory *is* that package. Use {@link resolveConfigPath} to get a
 * config that works from any directory; this export remains for callers that want the
 * on-disk package file itself.
 *
 * @type {string}
 * @example
 * ```js
 * import { configPath } from 'tevm-run'
 *
 * console.log(configPath)
 * // /path/to/node_modules/tevm-run/bunfig.toml
 * ```
 */
export const configPath = join(__dirname, '..', 'bunfig.toml')

/** @type {string | undefined} */
let cachedRuntimeConfigPath

/**
 * Produce a `bunfig.toml` whose `preload` path is absolute, and return its path.
 *
 * Bun resolves a relative `preload` against the current working directory rather than
 * against the config file, so the packaged `bunfig.toml` only works when Bun happens to be
 * invoked from the `tevm-run` package directory. Everywhere else it fails with
 * `preload not found "./plugins.js"`. This writes an equivalent config into a temp
 * directory with {@link pluginsPath} spelled out in full, which behaves identically from
 * any working directory.
 *
 * The file is generated once per process and reused.
 *
 * @returns {string} Absolute path to a usable `bunfig.toml`.
 * @throws {Error} If the temporary config cannot be created, for example when `TMPDIR` is not writable.
 * @example
 * ```js
 * import { resolveConfigPath } from 'tevm-run'
 * import { $ } from 'bun'
 *
 * await $`bun run --config=${resolveConfigPath()} ./script.ts`
 * ```
 */
export const resolveConfigPath = () => {
	if (cachedRuntimeConfigPath) {
		return cachedRuntimeConfigPath
	}
	const directory = mkdtempSync(join(tmpdir(), 'tevm-run-'))
	const runtimeConfigPath = join(directory, 'bunfig.toml')
	const preload = JSON.stringify(pluginsPath)
	writeFileSync(
		runtimeConfigPath,
		`preload = [${preload}]\n[install]\nauto = "fallback"\n[test]\npreload = [${preload}]\n`,
	)
	cachedRuntimeConfigPath = runtimeConfigPath
	return runtimeConfigPath
}
