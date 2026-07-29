import { defineConfig } from 'vocs/config'

/**
 * Vocs 2.x configuration for the Tevm CLI documentation site.
 *
 * Migrated from the Vocs 1.x config used by `docs/node` in the Tevm monorepo.
 * Notable 1.x -> 2.x differences applied here:
 * - `theme.accentColor` / `theme.colorScheme` moved to top-level `accentColor` / `colorScheme`,
 *   and `accentColor` takes a CSS `light-dark()` value instead of a `{ light, dark }` object.
 * - The `font` option was removed.
 * - Pages resolve from `rootDir/srcDir/pagesDir`; `srcDir` defaults to `src`, so it is set
 *   to `.` here to keep the familiar `docs/pages` layout.
 * - `defineConfig` moved from the `vocs` root export to `vocs/config`.
 * - `renderStrategy` was added and defaults to `dynamic`; static hosting needs `full-static`.
 */
export default defineConfig({
	title: 'Tevm CLI',
	titleTemplate: '%s · Tevm CLI',
	description: 'The Tevm command-line interface and the tevm-run script runner',
	baseUrl: process.env['VERCEL_ENV'] === 'production' ? 'https://cli.tevm.sh' : process.env['VERCEL_URL'],
	rootDir: '.',
	srcDir: '.',
	renderStrategy: 'full-static',
	logoUrl: {
		light: '/tevm-logo-light.png',
		dark: '/tevm-logo-dark.png',
	},
	iconUrl: '/tevm-logo.webp',
	ogImageUrl: 'https://vocs.dev/api/og?logo=%logo&title=%title&description=%description',
	accentColor: 'light-dark(#0085FF, #4DA6FF)',
	colorScheme: 'light dark',
	editLink: {
		pattern: 'https://github.com/evmts/tevm-cli/edit/main/docs/pages/:path',
		text: 'Edit on GitHub',
	},
	socials: [{ icon: 'github', link: 'https://github.com/evmts/tevm-cli' }],
	topNav: [
		{ text: 'Getting started', link: '/getting-started', match: '/getting-started' },
		{ text: 'Guides', link: '/guides/sessions', match: '/guides' },
		{ text: 'CLI reference', link: '/cli', match: '/cli' },
		{ text: 'tevm-run', link: '/run', match: '/run' },
		{ text: 'Playground', link: '/playground', match: '/playground' },
		{
			text: 'Tevm docs',
			items: [
				{ text: 'Tevm', link: 'https://tevm.sh' },
				{ text: 'Contract', link: 'https://contract.tevm.sh' },
				{ text: 'Utils', link: 'https://utils.tevm.sh' },
				{ text: 'Logger', link: 'https://logger.tevm.sh' },
				{ text: 'Test', link: 'https://test.tevm.sh' },
				{ text: 'Ethers', link: 'https://ethers.tevm.sh' },
				{ text: 'Mud', link: 'https://mud.tevm.sh' },
				{ text: 'CLI', link: 'https://cli.tevm.sh' },
				{ text: 'Bundler', link: 'https://bundler.tevm.sh' },
				{ text: 'Examples', link: 'https://examples.tevm.sh' },
			],
		},
	],
	sidebar: [
		{
			text: 'Introduction',
			collapsed: false,
			items: [
				{ text: 'What is the Tevm CLI?', link: '/' },
				{ text: 'Getting started', link: '/getting-started' },
				{ text: 'Terminal playground', link: '/playground' },
				{ text: 'How this repo relates to Tevm', link: '/ecosystem' },
			],
		},
		{
			text: 'Guides',
			collapsed: false,
			items: [
				{ text: 'Sessions and forks', link: '/guides/sessions' },
				{ text: 'Scripting with JSON output', link: '/guides/json-output' },
				{ text: 'Solidity: compile, deploy, call', link: '/guides/solidity' },
				{ text: 'Running a local JSON-RPC server', link: '/guides/serve' },
				{ text: 'Scripting with tevm-run', link: '/guides/tevm-run' },
			],
		},
		{
			text: 'tevm-run',
			collapsed: false,
			items: [
				{ text: 'Overview', link: '/run' },
				{ text: 'API reference', link: '/run/api' },
			],
		},
		{
			text: 'CLI reference',
			collapsed: false,
			items: [
				{ text: 'Overview', link: '/cli' },
				{ text: 'tevm session', link: '/cli/session' },
				{ text: 'tevm serve', link: '/cli/serve' },
				{ text: 'tevm call', link: '/cli/call' },
				{ text: 'tevm contract', link: '/cli/contract' },
				{ text: 'tevm read-contract', link: '/cli/read-contract' },
				{ text: 'tevm multicall', link: '/cli/multicall' },
				{ text: 'tevm deploy', link: '/cli/deploy' },
				{ text: 'tevm compile', link: '/cli/compile' },
				{ text: 'tevm sol', link: '/cli/sol' },
				{ text: 'tevm mine', link: '/cli/mine' },
				{ text: 'tevm estimate-gas', link: '/cli/estimate-gas' },
				{ text: 'tevm estimate-fees-per-gas', link: '/cli/estimate-fees-per-gas' },
				{ text: 'tevm get-account', link: '/cli/get-account' },
				{ text: 'tevm get-balance', link: '/cli/get-balance' },
				{ text: 'tevm get-block', link: '/cli/get-block' },
				{ text: 'tevm get-block-number', link: '/cli/get-block-number' },
				{ text: 'tevm get-bytecode', link: '/cli/get-bytecode' },
				{ text: 'tevm get-chain-id', link: '/cli/get-chain-id' },
				{ text: 'tevm get-gas-price', link: '/cli/get-gas-price' },
				{ text: 'tevm get-storage-at', link: '/cli/get-storage-at' },
				{ text: 'tevm get-transaction', link: '/cli/get-transaction' },
				{ text: 'tevm get-ens-address', link: '/cli/get-ens-address' },
				{ text: 'tevm get-ens-name', link: '/cli/get-ens-name' },
				{ text: 'tevm get-ens-text', link: '/cli/get-ens-text' },
				{ text: 'tevm set-account', link: '/cli/set-account' },
				{ text: 'tevm set-code', link: '/cli/set-code' },
				{ text: 'tevm set-nonce', link: '/cli/set-nonce' },
				{ text: 'tevm set-storage-at', link: '/cli/set-storage-at' },
				{ text: 'tevm dump-state', link: '/cli/dump-state' },
				{ text: 'tevm load-state', link: '/cli/load-state' },
				{ text: 'tevm create-block-filter', link: '/cli/create-block-filter' },
				{ text: 'tevm create-event-filter', link: '/cli/create-event-filter' },
				{
					text: 'tevm create-contract-event-filter',
					link: '/cli/create-contract-event-filter',
				},
				{ text: 'tevm action create-access-list', link: '/cli/create-access-list' },
				{ text: 'tevm action send-raw-transaction', link: '/cli/send-raw-transaction' },
				{ text: 'tevm action simulate-calls', link: '/cli/simulate-calls' },
			],
		},
	],
})
