import { resolveConfigPath } from './configPath.js'

/**
 * Build the `bun` argument list that {@link import('./run.js').run} executes.
 *
 * Building the list in one place keeps the executed command and its tests in sync. The
 * config is the one returned by {@link resolveConfigPath}, whose `preload` path is absolute,
 * so the command works from any working directory.
 *
 * @param {string} scriptPath - Script to run.
 * @param {ReadonlyArray<string>} positionals - Arguments forwarded verbatim to the script.
 * @returns {string[]} Arguments that follow `bun`.
 * @example
 * ```js
 * import { runArgs } from 'tevm-run'
 *
 * runArgs('./script.ts', ['--network', 'optimism'])
 * // ['run', '--config=/tmp/tevm-run-XXXX/bunfig.toml', '--install=fallback', './script.ts', '--network', 'optimism']
 * ```
 */
export const runArgs = (scriptPath, positionals) => [
	'run',
	`--config=${resolveConfigPath()}`,
	'--install=fallback',
	scriptPath,
	...positionals,
]
