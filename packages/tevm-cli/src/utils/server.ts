import {
	createServer as createHttpServer,
	type Server as HttpServer,
	type IncomingMessage,
	type ServerResponse,
} from 'node:http'
import {
	anvil,
	arbitrum,
	arbitrumSepolia,
	avalanche,
	base,
	blast,
	bsc,
	gnosis,
	mainnet,
	moonbeam,
	optimism,
	optimismGoerli,
	optimismSepolia,
	polygon,
	scroll,
	sepolia,
	tevmDefault,
	zksync,
} from '@tevm/common'
import { http } from '@tevm/jsonrpc'
import { createMemoryClient, type MemoryClient } from '@tevm/memory-client'
import type { BlockTag } from '@tevm/utils'
import { createLoggingRequestProxy } from '../stores/logStore.js'

const blockTags = new Set<BlockTag>(['earliest', 'finalized', 'latest', 'pending', 'safe'])
const maxRequestBodySize = 1024 * 1024

type JsonRpcRequest = {
	jsonrpc?: '2.0'
	id?: string | number | null
	method: string
	params?: unknown
}

const writeJson = (response: ServerResponse, status: number, value: unknown) => {
	response.writeHead(status, { 'Content-Type': 'application/json' })
	response.end(JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? item.toString() : item)))
}

const readRequestBody = (request: IncomingMessage) =>
	new Promise<string>((resolve, reject) => {
		let body = ''
		request.setEncoding('utf8')
		request.on('data', (chunk: string) => {
			body += chunk
			if (Buffer.byteLength(body, 'utf8') > maxRequestBodySize) {
				reject(new Error('Request body exceeds 1 MiB'))
				request.destroy()
			}
		})
		request.on('end', () => resolve(body))
		request.on('error', reject)
	})

const isJsonRpcRequest = (value: unknown): value is JsonRpcRequest =>
	typeof value === 'object' &&
	value !== null &&
	'method' in value &&
	typeof (value as { method?: unknown }).method === 'string'

const handleJsonRpcRequest = async (client: MemoryClient, request: JsonRpcRequest) => {
	try {
		const result = await client.request({
			method: request.method as any,
			...(request.params === undefined ? {} : { params: request.params as any }),
		})
		return {
			jsonrpc: '2.0' as const,
			...(request.id === undefined ? {} : { id: request.id }),
			method: request.method,
			result,
		}
	} catch (error) {
		const code =
			typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'number'
				? error.code
				: -32603
		return {
			jsonrpc: '2.0' as const,
			...(request.id === undefined ? {} : { id: request.id }),
			method: request.method,
			error: {
				code,
				message: error instanceof Error ? error.message : String(error),
			},
		}
	}
}

const createJsonRpcServer = (client: MemoryClient) =>
	createHttpServer(async (request, response) => {
		if (request.method !== 'POST') {
			response.writeHead(405, { Allow: 'POST' })
			response.end()
			return
		}

		try {
			const parsed = JSON.parse(await readRequestBody(request)) as unknown
			if (Array.isArray(parsed)) {
				if (parsed.length === 0 || !parsed.every(isJsonRpcRequest)) {
					writeJson(response, 400, {
						jsonrpc: '2.0',
						id: null,
						method: 'unknown',
						error: { code: -32600, message: 'Invalid Request' },
					})
					return
				}
				const results = await Promise.all(parsed.map((item) => handleJsonRpcRequest(client, item)))
				const responses = results.filter((_, index) => parsed[index]?.id !== undefined)
				if (responses.length === 0) {
					response.writeHead(204)
					response.end()
					return
				}
				writeJson(response, 200, responses)
				return
			}
			if (!isJsonRpcRequest(parsed)) {
				writeJson(response, 400, {
					jsonrpc: '2.0',
					id: null,
					method: 'unknown',
					error: { code: -32600, message: 'Invalid Request' },
				})
				return
			}

			const result = await handleJsonRpcRequest(client, parsed)
			if (parsed.id === undefined) {
				response.writeHead(204)
				response.end()
				return
			}
			writeJson(response, 'error' in result ? 400 : 200, result)
		} catch (error) {
			writeJson(response, 400, {
				jsonrpc: '2.0',
				id: null,
				method: 'unknown',
				error: {
					code: error instanceof SyntaxError ? -32700 : -32603,
					message: error instanceof Error ? error.message : String(error),
				},
			})
		}
	})

const parseForkBlock = (forkBlockNumber: string): bigint | BlockTag => {
	try {
		return BigInt(forkBlockNumber)
	} catch (_e) {
		if (blockTags.has(forkBlockNumber as BlockTag)) {
			return forkBlockNumber as BlockTag
		}
		throw new Error(`Invalid fork block number or tag: ${forkBlockNumber}`)
	}
}

export async function initializeServer({
	port,
	host,
	chainId,
	verbose,
	fork,
	forkBlockNumber,
	loggingLevel,
}: {
	port: number
	host: string
	chainId: string
	fork?: string
	forkBlockNumber: string
	loggingLevel: string
	verbose: boolean
}): Promise<{ client: MemoryClient; server: HttpServer }> {
	const chains: Record<number, any> = {
		[base.id]: base,
		[mainnet.id]: mainnet,
		[optimism.id]: optimism,
		[tevmDefault.id]: tevmDefault,
		[optimismSepolia.id]: optimismSepolia,
		[optimismGoerli.id]: optimismGoerli,
		[sepolia.id]: sepolia,
		[arbitrum.id]: arbitrum,
		[arbitrumSepolia.id]: arbitrumSepolia,
		[avalanche.id]: avalanche,
		[bsc.id]: bsc,
		[polygon.id]: polygon,
		[zksync.id]: zksync,
		[gnosis.id]: gnosis,
		[moonbeam.id]: moonbeam,
		[anvil.id]: anvil,
		[blast.id]: blast,
		[scroll.id]: scroll,
	}

	const chain = chains[parseInt(chainId, 10)]

	if (!chain) {
		throw new Error(
			`Unknown chain id: ${chainId}. Valid chain ids are ${Object.entries(chains)
				.map(([id, chain]) => `${id} (${chain.name})`)
				.join(', ')}`,
		)
	}

	const client = createMemoryClient({
		common: chain,
		loggingLevel: loggingLevel as any,
		...(fork?.length
			? { fork: { transport: http(fork), ...(forkBlockNumber ? { blockTag: parseForkBlock(forkBlockNumber) } : {}) } }
			: {}),
	}) as unknown as MemoryClient

	// Add request logging if verbose mode is enabled
	if (verbose) {
		// Create a proxy around the request function
		const originalRequest = client.request
		client.request = createLoggingRequestProxy(originalRequest, verbose)
	}

	// Create and start the server
	const server = createJsonRpcServer(client)

	// Handle graceful shutdown
	const handleShutdown = () => {
		server.close()
		process.exit(0)
	}

	process.on('SIGINT', handleShutdown)
	process.on('SIGTERM', handleShutdown)

	await new Promise<void>((resolve) => {
		server.listen(port, host, () => {
			resolve()
		})
	})

	// Return the client and server for use by action components
	return { client, server }
}
