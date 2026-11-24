import { describe, expect, it } from 'bun:test'
import { resolveConfigPath } from './configPath.js'
import { runArgs } from './runArgs.js'

describe(runArgs.name, () => {
	it('builds the bun arguments with the resolved config and forwards positionals verbatim', () => {
		expect(runArgs('./s.ts', ['a', 'b c', '--flag'])).toEqual([
			'run',
			`--config=${resolveConfigPath()}`,
			'--install=fallback',
			'./s.ts',
			'a',
			'b c',
			'--flag',
		])
	})
})
