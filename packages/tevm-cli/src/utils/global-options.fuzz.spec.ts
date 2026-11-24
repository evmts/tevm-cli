import fc from 'fast-check'
import { afterEach, describe, expect, it } from 'vitest'
import { normalizeGlobalOptions } from './global-options.js'
import { getSessionPath, parseSessionBlockNumber } from './session.js'

const runs = Number(process.env['FUZZ_RUNS'] ?? 500)
const originalJson = process.env['TEVM_JSON']
const originalSession = process.env['TEVM_SESSION']

afterEach(() => {
	if (originalJson === undefined) delete process.env['TEVM_JSON']
	else process.env['TEVM_JSON'] = originalJson
	if (originalSession === undefined) delete process.env['TEVM_SESSION']
	else process.env['TEVM_SESSION'] = originalSession
})

const isGlobal = (value: string) =>
	value === '--json' ||
	value === '--no-json' ||
	value.startsWith('--json=') ||
	value === '--session' ||
	value.startsWith('--session=')
const commandArg = fc.string({ maxLength: 20 }).filter((value) => !isGlobal(value))
const sessionName = fc.stringMatching(/^[a-zA-Z0-9._-]{1,16}$/)

describe('normalizeGlobalOptions fuzz', () => {
	it('passes command arguments through in order when no global flags are present', () => {
		fc.assert(
			fc.property(fc.array(commandArg, { maxLength: 12 }), (args) => {
				delete process.env['TEVM_JSON']
				delete process.env['TEVM_SESSION']
				expect(normalizeGlobalOptions(['node', 'tevm', ...args])).toEqual({
					argv: ['node', 'tevm', ...args],
					json: false,
				})
			}),
			{ numRuns: runs },
		)
	})

	it('strips --json and --session from any position and keeps the remaining order', () => {
		fc.assert(
			fc.property(
				fc.array(commandArg, { maxLength: 8 }),
				sessionName,
				fc.nat(),
				fc.nat(),
				fc.boolean(),
				(args, name, jsonAt, sessionAt, inline) => {
					delete process.env['TEVM_JSON']
					delete process.env['TEVM_SESSION']
					const withFlags = [...args]
					withFlags.splice(jsonAt % (withFlags.length + 1), 0, '--json')
					const sessionFlag = inline ? [`--session=${name}`] : ['--session', name]
					withFlags.splice(sessionAt % (withFlags.length + 1), 0, ...sessionFlag)
					// `--session -x` is ambiguous with a flag, so dash-leading names need `--session=-x`.
					fc.pre(inline || !name.startsWith('-'))
					const result = normalizeGlobalOptions(['node', 'tevm', ...withFlags])
					expect(result).toEqual({ argv: ['node', 'tevm', ...args], json: true, session: name })
					expect(process.env['TEVM_SESSION']).toBe(name)
				},
			),
			{ numRuns: runs },
		)
	})

	it('rejects --session without a name instead of consuming the next flag', () => {
		fc.assert(
			fc.property(
				fc.array(commandArg, { maxLength: 6 }),
				fc.constantFrom([], ['--json'], ['--rpc'], ['-v']),
				(args, next) => {
					expect(() => normalizeGlobalOptions(['node', 'tevm', ...args, '--session', ...next])).toThrow(
						'--session requires a name',
					)
				},
			),
			{ numRuns: runs },
		)
	})
})

describe('session input fuzz', () => {
	it('only accepts session names that stay inside the session directory', () => {
		fc.assert(
			fc.property(fc.string({ maxLength: 24 }), (name) => {
				let sessionPath: string
				try {
					sessionPath = getSessionPath(name, '/sessions')
				} catch (error) {
					expect((error as Error).message).toContain('Session names may contain only')
					return
				}
				expect(sessionPath).toBe(`/sessions/${name}.json`)
				expect(name).toMatch(/^[a-zA-Z0-9._-]+$/)
			}),
			{ numRuns: runs },
		)
	})

	it('parses exactly the canonical decimal block numbers', () => {
		fc.assert(
			fc.property(
				fc.oneof(fc.bigInt({ min: 0n, max: 2n ** 256n }).map(String), fc.string({ maxLength: 12 })),
				(value) => {
					const canonical = /^(0|[1-9][0-9]*)$/.test(value)
					if (canonical) expect(parseSessionBlockNumber(value, 'blockNumber')).toBe(BigInt(value))
					else expect(() => parseSessionBlockNumber(value, 'blockNumber')).toThrow('Invalid blockNumber')
				},
			),
			{ numRuns: runs },
		)
	})
})
