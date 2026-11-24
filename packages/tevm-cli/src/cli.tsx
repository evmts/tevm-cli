#!/usr/bin/env node
import { createRequire } from 'node:module'
import Pastel from 'pastel'
import { formatGlobalOptionsError, normalizeGlobalOptions } from './utils/global-options.js'

const packageJson = createRequire(import.meta.url)('../package.json') as { version: string }

const app = new Pastel({
	name: 'tevm',
	version: packageJson.version,
	description: 'Tevm CLI tool',
	importMeta: import.meta,
})

let argv: string[]
try {
	argv = normalizeGlobalOptions(process.argv).argv
} catch (error) {
	const { stream, text } = formatGlobalOptionsError(process.argv, error)
	process[stream].write(text)
	process.exit(1)
}
await app.run(argv)
