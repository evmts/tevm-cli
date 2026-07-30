# tevm-run

Run TypeScript scripts with Bun and import Solidity contracts directly. `tevm-run`
preloads the Tevm Bun plugin, so a script can use a typed `.s.sol` import without a
separate compile or code-generation step.

## Install

`tevm-run` requires Bun 1 or newer. Install it globally:

```sh
bun add --global tevm-run
```

Or run it without a global install:

```sh
bunx tevm-run ./script.ts
```

## Example

```solidity
// Counter.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public number = 42;
}
```

```ts
// script.ts
import { createMemoryClient } from 'tevm'
import { Counter } from './Counter.s.sol'

const client = createMemoryClient()
const { createdAddress } = await client.tevmDeploy(Counter.deploy())
await client.tevmMine()

const counter = Counter.withAddress(createdAddress!)
console.log(await client.readContract(counter.read.number()))
```

```sh
bunx tevm-run ./script.ts
```

Arguments after the script path are forwarded unchanged:

```sh
bunx tevm-run ./script.ts --network optimism
```

The package also exports `run`, `parseArgs`, `resolveConfigPath`,
`configPath`, and `argsSchema` for programmatic use.

## Documentation

See the [tevm-run guide](https://cli.tevm.sh/guides/tevm-run) and
[API reference](https://cli.tevm.sh/run/api) for complete examples.

## License

MIT
