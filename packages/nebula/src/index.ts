// Facade
export { Nebula } from './nebula.js';

// Types
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
} from './types.js';

// Errors
export {
  NebulaError,
  InvalidNoteError,
  ProofGenerationError,
  CommitmentMismatchError,
  ContractError,
  InsufficientDepositsError,
  AbortedError,
} from './errors.js';

// Constants
export {
  TREE_DEPTH,
  NEBULA_CONTRACT_ADDRESS,
  NEBULA_START_BLOCK,
  MANTLE_SEPOLIA_CHAIN_ID,
} from './constants.js';

// ABI
export { NEBULA_POOL_ABI } from './abi.js';

// Core — granular exports for advanced usage
export { createNote, encodeNote, decodeNote } from './core/note.js';
export { getPoseidon, fieldToString, fieldToBytes32, toBytes32 } from './core/poseidon.js';
export { buildZeroes, insertLeaf, buildMerklePathForLeaf } from './core/merkle.js';
export { computeProofInputs } from './core/compute.js';
export { generateProof } from './core/proof.js';

// Contract — granular exports
export { NebulaReader } from './contract/reader.js';
export { NebulaWriter } from './contract/writer.js';
export { fetchDeposits } from './contract/events.js';
