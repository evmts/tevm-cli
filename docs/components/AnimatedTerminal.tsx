'use client'

import { useEffect, useState } from 'react'

export type OutputLine = {
	text: string
	tone?: 'default' | 'success' | 'error' | 'dim'
}

export type TerminalStep = {
	command: string
	output: OutputLine[]
}

type RenderedStep = {
	command: string
	typed: number
	revealed: number
	done: boolean
}

const TYPE_MS = 42
const LINE_MS = 170
const STEP_PAUSE_MS = 1500
const RESTART_PAUSE_MS = 3200

function sleep(ms: number, cancelled: () => boolean) {
	return new Promise<boolean>((resolve) => {
		setTimeout(() => resolve(!cancelled()), ms)
	})
}

export function AnimatedTerminal({
	script,
	title = 'tevm — terminal',
	loop = true,
}: {
	script: TerminalStep[]
	title?: string
	loop?: boolean
}) {
	const [steps, setSteps] = useState<RenderedStep[]>([])

	useEffect(() => {
		let cancelled = false
		const isCancelled = () => cancelled

		const run = async () => {
			for (;;) {
				setSteps([])
				for (let s = 0; s < script.length; s++) {
					const step = script[s]
					if (!step) return
					setSteps((prev) => [...prev, { command: step.command, typed: 0, revealed: 0, done: false }])

					for (let c = 1; c <= step.command.length; c++) {
						if (!(await sleep(TYPE_MS, isCancelled))) return
						setSteps((prev) => prev.map((p, i) => (i === s ? { ...p, typed: c } : p)))
					}

					for (let l = 1; l <= step.output.length; l++) {
						if (!(await sleep(LINE_MS, isCancelled))) return
						setSteps((prev) => prev.map((p, i) => (i === s ? { ...p, revealed: l } : p)))
					}

					setSteps((prev) => prev.map((p, i) => (i === s ? { ...p, done: true } : p)))
					if (!(await sleep(STEP_PAUSE_MS, isCancelled))) return
				}
				if (!loop) return
				if (!(await sleep(RESTART_PAUSE_MS, isCancelled))) return
			}
		}

		run()
		return () => {
			cancelled = true
		}
	}, [script, loop])

	return (
		<div className="tevm-terminal">
			<div className="tevm-terminal-titlebar">
				<span className="tevm-terminal-dot" />
				<span className="tevm-terminal-dot" />
				<span className="tevm-terminal-dot" />
				<span className="tevm-terminal-title">{title}</span>
			</div>
			<div className="tevm-terminal-body">
				{steps.map((step, i) => (
					<TerminalStepView key={`${i}-${step.command}`} step={step} script={script[i]} />
				))}
				<span className="tevm-term-line">
					<span className="tevm-term-prompt">$</span> <span className="tevm-term-cursor" />
				</span>
			</div>
		</div>
	)
}

function TerminalStepView({ step, script }: { step: RenderedStep; script: TerminalStep | undefined }) {
	return (
		<>
			<span className="tevm-term-line">
				<span className="tevm-term-prompt">$</span> <CommandText text={step.command.slice(0, step.typed)} />
			</span>
			{script?.output.slice(0, step.revealed).map((line, i) => (
				<span key={`${i}-${line.text}`} className={`tevm-term-line tevm-term-${line.tone ?? 'default'}`}>
					{line.text}
				</span>
			))}
		</>
	)
}

function CommandText({ text }: { text: string }) {
	const tokens = text.split(/(\s+)/)
	return (
		<>
			{tokens.map((tok, i) => {
				if (tok === '' || /^\s+$/.test(tok)) return <span key={i}>{tok}</span>
				let cls = 'tevm-term-command'
				if (tok.startsWith('--')) cls = 'tevm-term-flag'
				else if (/^0x[0-9a-fA-F]*$/.test(tok) || tok.startsWith('http') || tok.endsWith('.ts')) cls = 'tevm-term-string'
				return (
					<span key={i} className={cls}>
						{tok}
					</span>
				)
			})}
		</>
	)
}
