/**
 * Programmatic entry point for `tevm-run`.
 *
 * The package is normally used as the `tevm-run` binary, but the same pieces are importable
 * when you want to embed the runner in a build script or a test harness.
 *
 * @module tevm-run
 * @example
 * ```js
 * import { parseArgs, run } from 'tevm-run'
 *
 * const { positionals } = parseArgs(process.argv)
 * await run(positionals)
 * ```
 */
export * from './argsSchema.js'
export * from './configPath.js'
export * from './parseArgs.js'
export * from './run.js'
