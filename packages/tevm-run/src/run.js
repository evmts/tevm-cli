import { $ } from 'bun'
import { parseArgs } from './parseArgs.js'
import { runArgs } from './runArgs.js'

/**
 * Type guard for errors thrown by the Bun shell when a command exits non-zero.
 *
 * @param {unknown} err
 * @returns {err is { stdout: { toString(): string }, stderr: { toString(): string }, exitCode: number }}
 */
const isShellError = (err) =>
	typeof err === 'object' && err !== null && 'stdout' in err && 'stderr' in err && 'exitCode' in err

/**
 * Execute a script with Bun using the `tevm-run` bunfig, which preloads the Tevm
 * Solidity plugin so the script can `import` `.sol` files directly.
 *
 * The script's stdout and stderr stream to this process. Only the script path is logged;
 * forwarded arguments are not, because they can carry secrets such as RPC URLs or keys.
 * On a non-zero exit the captured output is echoed before throwing, so failures stay
 * readable in CI logs.
 *
 * @param {string[]} [positionals] - `[scriptPath, ...scriptArgs]`. Defaults to the positionals
 *   parsed out of `process.argv`, which is what the `tevm-run` binary passes.
 * @returns {Promise<import('bun').$.ShellOutput>} The completed shell result.
 * @throws {Error} If the script exits non-zero. The underlying Bun shell error is attached as `cause`.
 * @example
 * ```js
 * import { run } from 'tevm-run'
 *
 * await run(['./scripts/deploy.ts', '--network', 'optimism'])
 * ```
 */
export const run = async ([scriptPath, ...positionals] = parseArgs(process.argv).positionals) => {
	if (scriptPath === undefined) {
		throw new Error('No script path provided.')
	}
	try {
		console.log(`[tevm-run] ${scriptPath}`)
		return await $`bun ${runArgs(scriptPath, positionals)}`
	} catch (err) {
		if (!isShellError(err)) throw err
		console.log('error')
		console.log(err.stdout.toString())
		console.error(`Failed with code ${err.exitCode}`)
		console.error(err.stderr.toString())
		throw new Error(`Error executing the script: ${err instanceof Error ? err.message : err.stderr.toString()}`, {
			cause: err,
		})
	}
}
