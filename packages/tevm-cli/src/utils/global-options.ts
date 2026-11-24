export type NormalizedCliArguments = {
	argv: string[]
	json: boolean
	session?: string
}

/**
 * Normalize global options before Pastel routes to a command.
 *
 * `--json` and `--session` are accepted by every command even when an individual
 * command schema does not repeat those shared options.
 *
 * @example
 * ```ts
 * normalizeGlobalOptions(['node', 'tevm', 'call', '--json', '--session', 'demo'])
 * ```
 */
export function normalizeGlobalOptions(argv: string[]): NormalizedCliArguments {
	const normalized = argv.slice(0, 2)
	let json = process.env['TEVM_JSON'] === 'true'
	let session = process.env['TEVM_SESSION']

	for (let index = 2; index < argv.length; index++) {
		const value = argv[index]
		if (value === '--json') {
			json = true
			continue
		}
		if (value === '--no-json') {
			json = false
			continue
		}
		if (value?.startsWith('--json=')) {
			json = value.slice('--json='.length) !== 'false'
			continue
		}
		if (value === '--session') {
			const name = argv[index + 1]
			if (!name || name.startsWith('-')) {
				throw new Error('--session requires a name')
			}
			session = name
			index++
			continue
		}
		if (value?.startsWith('--session=')) {
			const name = value.slice('--session='.length)
			if (!name) {
				throw new Error('--session requires a name')
			}
			session = name
			continue
		}
		if (value !== undefined) {
			normalized.push(value)
		}
	}

	process.env['TEVM_JSON'] = String(json)
	if (session) {
		process.env['TEVM_SESSION'] = session
	}
	return {
		argv: normalized,
		json,
		...(session ? { session } : {}),
	}
}

/**
 * Decide whether an action must bypass the interactive editor.
 *
 * JSON output is always direct so scripts and agents never open an editor.
 *
 * @example
 * ```ts
 * shouldRunDirectly({ json: true })
 * // true
 * ```
 */
export function shouldRunDirectly(options: Record<string, unknown>): boolean {
	return options['run'] === true || options['json'] === true
}

/**
 * Render a global-option error the way the rest of the CLI reports failures.
 *
 * With `--json` (flag or `TEVM_JSON=true`) the error is a JSON failure envelope on stdout,
 * so scripts parsing output still get valid JSON. Otherwise it is a single `error:` line
 * for stderr, matching Commander's own usage errors.
 *
 * @example
 * ```ts
 * formatGlobalOptionsError(['node', 'tevm', 'call', '--session'], new Error('--session requires a name'))
 * // { stream: 'stderr', text: 'error: --session requires a name\n' }
 * ```
 */
export function formatGlobalOptionsError(
	argv: string[],
	error: unknown,
): { stream: 'stdout' | 'stderr'; text: string } {
	const message = error instanceof Error ? error.message : String(error)
	const args = argv.slice(2)
	const json =
		args.includes('--json') ||
		args.some((value) => value.startsWith('--json=') && value !== '--json=false') ||
		(process.env['TEVM_JSON'] === 'true' && !args.includes('--no-json'))
	if (!json) {
		return { stream: 'stderr', text: `error: ${message}\n` }
	}
	const command = args.find((value) => !value.startsWith('-')) ?? 'tevm'
	return { stream: 'stdout', text: `${JSON.stringify({ ok: false, command, error: { message } }, null, 2)}\n` }
}
