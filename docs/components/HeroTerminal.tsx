import { AnimatedTerminal, type TerminalStep } from './AnimatedTerminal'

const HERO_SCRIPT: TerminalStep[] = [
	{
		command: 'tevm session mainnet --fork https://mainnet.optimism.io --json',
		output: [
			{ text: '⛏ Forking OP mainnet at the latest block…', tone: 'dim' },
			{ text: '{ "ok": true, "command": "session", "result": { "name": "mainnet" } }' },
			{ text: '✓ session "mainnet" saved', tone: 'success' },
		],
	},
	{
		command: 'tevm get-balance --address vitalik.eth --session mainnet --json',
		output: [
			{ text: '{ "ok": true, "result": { "balance": "5803240618437227255" } }' },
			{ text: '✓ resolved via ENS against the fork', tone: 'success' },
		],
	},
	{
		command: 'tevm-run ./examples/transfer.ts',
		output: [
			{ text: 'Running ./examples/transfer.ts with the Tevm bundler wired in…', tone: 'dim' },
			{ text: 'balance before: 10000000000000000000n' },
			{ text: 'balance after:  9999999999999000000n' },
			{ text: '✓ script finished in 41ms', tone: 'success' },
		],
	},
]

export function HeroTerminal() {
	return <AnimatedTerminal script={HERO_SCRIPT} title="tevm — an EVM in your terminal" />
}
