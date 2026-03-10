import { createPublicClient, http, parseAbiItem, type Address, type PublicClient } from 'viem';
import type { Deposit, FetchDepositsOptions, FetchProgress } from '../types.js';
import { AbortedError } from '../errors.js';
import {
  NEBULA_START_BLOCK,
  BLOCK_BATCH_SIZE,
  REQUEST_DELAY_MS,
  MAX_SCAN_BLOCKS,
} from '../constants.js';

const DEPOSIT_EVENT = parseAbiItem(
  'event Deposit(bytes32 indexed commitment, uint32 leafIndex)',
);

/**
 * Fetch Deposit events from the blockchain by scanning logs in batches.
 *
 * @param rpcUrl - RPC endpoint URL
 * @param contractAddress - Privacy pool contract address
 * @param targetCount - Number of deposits needed (leafIndex + 1)
 * @param options - Optional start block, progress callback, abort signal
 * @returns Array of Deposit objects sorted by leafIndex
 */
export async function fetchDeposits(
  rpcUrl: string,
  contractAddress: Address,
  targetCount: number,
  options?: FetchDepositsOptions,
): Promise<Deposit[]> {
  const client = createPublicClient({ transport: http(rpcUrl) });
  return fetchDepositsWithClient(client, contractAddress, targetCount, options);
}

/** Internal: fetch deposits using an existing PublicClient */
export async function fetchDepositsWithClient(
  client: PublicClient,
  contractAddress: Address,
  targetCount: number,
  options?: FetchDepositsOptions,
): Promise<Deposit[]> {
  const startBlock = options?.startBlock ?? NEBULA_START_BLOCK;
  const startTime = Date.now();

  let allDeposits: Deposit[] = [];
  let currentFromBlock = startBlock;
  let totalBlocksScanned = 0;

  const currentBlock = await client.getBlockNumber();

  while (totalBlocksScanned < MAX_SCAN_BLOCKS) {
    // Check abort
    if (options?.signal?.aborted) {
      throw new AbortedError();
    }

    const currentToBlock = currentFromBlock + BigInt(BLOCK_BATCH_SIZE) - 1n;
    const finalToBlock = currentToBlock > currentBlock ? currentBlock : currentToBlock;

    const logs = await client.getLogs({
      address: contractAddress,
      event: DEPOSIT_EVENT,
      fromBlock: currentFromBlock,
      toBlock: finalToBlock,
    });

    const batchDeposits: Deposit[] = logs.map((log) => ({
      leafIndex: Number(log.args.leafIndex),
      commitment: log.args.commitment as string,
    }));

    allDeposits = [...allDeposits, ...batchDeposits];

    // Check if we have enough
    const maxIndexFound = allDeposits.length > 0
      ? Math.max(...allDeposits.map((d) => d.leafIndex))
      : -1;

    if (maxIndexFound >= targetCount - 1) {
      break;
    }

    // Progress update
    totalBlocksScanned += Number(finalToBlock - currentFromBlock + 1n);

    if (options?.onProgress) {
      const elapsed = Date.now() - startTime;
      const blocksPerSecond = totalBlocksScanned / (elapsed / 1000);
      const remainingBlocks = Number(currentBlock - currentFromBlock);

      const progress: FetchProgress = {
        currentBlock: totalBlocksScanned,
        totalBlocks: Number(currentBlock - startBlock),
        depositsFound: allDeposits.length,
        targetDeposits: targetCount,
        percentage: Math.round(
          (totalBlocksScanned / Number(currentBlock - startBlock)) * 100,
        ),
        estimatedTimeRemaining: Math.round(remainingBlocks / blocksPerSecond),
      };
      options.onProgress(progress);
    }

    // Move to next batch
    currentFromBlock = finalToBlock + 1n;

    if (currentFromBlock > currentBlock) break;

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  // Sort and filter
  allDeposits.sort((a, b) => a.leafIndex - b.leafIndex);
  return allDeposits.filter((d) => d.leafIndex < targetCount);
}
