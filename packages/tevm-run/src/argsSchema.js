/**
 * Schema handed to `node:util`'s `parseArgs` when reading a `tevm-run` invocation.
 *
 * `tevm-run` has no flags of its own — everything after the script path is forwarded
 * verbatim to the script — so the schema declares no options, allows positionals, and
 * stays strict so an unrecognised `--flag` fails loudly instead of being dropped.
 *
 * @type {{ options: Record<string, never>, strict: true, allowPositionals: true }}
 * @example
 * ```js
 * import { parseArgs } from 'node:util'
 * import { argsSchema } from 'tevm-run'
 *
 * const args = parseArgs({ ...argsSchema, args: ['bun', 'tevm-run', './script.ts', 'alice'] })
 * console.log(args.positionals)
 * // [ 'bun', 'tevm-run', './script.ts', 'alice' ]
 * ```
 */
export const argsSchema = {
	options: {},
	strict: true,
	allowPositionals: true,
}
