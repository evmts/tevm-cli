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

## Releases

Changesets describe version changes. Merges to `main` create or update a
release pull request; merging that release pull request publishes public npm
packages with provenance through GitHub Actions.

Package documentation is hosted at [cli.tevm.sh](https://cli.tevm.sh/). The
umbrella TEVM documentation remains at [tevm.sh](https://tevm.sh/).

## License

MIT
