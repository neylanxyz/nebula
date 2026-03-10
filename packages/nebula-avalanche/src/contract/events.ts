import type { Address } from 'viem';
import { fetchDeposits as baseFetchDeposits } from '@neylanxyz/nebula';
import type { Deposit, FetchDepositsOptions } from '@neylanxyz/nebula';
import { NEBULA_START_BLOCK } from '../constants.js';

/**
 * Fetch Deposit events from the Ponder indexer REST API.
 * Returns deposits sorted by leafIndex up to targetCount.
 */
async function fetchDepositsFromIndexer(
  indexerUrl: string,
  targetCount: number,
): Promise<Deposit[]> {
  const url = `${indexerUrl.replace(/\/$/, '')}/deposits`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Indexer request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { deposits: { commitment: string; leafIndex: number }[] };

  return data.deposits
    .filter((d) => d.leafIndex < targetCount)
    .map((d) => ({ commitment: d.commitment, leafIndex: d.leafIndex }));
}

/**
 * Fetch Deposit events from Avalanche Fuji.
 * If indexerUrl is provided, fetches from the Ponder indexer API (avoids eth_getLogs limits).
 * Falls back to on-chain scanning if no indexer URL is set.
 */
export async function fetchDeposits(
  rpcUrl: string,
  contractAddress: Address,
  targetCount: number,
  options?: FetchDepositsOptions & { indexerUrl?: string },
): Promise<Deposit[]> {
  if (options?.indexerUrl) {
    return fetchDepositsFromIndexer(options.indexerUrl, targetCount);
  }

  return baseFetchDeposits(rpcUrl, contractAddress, targetCount, {
    ...options,
    startBlock: options?.startBlock ?? NEBULA_START_BLOCK,
  });
}
