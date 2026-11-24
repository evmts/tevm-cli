import { afterAll, beforeAll, describe, expect, it, spyOn } from 'bun:test'
import fc from 'fast-check'
import { parseArgs } from './parseArgs.js'

const runs = Number(process.env['FUZZ_RUNS'] ?? 500)
const entry = fc.constantFrom('tevm-run', 'tevm-run.js', '/usr/local/bin/tevm-run', 'C:\\bin\\tevm-run.js')
const scriptPath = fc
	.string({ minLength: 1, maxLength: 40 })
	.filter((value) => !value.startsWith('-') && !/(^|[\\/])tevm-run(\.js)?$/.test(value))
const forwarded = fc.array(fc.string({ maxLength: 30 }), { maxLength: 12 })

describe('parseArgs fuzz', () => {
	// parseArgs prints usage before throwing; keep thousands of runs from flooding the log.
	let errorSpy: ReturnType<typeof spyOn>
	beforeAll(() => {
		errorSpy = spyOn(console, 'error').mockImplementation(() => {})
	})
	afterAll(() => errorSpy.mockRestore())

	it('forwards every argument after the script path unchanged', () => {
		fc.assert(
			fc.property(entry, scriptPath, forwarded, (bin, script, rest) => {
				const filtered = rest.filter((value) => !/(^|[\\/])tevm-run(\.js)?$/.test(value))
				expect(parseArgs(['bun', bin, script, ...filtered]).positionals).toEqual([script, ...filtered])
			}),
			{ numRuns: runs },
		)
	})

	it('either returns a non-empty script path or throws a typed error for arbitrary argv', () => {
		fc.assert(
			fc.property(fc.array(fc.string({ maxLength: 30 }), { maxLength: 12 }), (argv) => {
				try {
					const { positionals } = parseArgs(argv)
					expect(positionals.length).toBeGreaterThan(0)
					expect(argv.join('\0').endsWith(positionals.join('\0'))).toBe(true)
				} catch (error) {
					expect(error).toBeInstanceOf(Error)
				}
			}),
			{ numRuns: runs },
		)
	})
})
