import { describe, expect, it } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// End-to-end tests: spawn the real `tevm-run` binary the way a user's shell would.

const processTimeout = 60_000
const sourceDirectory = dirname(fileURLToPath(import.meta.url))
const packageDirectory = dirname(sourceDirectory)
const binary = join(sourceDirectory, 'tevm-run.js')

async function tevmRun(args: string[], cwd = packageDirectory) {
	const proc = Bun.spawn(['bun', binary, ...args], { cwd, env: { ...process.env }, stdout: 'pipe', stderr: 'pipe' })
	// Compiling the Solidity fixture can take tens of seconds from a cold
	// dependency/compiler cache, especially on shared CI runners.
	const timeoutId = setTimeout(() => proc.kill(), processTimeout)
	try {
		const exitCode = await proc.exited
		const stdout = await new Response(proc.stdout).text()
		const stderr = await new Response(proc.stderr).text()
		return { exitCode, stdout, stderr }
	} finally {
		clearTimeout(timeoutId)
		proc.kill()
	}
}

describe('tevm-run binary', () => {
	it(
		'runs a script that imports Solidity and logs only the script path',
		async () => {
			const { exitCode, stdout, stderr } = await tevmRun(['./example/example.ts'])
			expect(exitCode, stderr).toBe(0)
			expect(stdout.split('\n').filter((line) => line.startsWith('[tevm-run]'))).toEqual([
				'[tevm-run] ./example/example.ts',
			])
			expect(stdout).toInclude('success')
			expect(stdout.toLowerCase()).toInclude('address:  0x5fbdb2315678afecb367f032d93f642f64180aa3')
			expect(stdout).toInclude('SimpleContract.get():  20n')
		},
		processTimeout + 5_000,
	)

	it(
		'works from any working directory and forwards flags verbatim',
		async () => {
			const cwd = mkdtempSync(join(tmpdir(), 'tevm-run-e2e-'))
			const script = join(packageDirectory, 'example', 'args.ts')
			const { exitCode, stdout, stderr } = await tevmRun([script, '--network', 'optimism', '-v', 'two words'], cwd)
			expect(exitCode, stderr).toBe(0)
			expect(stderr).not.toInclude('preload not found')
			expect(JSON.parse(stdout.trim().split('\n').at(-1) ?? '')).toEqual(['--network', 'optimism', '-v', 'two words'])
		},
		processTimeout + 5_000,
	)

	it(
		'exits non-zero and surfaces script output when the script fails',
		async () => {
			const { exitCode, stdout, stderr } = await tevmRun(['./example/fail.ts'])
			expect(exitCode).toBe(1)
			expect(stdout).toInclude('about to fail')
			expect(stderr).toInclude('Failed with code 3')
			expect(stderr).toInclude('intentional failure')
		},
		processTimeout + 5_000,
	)

	it(
		'prints usage and exits non-zero without a script path',
		async () => {
			const { exitCode, stderr } = await tevmRun([])
			expect(exitCode).toBe(1)
			expect(stderr).toInclude('Usage: tevm-run <scriptPath> [positionals...]')
		},
		processTimeout + 5_000,
	)
})
