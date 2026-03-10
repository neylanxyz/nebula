import type { Address, Hash, PublicClient, WalletClient } from 'viem';

/** Configuration for initializing Nebula */
export interface NebulaConfig {
  /** RPC URL for the target chain */
  rpcUrl: string;
  /** Contract address of the privacy pool */
  contractAddress: Address;
  /** Block number where the contract was deployed (for event scanning) */
  startBlock?: bigint;
}

/** Data representing a deposit note (secret + nullifier + leafIndex) */
export interface NoteData {
  secret: bigint;
  nullifier: bigint;
  leafIndex: number;
}

/** A deposit event from the on-chain contract */
export interface Deposit {
  leafIndex: number;
  commitment: string;
}

/** Inputs required to generate a ZK proof */
export interface ProofInputs {
  secret: string;
  nullifier: string;
  nullifier_hash: string;
  nullifier_hash_bytes32: string;
  merkle_path: string[];
  merkle_indices: number[];
  root: string;
  root_bytes32: string;
  leafIndex: number;
}

/** A generated ZK proof ready for on-chain submission */
export interface GeneratedProof {
  proof: `0x${string}`;
  publicInputs: string[];
}

/** Result of a deposit operation */
export interface DepositResult {
  /** Base64-encoded note string (user must save this) */
  note: string;
  /** Transaction hash of the deposit */
  txHash: Hash;
  /** The commitment that was deposited */
  commitment: `0x${string}`;
  /** The leaf index assigned to this deposit */
  leafIndex: number;
}

/** Result of a withdraw operation */
export interface WithdrawResult {
  /** Transaction hash of the withdrawal */
  txHash: Hash;
}

/** Pool information from the contract */
export interface PoolInfo {
  denomination: bigint;
  currentRoot: `0x${string}`;
  nextIndex: number;
  protocolFee: bigint;
  maxLeaves: number;
  paused: boolean;
}

/** Progress of deposit event fetching */
export interface FetchProgress {
  currentBlock: number;
  totalBlocks: number;
  depositsFound: number;
  targetDeposits: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

/** Callback for fetch progress updates */
export type ProgressCallback = (progress: FetchProgress) => void;

/** Options for the withdraw operation */
export interface WithdrawOptions {
  /** Callback for progress during deposit fetching phase */
  onFetchProgress?: ProgressCallback;
  /** AbortSignal to cancel the operation */
  signal?: AbortSignal;
}

/** Options for fetching deposits */
export interface FetchDepositsOptions {
  /** Start block for scanning (defaults to contract deployment block) */
  startBlock?: bigint;
  /** Progress callback */
  onProgress?: ProgressCallback;
  /** AbortSignal to cancel the operation */
  signal?: AbortSignal;
}

/**
 * Poseidon hash function type from circomlibjs.
 * Accepts both bigint and Uint8Array (field element) inputs.
 */
export type PoseidonFn = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (inputs: any[]): Uint8Array;
  F: {
    toString(val: unknown): string;
    toObject(val: unknown): bigint;
    e(val: unknown): unknown;
  };
};
