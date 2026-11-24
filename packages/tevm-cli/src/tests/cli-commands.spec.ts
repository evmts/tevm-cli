import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// End-to-end tests for the built `tevm` binary: help, version, and error paths.
// None of these touch the network, so they run in every environment.

const cliPath = fileURLToPath(new URL('../../dist/cli.js', import.meta.url))
const packageJson = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
	version: string
}

function tevm(args: string[], env: Record<string, string> = {}) {
	const result = spawnSync(process.execPath, [cliPath, ...args], {
		encoding: 'utf8',
		env: {
			...process.env,
			TEVM_JSON: 'false',
			TEVM_SESSION: '',
			TEVM_SESSION_DIR: mkdtempSync(path.join(tmpdir(), 'tevm-cli-e2e-')),
			...env,
		},
		timeout: 60_000,
	})
	if (result.error) throw result.error
	return { exitCode: result.status, stdout: result.stdout, stderr: result.stderr }
}

describe('tevm binary', () => {
	it('prints top-level help with global options and every command group', () => {
		const { exitCode, stdout } = tevm(['--help'])
		expect(exitCode).toBe(0)
		expect(stdout).toContain('Usage: tevm [options] [command]')
		expect(stdout).toContain('Global options: --json, --session <name>')
		for (const command of ['action', 'call', 'contract', 'deploy', 'session', 'serve', 'get-chain-id']) {
			expect(stdout).toMatch(new RegExp(`^  ${command}\\b`, 'm'))
		}
	})

	it('prints the package version', () => {
		const { exitCode, stdout } = tevm(['--version'])
		expect(exitCode).toBe(0)
		expect(stdout.trim()).toBe(packageJson.version)
	})

	it.each([
		['call', 'Usage: tevm call [options]'],
		['session', 'Usage: tevm session [options] <name>'],
		['serve', 'Usage: tevm serve [options]'],
	])('prints help for `%s`', (command, usage) => {
		const { exitCode, stdout } = tevm([command, '--help'])
		expect(exitCode).toBe(0)
		expect(stdout).toContain(usage)
	})

	it('prints help for a nested action command', () => {
		const { exitCode, stdout } = tevm(['action', 'get-balance', '--help'])
		expect(exitCode).toBe(0)
		expect(stdout).toContain('Usage: tevm action get-balance [options]')
		expect(stdout).toContain('--address')
	})

	it('rejects an unknown command', () => {
		const { exitCode, stderr } = tevm(['definitely-not-a-command'])
		expect(exitCode).toBe(1)
		expect(stderr).toContain('error:')
	})

	it('rejects `session` without a name', () => {
		const { exitCode, stderr } = tevm(['session'])
		expect(exitCode).toBe(1)
		expect(stderr).toContain("missing required argument 'name'")
	})

	it.each([[['call', '--session']], [['call', '--session=']], [['call', '--session', '--run']]])(
		'reports a missing --session name without a stack trace: %j',
		(args) => {
			const { exitCode, stdout, stderr } = tevm(args)
			expect(exitCode).toBe(1)
			expect(stdout).toBe('')
			expect(stderr).toBe('error: --session requires a name\n')
		},
	)

	it('reports a missing --session name as a JSON failure under --json', () => {
		const { exitCode, stdout } = tevm(['--json', 'get-chain-id', '--session'])
		expect(exitCode).toBe(1)
		expect(JSON.parse(stdout)).toEqual({
			ok: false,
			command: 'get-chain-id',
			error: { message: '--session requires a name' },
		})
	})

	it('reports an unknown session with the command to create it', () => {
		const { exitCode, stdout } = tevm(['get-chain-id', '--session', 'nosuch', '--json'])
		expect(exitCode).toBe(1)
		expect(JSON.parse(stdout)).toMatchObject({
			ok: false,
			command: 'get-chain-id',
			session: 'nosuch',
			error: { message: expect.stringContaining('tevm session nosuch --local') },
		})
	})

	it('rejects session names that could escape the session directory', () => {
		const { exitCode, stdout } = tevm(['get-chain-id', '--session', '../escape', '--json'])
		expect(exitCode).toBe(1)
		expect(JSON.parse(stdout).error.message).toContain('Session names may contain only')
	})

	it('reports an unreachable RPC as a JSON failure', () => {
		const { exitCode, stdout } = tevm(['get-chain-id', '--rpc', 'http://127.0.0.1:1', '--json'])
		expect(exitCode).toBe(1)
		expect(JSON.parse(stdout)).toMatchObject({ ok: false, command: 'get-chain-id' })
	})
})
