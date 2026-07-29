import { $ } from 'bun'
import { resolveConfigPath } from './configPath.js'
import { parseArgs } from './parseArgs.js'

/**
 * Execute a script with Bun using the `tevm-run` bunfig, which preloads the Tevm
 * Solidity plugin so the script can `import` `.sol` files directly.
 *
 * The script's stdout and stderr stream to this process. On a non-zero exit the captured
 * output is echoed before throwing, so failures stay readable in CI logs.
 *
 * @param {string[]} [positionals] - `[scriptPath, ...scriptArgs]`. Defaults to the positionals
 *   parsed out of `process.argv`, which is what the `tevm-run` binary passes.
 * @returns {Promise<import('bun').ShellOutput>} The completed shell result.
 * @throws {Error} If the script exits non-zero. The underlying Bun shell error is attached as `cause`.
 * @example
 * ```js
 * import { run } from 'tevm-run'
 *
 * await run(['./scripts/deploy.ts', '--network', 'optimism'])
 * ```
 */
export const run = async ([scriptPath, ...positionals] = parseArgs(process.argv).positionals) => {
	// Resolved rather than the packaged bunfig: Bun reads `preload` relative to the current
	// working directory, so the packaged relative path only works from the package itself.
	const config = resolveConfigPath()
	try {
		const command = `[tevm-run] bun run --bun --config=${config} --install=fallback ${scriptPath} ${positionals.join(' ')}`
		console.log(command)
		return await $`bun run --config=${config} --install=fallback ${scriptPath} ${positionals}`
	} catch (err) {
		console.log('error')
		console.log(err.stdout.toString())
		console.error(`Failed with code ${err.exitCode}`)
		console.error(err.stderr.toString())
		throw new Error(`Error executing the script: ${err instanceof Error ? err.message : err.stderr.toString()}`, {
			cause: err,
		})
	}
}
