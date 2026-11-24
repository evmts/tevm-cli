# TEVM CLI

This repository contains the app-shaped command-line tools for
[TEVM](https://tevm.sh/):

- [`@tevm/cli`](./packages/tevm-cli) provides the `tevm` binary and its
  Ink-powered interactive interface.
- [`tevm-run`](./packages/tevm-run) provides a Bun-based runner for TEVM
  scripts.

The packages were extracted from
[`evmts/tevm-monorepo`](https://github.com/evmts/tevm-monorepo) with their
Git history intact. Core TEVM packages remain independently published npm
dependencies, so this repository can be versioned and released on its own.

## Install

Install the main CLI globally:

```sh
npm install --global @tevm/cli
tevm --help
```

Run a TEVM TypeScript script with Bun:

```sh
npm install --global tevm-run
tevm-run ./script.ts
```

You can also run either tool without a global install:

```sh
pnpm dlx @tevm/cli --help
bunx tevm-run ./script.ts
```

## Development

This workspace uses Node 24 and pnpm 9.

```sh
nvm use
corepack enable
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

`tevm-run` itself executes and tests scripts with Bun, so Bun must also be
installed when working on that package.

### Test suites

| Suite | Command | What it covers |
| --- | --- | --- |
| Unit + e2e | `pnpm test` | Both packages. `tevm-cli` builds first, then spawns the real `tevm` binary (`src/tests/`); `tevm-run` spawns the real `tevm-run` binary (`src/tevm-run.spec.ts`). |
| CLI e2e only | `pnpm --filter @tevm/cli test:e2e` | `--help`, `--version`, unknown commands, missing `--session` names, bad sessions, plus full session, deploy, and `serve` flows. |
| Fuzz | `pnpm --filter @tevm/cli test:fuzz`, `pnpm --filter tevm-run test:fuzz` | fast-check properties for global-option parsing, session names, block numbers, and `tevm-run` argv forwarding at 5000 runs. The default `pnpm test` runs them at 500. |
| Bench | `pnpm --filter @tevm/cli bench`, `pnpm --filter tevm-run bench` | Vitest benchmarks for argument parsing, session helpers, and JSON output. |

Tests that need a live fork RPC read `TEVM_RPC_URLS_MAINNET` and
`TEVM_RPC_URLS_OPTIMISM`. Locally they fall back to public RPCs; in CI they skip
when those secrets are absent.

## Documentation

The documentation site lives in [`docs/`](./docs) and is built with
[Vocs](https://vocs.dev) 2.x.

```sh
pnpm docs        # dev server
pnpm docs:build  # static build to docs/dist/public
pnpm docs:preview
```

It deploys to [cli.tevm.sh](https://cli.tevm.sh/) on Vercel from `main`. The deploy job
needs the `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets; without them it
skips with a notice and stays green.

## Releases

Changesets describe version changes. Merges to `main` create or update a
release pull request; merging that release pull request publishes public npm
packages with provenance through GitHub Actions.

Package documentation is hosted at [cli.tevm.sh](https://cli.tevm.sh/). The
umbrella TEVM documentation remains at [tevm.sh](https://tevm.sh/).

## License

MIT
