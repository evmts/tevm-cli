'use client'

import { useState } from 'react'
import { AnimatedTerminal, type TerminalStep } from './AnimatedTerminal'

type CommandDemo = {
	description: string
	script: TerminalStep[]
}

const COMMANDS: Record<string, CommandDemo> = {
	call: {
		description: 'Execute an eth_call against a fork or a saved session — no wallet, no gas.',
		script: [
			{
				command: 'tevm call --to 0xA0b8…eB48 --data 0x70a08231 --session mainnet --json',
				output: [
					{ text: '⛏ Loading session "mainnet"…', tone: 'dim' },
					{ text: '{ "ok": true, "result": { "data": "0x0000…0de0b6b3a7640000" } }' },
					{ text: '✓ balanceOf → 1.0 ETH (1 call, 0.8ms)', tone: 'success' },
				],
			},
		],
	},
	deploy: {
		description: 'Deploy bytecode to the session chain and persist the deployed contract.',
		script: [
			{
				command: 'tevm deploy --bytecode 0x6080604052… --session mainnet',
				output: [
					{ text: 'Contract deployed', tone: 'dim' },
					{ text: '  address    0x5FbDB2315678afecb367f032d93F642f64180aa3' },
					{ text: '  gasUsed    272,104' },
					{ text: '✓ bytecode persisted to session state', tone: 'success' },
				],
			},
		],
	},
	mine: {
		description: 'Mine blocks on demand — a Tevm chain only advances when you say so.',
		script: [
			{
				command: 'tevm mine --blocks 5 --session mainnet',
				output: [
					{ text: '⛏ Mining 5 blocks…', tone: 'dim' },
					{ text: '  #1 0x9c1e…4bd7   #2 0x77aa…01fe   #3 0x30bd…c812' },
					{ text: '  #4 0xbe99…55a0   #5 0x04de…93bc' },
					{ text: '✓ blockNumber advanced by 5', tone: 'success' },
				],
			},
		],
	},
	'set-account': {
		description: 'Patch any account — balances, nonces, code — without impersonation hacks.',
		script: [
			{
				command: 'tevm set-account --address 0xf39F…2266 --balance 1000ether --session mainnet',
				output: [
					{ text: 'Account 0xf39F…2266 updated', tone: 'dim' },
					{ text: '  balance  1000000000000000000000n wei' },
					{ text: '✓ state patched and saved to the session', tone: 'success' },
				],
			},
		],
	},
	'dump-state': {
		description: 'Serialize the entire chain state so you can reload the exact same world later.',
		script: [
			{
				command: 'tevm dump-state --session mainnet --out state.json',
				output: [
					{ text: 'Serializing accounts, storage and code…', tone: 'dim' },
					{ text: '✓ wrote state.json (14 accounts, 212 storage slots)', tone: 'success' },
					{ text: 'Restore it any time with: tevm load-state --in state.json', tone: 'dim' },
				],
			},
		],
	},
	serve: {
		description: 'Expose the session chain over JSON-RPC so any wallet or viem client can connect.',
		script: [
			{
				command: 'tevm serve --port 8545 --session mainnet',
				output: [
					{ text: 'Tevm JSON-RPC server listening', tone: 'dim' },
					{ text: '  http     http://localhost:8545' },
					{ text: '  session  mainnet (forked)' },
					{ text: '✓ ready — point your wallet at it', tone: 'success' },
				],
			},
		],
	},
	'tevm-run': {
		description: 'Execute a TypeScript file with the Tevm Solidity bundler already wired in.',
		script: [
			{
				command: 'tevm-run ./examples/transfer.ts',
				output: [
					{ text: 'Running ./examples/transfer.ts with the Tevm bundler wired in…', tone: 'dim' },
					{ text: 'imported Counter.sol directly — no compile step' },
					{ text: 'balance after: 9999999999999000000n' },
					{ text: '✓ script finished in 41ms', tone: 'success' },
				],
			},
		],
	},
}

const NAMES = Object.keys(COMMANDS)

export function CommandExplorer() {
	const [active, setActive] = useState<string>('call')
	const demo = COMMANDS[active] ?? COMMANDS['call']

	return (
		<div className="tevm-playground">
			<div className="tevm-command-grid">
				{NAMES.map((name) => (
					<button
						key={name}
						type="button"
						className="tevm-command-chip"
						data-active={name === active}
						onClick={() => setActive(name)}
					>
						{name}
					</button>
				))}
			</div>
			{demo && (
				<>
					<p className="tevm-command-desc">{demo.description}</p>
					<AnimatedTerminal key={active} script={demo.script} title={`tevm ${active}`} loop={false} />
				</>
			)}
		</div>
	)
}
