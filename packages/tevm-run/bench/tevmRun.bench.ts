import { bench, describe } from 'vitest'
import { parseArgs } from '../src/parseArgs.js'

const benchOpts = { time: 200, warmupTime: 50, warmupIterations: 5, throws: true }
const shortArgs = ['bun', '/usr/local/bin/tevm-run', './scripts/deploy.ts']
const longArgs = [...shortArgs, ...Array.from({ length: 64 }, (_, index) => `--flag-${index}=value-${index}`)]

describe('tevm-run', () => {
	bench(
		'parseArgs (script only)',
		() => {
			if (parseArgs(shortArgs).positionals[0] !== './scripts/deploy.ts') throw new Error('unexpected')
		},
		benchOpts,
	)

	bench(
		'parseArgs (script + 64 forwarded flags)',
		() => {
			if (parseArgs(longArgs).positionals.length !== 65) throw new Error('unexpected')
		},
		benchOpts,
	)
})
