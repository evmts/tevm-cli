import { describe, expect, it, spyOn } from 'bun:test'
import { run } from './run.js'

describe(run.name, () => {
	it('runs a script and returns its output', async () => {
		expect((await run(['./example/vanilla.ts'])).text()).toBe('success\n')
	})

	it('forwards arguments verbatim, including flags and spaces', async () => {
		const result = await run(['./example/args.ts', '--network', 'optimism', 'two words'])
		expect(JSON.parse(result.text())).toEqual(['--network', 'optimism', 'two words'])
	})

	it('logs only the script path, never forwarded arguments', async () => {
		const log = spyOn(console, 'log')
		try {
			await run(['./example/vanilla.ts', 'private-key-0xdeadbeef'])
			expect(log.mock.calls).toEqual([['[tevm-run] ./example/vanilla.ts']])
		} finally {
			log.mockRestore()
		}
	})

	it('echoes captured output and throws with the shell error as cause on a non-zero exit', async () => {
		const log = spyOn(console, 'log').mockImplementation(() => {})
		const errorLog = spyOn(console, 'error').mockImplementation(() => {})
		try {
			const error = await run(['./example/fail.ts']).catch((err) => err)
			expect(error).toBeInstanceOf(Error)
			expect(error.message).toStartWith('Error executing the script:')
			expect(error.cause).toMatchObject({ exitCode: 3 })
			expect(errorLog.mock.calls).toContainEqual(['Failed with code 3'])
			expect(log.mock.calls.flat().join('\n')).toContain('about to fail')
		} finally {
			log.mockRestore()
			errorLog.mockRestore()
		}
	})
})
