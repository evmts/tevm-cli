import { parseArgs as nodeParseArgs } from 'node:util'
import { argsSchema } from './argsSchema.js'

/**
 * Split a raw `process.argv` into the script path and the arguments forwarded to it.
 *
 * The Bun executable and the `tevm-run` entry point are stripped, so the returned
 * `positionals` start at the script path. Everything after it belongs to the script.
 *
 * @param {string[]} rawArgs - Raw argument vector, normally `process.argv`.
 * @returns {{ values: Record<string, never>, positionals: string[] }} Parsed arguments whose
 *   first positional is the script path.
 * @throws {Error} If no script path follows `tevm-run`.
 * @throws {TypeError} If an unrecognised `--flag` is present, because {@link argsSchema} is strict.
 * @example
 * ```js
 * import { parseArgs } from 'tevm-run'
 *
 * const { positionals } = parseArgs(['/bin/bun', '/usr/local/bin/tevm-run', './script.ts', 'alice'])
 * console.log(positionals)
 * // [ './script.ts', 'alice' ]
 * ```
 */
export const parseArgs = (rawArgs) => {
	const args = nodeParseArgs({
		...argsSchema,
		args: rawArgs,
	})
	const tevmRunIndex = rawArgs.findIndex((arg) => arg.endsWith('tevm-run') || arg.endsWith('tevm-run.js'))
	// remove the bun arg and the tevm-run.js arg
	args.positionals = args.positionals.slice(tevmRunIndex + 1)
	if (args.positionals.length === 0) {
		console.error('Usage: tevm-run <scriptPath> [positionals...]')
		throw new Error('No script path provided.')
	}
	return args
}
