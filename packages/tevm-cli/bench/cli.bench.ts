import { bench, describe } from 'vitest'
import { generateRandomName } from '../src/utils/generateRandomName.js'
import { normalizeGlobalOptions } from '../src/utils/global-options.js'
import { formatJsonSuccess } from '../src/utils/output.js'
import { getSessionPath, parseSessionBlockNumber } from '../src/utils/session.js'

const benchOpts = { time: 200, warmupTime: 50, warmupIterations: 5, throws: true }
const argv = [
	'node',
	'tevm',
	'call',
	'--to',
	'0x4200000000000000000000000000000000000006',
	'--json',
	'--session=demo',
	'--run',
]
const result = { rawData: '0x01', executionGasUsed: 21000n, logs: [] }

describe('@tevm/cli', () => {
	bench(
		'normalizeGlobalOptions (call with --json --session)',
		() => {
			if (normalizeGlobalOptions(argv).session !== 'demo') throw new Error('unexpected')
		},
		benchOpts,
	)

	bench(
		'getSessionPath + parseSessionBlockNumber',
		() => {
			getSessionPath('optimism', '/tmp/sessions')
			if (parseSessionBlockNumber('123456789', 'blockNumber') !== 123456789n) throw new Error('unexpected')
		},
		benchOpts,
	)

	bench(
		'formatJson (bigint result envelope)',
		() => {
			if (!formatJsonSuccess('call', result, 'demo').includes('21000')) throw new Error('unexpected')
		},
		benchOpts,
	)

	bench(
		'generateRandomName()',
		() => {
			if (!generateRandomName()) throw new Error('unexpected')
		},
		benchOpts,
	)
})
