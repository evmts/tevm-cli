import { render } from 'ink-testing-library'
import { expect, it } from 'vitest'
import Index from './src/commands/index.js'

it('renders the CLI welcome screen', () => {
	const { lastFrame } = render(<Index />)

	expect(lastFrame()).toContain('TEVM CLI')
	expect(lastFrame()).toContain('tevm --help')
})
