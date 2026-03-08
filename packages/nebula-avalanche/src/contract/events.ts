import type { Address } from 'viem';
import { fetchDeposits as baseFetchDeposits } from '@neylanxyz/nebula';
import type { Deposit, FetchDepositsOptions } from '@neylanxyz/nebula';
import { NEBULA_START_BLOCK } from '../constants.js';

/**
 * Fetch Deposit events from Avalanche Fuji, defaulting to the Fuji start block.
 */
export async function fetchDeposits(
  rpcUrl: string,
  contractAddress: Address,
  targetCount: number,
  options?: FetchDepositsOptions,
): Promise<Deposit[]> {
  return baseFetchDeposits(rpcUrl, contractAddress, targetCount, {
    ...options,
    startBlock: options?.startBlock ?? NEBULA_START_BLOCK,
  });
}
