import type { Address } from "viem";

/** Default contract address for NebulaPrivatePool on Avalanche Fuji */
export const NEBULA_CONTRACT_ADDRESS: Address =
  "0x8e14F2620532F8908514283311a7742194192A69";

/** Verifier contract address on Avalanche Fuji */
export const VERIFIER_CONTRACT_ADDRESS: Address =
  "0xEf4feB1ab6fcCF29ac1217A500Db187dE2758ac1";

/** Chain ID for Avalanche Fuji testnet */
export const AVALANCHE_FUJI_CHAIN_ID = 43113;

/** Merkle tree depth used by the privacy pool circuit */
export const TREE_DEPTH = 20;

/** Block at which the contract was deployed (Avalanche Fuji) */
export const NEBULA_START_BLOCK = 52428383n;

/** Number of blocks to fetch per batch when scanning events */
export const BLOCK_BATCH_SIZE = 5000;

/** Delay between RPC batch requests in ms */
export const REQUEST_DELAY_MS = 200;

/** Maximum blocks to scan as a safety limit */
export const MAX_SCAN_BLOCKS = 500_000;
