import type { Address } from "viem";

/** Merkle tree depth used by the privacy pool circuit */
export const TREE_DEPTH = 20;

/** Default contract address on Avalanche testnet */
export const NEBULA_CONTRACT_ADDRESS: Address =
  "0xDAfA37E8DA60c00F689e70fefcD06EdC1C4dACbe";

/** Block at which the contract was deployed (Avalanche Fuji) */
export const NEBULA_START_BLOCK = 33349712n;

/** Chain ID for Avalanche testnet */
export const AVALANCHE_SEPOLIA_CHAIN_ID = 5003;

/** Number of blocks to fetch per batch when scanning events */
export const BLOCK_BATCH_SIZE = 5000;

/** Delay between RPC batch requests in ms */
export const REQUEST_DELAY_MS = 200;

/** Maximum blocks to scan as a safety limit */
export const MAX_SCAN_BLOCKS = 500_000;
