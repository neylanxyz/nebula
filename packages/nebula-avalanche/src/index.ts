// Facade
export { NebulaAvalanche } from './nebula-avalanche.js';
export type { NebulaAvalancheConfig } from './nebula-avalanche.js';

// Types (re-export from core)
export type {
  NebulaConfig,
  NoteData,
  Deposit,
  ProofInputs,
  GeneratedProof,
  DepositResult,
  WithdrawResult,
  PoolInfo,
  FetchProgress,
  ProgressCallback,
  WithdrawOptions,
  FetchDepositsOptions,
  PoseidonFn,
} from '@neylanxyz/nebula';

// Errors (re-export from core)
export {
  NebulaError,
  InvalidNoteError,
  ProofGenerationError,
  CommitmentMismatchError,
  ContractError,
  InsufficientDepositsError,
  AbortedError,
} from '@neylanxyz/nebula';

// Avalanche Fuji constants
export {
  NEBULA_CONTRACT_ADDRESS,
  VERIFIER_CONTRACT_ADDRESS,
  AVALANCHE_FUJI_CHAIN_ID,
  TREE_DEPTH,
  NEBULA_START_BLOCK,
  BLOCK_BATCH_SIZE,
  REQUEST_DELAY_MS,
  MAX_SCAN_BLOCKS,
} from './constants.js';

// ABIs
export { NEBULA_POOL_ABI, VERIFIER_ABI } from './abi.js';

// Core ZK functions (re-export from core)
export { createNote, encodeNote, decodeNote } from '@neylanxyz/nebula';
export { getPoseidon, fieldToString, fieldToBytes32, toBytes32 } from '@neylanxyz/nebula';
export { buildZeroes, insertLeaf, buildMerklePathForLeaf } from '@neylanxyz/nebula';
export { computeProofInputs } from '@neylanxyz/nebula';
export { generateProof } from '@neylanxyz/nebula';

// Contract — Avalanche-specific
export { NebulaAvalancheReader } from './contract/reader.js';
export { NebulaAvalancheWriter } from './contract/writer.js';
export { fetchDeposits } from './contract/events.js';
