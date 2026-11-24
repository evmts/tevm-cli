import { describe, expect, it } from 'bun:test'
import { parseArgs } from './parseArgs.js'

describe(parseArgs.name, () => {
	it('returns the script path as the first positional', () => {
		expect(parseArgs(['bunx', 'tevm-run', './example/example.ts'])).toEqual({
			values: {},
			positionals: ['./example/example.ts'],
		})
	})

	it('strips everything up to an absolute tevm-run.js entry point', () => {
		expect(parseArgs(['/usr/bin/bun', '/pkg/src/tevm-run.js', './s.ts', 'a']).positionals).toEqual(['./s.ts', 'a'])
	})

	it('forwards flags after the script path verbatim', () => {
		expect(
			parseArgs(['bun', '/usr/local/bin/tevm-run', './s.ts', '--network', 'optimism', '-v', '--', 'x']).positionals,
		).toEqual(['./s.ts', '--network', 'optimism', '-v', '--', 'x'])
	})

	it('drops a leading -- before the script path', () => {
		expect(parseArgs(['bun', 'tevm-run', '--', './s.ts', '--flag']).positionals).toEqual(['./s.ts', '--flag'])
	})

	it('strips runtime and entry like process.argv when no tevm-run entry is present', () => {
		expect(parseArgs(['bun', './bin.js', './s.ts']).positionals).toEqual(['./s.ts'])
	})

	it('does not treat a path that merely ends in tevm-run as the entry point', () => {
		expect(parseArgs(['bun', 'tevm-run', './my-tevm-run']).positionals).toEqual(['./my-tevm-run'])
	})

	it('rejects a flag in the script position', () => {
		expect(() => parseArgs(['bun', 'tevm-run', '--watch', './s.ts'])).toThrow(TypeError)
	})

	it('throws if no script path is provided', () => {
		expect(() => parseArgs(['bunx', 'tevm-run'])).toThrow('No script path provided.')
		expect(() => parseArgs(['bunx', 'tevm-run', '--'])).toThrow('No script path provided.')
	})
})
