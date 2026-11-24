import { parseArgs as nodeParseArgs } from 'node:util'
import { argsSchema } from './argsSchema.js'

/** Matches the `tevm-run` entry point as a bare name or as the final path segment. */
const ENTRY_POINT = /(^|[\\/])tevm-run(\.js)?$/

/**
 * Split a raw `process.argv` into the script path and the arguments forwarded to it.
 *
 * Everything up to and including the `tevm-run` entry point is stripped, so the returned
 * `positionals` start at the script path. Everything after the script path belongs to the
 * script and is forwarded verbatim, including arguments that start with `-`. A leading `--`
 * before the script path is accepted and dropped. When no `tevm-run` entry point is present,
 * the first two entries (runtime and entry script) are stripped, like `process.argv`.
 *
 * @param {string[]} rawArgs - Raw argument vector, normally `process.argv`.
 * @returns {{ values: Record<string, never>, positionals: string[] }} Parsed arguments whose
 *   first positional is the script path.
 * @throws {Error} If no script path follows `tevm-run`.
 * @throws {TypeError} If a `--flag` appears before the script path, because `tevm-run` has no
 *   flags of its own and {@link argsSchema} is strict.
 * @example
 * ```js
 * import { parseArgs } from 'tevm-run'
 *
 * const { positionals } = parseArgs(['/bin/bun', '/usr/local/bin/tevm-run', './script.ts', '--network', 'optimism'])
 * console.log(positionals)
 * // [ './script.ts', '--network', 'optimism' ]
 * ```
 */
export const parseArgs = (rawArgs) => {
	const entryIndex = rawArgs.findIndex((arg) => ENTRY_POINT.test(arg))
	const afterEntry = rawArgs.slice(entryIndex === -1 ? 2 : entryIndex + 1)
	const positionals = afterEntry[0] === '--' ? afterEntry.slice(1) : afterEntry
	const scriptPath = positionals[0]
	if (scriptPath === undefined) {
		console.error('Usage: tevm-run <scriptPath> [positionals...]')
		throw new Error('No script path provided.')
	}
	if (afterEntry[0] !== '--' && scriptPath.startsWith('-')) {
		// Delegate to node:util so unknown flags fail with its standard TypeError.
		nodeParseArgs({ ...argsSchema, args: [scriptPath] })
	}
	return { values: {}, positionals }
}
