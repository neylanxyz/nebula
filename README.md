# Nebula — Privacy SDK for Web3 Games

Nebula is a TypeScript SDK + smart contract stack that brings **ZK-proof-based privacy** to on-chain prize pools. Players deposit into a shielded pool and winners withdraw anonymously — no one on-chain can link deposit to withdrawal.

Built on [Noir](https://noir-lang.org/) ZK circuits + [Poseidon](https://www.poseidon-hash.info/) hash, deployed on **Avalanche Fuji testnet**.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                        Monorepo                          │
│                                                          │
│  packages/                                               │
│    nebula              → Core SDK (chain-agnostic)       │
│    nebula-avalanche    → Avalanche Fuji adapter          │
│                                                          │
│  apps/                                                   │
│    game                → Next.js frontend (tournament UI)│
│    indexer             → Ponder indexer (event caching)  │
│                                                          │
│  contracts/                                              │
│    TournamentGame.sol  → Game + Factory contracts        │
└──────────────────────────────────────────────────────────┘
```

### Privacy Flow

```
Player 1 ──┐
Player 2 ──┼──[enter(0.5 AVAX)]──► TournamentGame
...        ─┘                            │
                                         │ resolveGameAndDeposit(commitment)
                                         ▼
                                 NebulaPrivatePool ◄── ZK Merkle Tree
                                   0x254d1290...         (on-chain)
                                         │
                              Winner withdraws with
                              ZK proof (note string)
                                         │
                                         ▼
                                  recipient address
                                  (anonymous)
```

---

## Contracts (Avalanche Fuji)

| Contract | Address |
|---|---|
| `NebulaPrivatePool` | `0x254d1290a8f977dc2babbbf979cc86a7ac4a83ca` |
| `TournamentGameFactory` | `0x457a153E3B49515CE39E4743D905Be1C70FE2AFb` |

### TournamentGame

Each game instance is deployed by the factory. Lifecycle:

1. **`enter()`** — Players send exactly `0.5 AVAX`. Max 2 players (pool fills at `1 AVAX = NEBULA_DENOM`).
2. **`resolveGameAndDeposit(bytes32 commitment)`** — Owner ends the game. Sends `1.1 AVAX` (denomination + fee) to Nebula pool with a ZK commitment. Only the holder of the matching note can withdraw later.
3. **`emergencyWithdraw()`** — Owner safety hatch.

```solidity
uint256 public constant ENTRY_FEE    = 0.5 ether;
uint256 public constant NEBULA_DENOM = 1 ether;
uint256 public constant NEBULA_FEE   = 0.1 ether;
uint256 public constant NEBULA_TOTAL = 1.1 ether;
```

### TournamentGameFactory

Deploys `TournamentGame` instances and keeps a registry.

```solidity
function createGame() external returns (address game);
function getGames() external view returns (address[] memory);
function gamesCount() external view returns (uint256);
```

---

## Packages

### `@neylanxyz/nebula` — Core SDK

Chain-agnostic. Handles note generation, ZK proof, Merkle tree.

**Install:**
```bash
pnpm add @neylanxyz/nebula
```

**Peer deps:**
```bash
pnpm add @aztec/bb.js @noir-lang/noir_js @noir-lang/acvm_js @noir-lang/noirc_abi viem
```

#### Main class: `Nebula`

```ts
import { Nebula } from '@neylanxyz/nebula';

const nebula = new Nebula({ rpcUrl: 'https://rpc.sepolia.mantle.xyz' });

// Deposit — returns note (save it!)
const { note, txHash, leafIndex } = await nebula.deposit(walletClient);

// Withdraw — ZK proof generated client-side
const { txHash } = await nebula.withdraw(note, recipientAddress, walletClient);

// Pool info
const { denomination, nextIndex, paused } = await nebula.getPoolInfo();

// Check if note was already spent
const spent = await nebula.isNoteSpent(note);
```

#### Low-level exports

```ts
import {
  createNote,        // Generate random { noteData, commitment }
  encodeNote,        // NoteData → base64 string
  decodeNote,        // base64 string → NoteData
  computeProofInputs,// Build Merkle tree + format ZK inputs
  generateProof,     // Run Noir circuit → { proof, publicInputs }
  getPoseidon,       // Get Poseidon BN254 singleton
  fieldToBytes32,    // Field element → 0x... bytes32
} from '@neylanxyz/nebula';
```

#### Types

```ts
interface NoteData {
  secret: bigint;
  nullifier: bigint;
  leafIndex: number;
}

interface DepositResult {
  note: string;          // base64 — MUST be saved by user
  txHash: Hash;
  commitment: `0x${string}`;
  leafIndex: number;
}

interface PoolInfo {
  denomination: bigint;
  currentRoot: `0x${string}`;
  nextIndex: number;
  protocolFee: bigint;
  maxLeaves: number;
  paused: boolean;
}

interface WithdrawOptions {
  onFetchProgress?: (progress: FetchProgress) => void;
  signal?: AbortSignal;
}
```

#### Errors

| Error | When |
|---|---|
| `InvalidNoteError` | Note string is corrupted or cannot be decoded |
| `CommitmentMismatchError` | Note's commitment doesn't match on-chain data at `leafIndex` |
| `InsufficientDepositsError` | Not enough deposits found to rebuild the Merkle tree |
| `ProofGenerationError` | Noir circuit proof generation failed |
| `AbortedError` | Operation cancelled via `AbortSignal` |

---

### `@neylanxyz/nebula-avalanche` — Avalanche Fuji Adapter

Wraps `@neylanxyz/nebula` with Avalanche Fuji defaults and indexer support.

**Install:**
```bash
pnpm add @neylanxyz/nebula-avalanche
```

```ts
import { NebulaAvalanche } from '@neylanxyz/nebula-avalanche';

const nebula = new NebulaAvalanche({
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  indexerUrl: 'http://localhost:42069', // optional — avoids eth_getLogs rate limits
});

// Deposit
const { note, txHash } = await nebula.deposit(walletClient);

// Withdraw (uses indexer when indexerUrl is set)
const { txHash } = await nebula.withdraw(note, recipient, walletClient, {
  onFetchProgress: ({ percentage }) => console.log(`${percentage}%`),
});

// Pool info, spent check, blacklist check
await nebula.getPoolInfo();
await nebula.isNoteSpent(note);
await nebula.isBlacklisted(address);
```

**Config:**
```ts
interface NebulaAvalancheConfig {
  rpcUrl: string;
  contractAddress?: Address;  // defaults to NebulaPrivatePool on Fuji
  startBlock?: bigint;        // defaults to deployment block 52499039
  verifierAddress?: Address;
  indexerUrl?: string;        // Ponder indexer URL for fast deposit fetching
}
```

> **Why `indexerUrl`?**
> Avalanche public RPC limits `eth_getLogs` to 2048 blocks per request. Scanning from block `52499039` would require hundreds of requests. The indexer caches all events and serves them via a single REST call.

---

## Apps

### `apps/indexer` — Ponder Event Indexer

Indexes `Deposit` and `Withdrawal` events from `NebulaPrivatePool`. Exposes a REST API consumed by the SDK during withdraw.

**Start:**
```bash
cp apps/indexer/.env.local.example apps/indexer/.env.local
# Set AVALANCHE_RPC_URL (Ankr recommended: https://rpc.ankr.com/avalanche_fuji)
pnpm --filter indexer dev
```

Runs on `http://localhost:42069` by default.

**Endpoints:**

| Endpoint | Description |
|---|---|
| `GET /deposits` | All deposits sorted by `leafIndex` |
| `GET /graphql` | GraphQL API |
| `GET /sql/*` | Direct SQL access |

**`GET /deposits` response:**
```json
{
  "deposits": [
    { "commitment": "0x051427...", "leafIndex": 0 },
    { "commitment": "0x0cbff0...", "leafIndex": 1 }
  ]
}
```

**Ponder config highlights:**
- Chain: Avalanche Fuji (`chainId: 43113`)
- `ethGetLogsBlockRange: 2048` — respects public RPC limits
- Start block: `52499039` (NebulaPrivatePool deployment)

---

### `apps/game` — Tournament Frontend (Next.js)

**Start:**
```bash
cp apps/game/.env.example apps/game/.env.local
# Fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# Set NEXT_PUBLIC_INDEXER_URL (default: http://localhost:42069)
pnpm --filter game dev
```

**Environment variables:**
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
NEXT_PUBLIC_INDEXER_URL=http://localhost:42069
```

**Key hooks:**

| Hook | Description |
|---|---|
| `useGameList()` | Reads all games from the factory |
| `useCreateGame()` | Calls `factory.createGame()` |
| `useGameState(gameAddress)` | Reads game state (players, balance, resolved) |
| `useEnterGame(gameAddress)` | Calls `game.enter()` with `0.5 AVAX` |
| `useResolveGame(gameAddress)` | Generates note + calls `resolveGameAndDeposit()` |
| `useWithdrawPrize()` | Full ZK withdraw flow via `NebulaAvalanche` |
| `useIsOwner(gameAddress)` | Checks if connected wallet is game owner |

---

## Running the Full Stack

```bash
# 1. Install dependencies
pnpm install

# 2. Build SDK packages
pnpm --filter @neylanxyz/nebula build
pnpm --filter @neylanxyz/nebula-avalanche build

# 3. Start the indexer (terminal 1)
pnpm --filter indexer dev

# 4. Start the game frontend (terminal 2)
pnpm --filter game dev
```

Make sure the indexer fully syncs before attempting a withdraw — check the Ponder logs for "Indexed to block X".

---

## The Note

The **note** is a base64-encoded string that encodes `{ secret, nullifier, leafIndex }`. It is the **only** way to claim a withdrawal. If it's lost, the funds are locked forever.

```
nebula:v1:base64(secret_32bytes + nullifier_32bytes + leafIndex_4bytes)
```

- Generated client-side during `resolveGameAndDeposit`
- Stored in `localStorage` under key `nebula-game-note`
- Used to generate a ZK proof that proves knowledge of the preimage of the on-chain commitment

---

## ZK Circuit

The Noir circuit (`packages/nebula/src/circuit/`) proves:

1. Knowledge of `secret` and `nullifier` such that `Poseidon(secret, nullifier) == commitment[leafIndex]`
2. The `commitment[leafIndex]` is in the Merkle tree with root `R`
3. The nullifier hash `Poseidon(nullifier, 0)` has not been spent

Public inputs: `root`, `nullifierHash`
Private inputs: `secret`, `nullifier`, `merkle_path`, `merkle_indices`

---

## License

MIT
