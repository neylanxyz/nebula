'use client';

import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { NEBULA_NOTE_STORAGE_KEY } from '@/config/contracts';
import type { Address } from 'viem';

export function useWithdrawPrize() {
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { data: walletClient } = useWalletClient();

  async function withdraw(winner: Address) {
    if (!walletClient) {
      setError(new Error('Wallet not connected'));
      return;
    }

    const note = localStorage.getItem(NEBULA_NOTE_STORAGE_KEY);
    if (!note) {
      setError(new Error('No note found. Resolve the game first.'));
      return;
    }

    setIsPending(true);
    setError(null);
    setStatus('Initializing Nebula SDK...');

    try {
      const { NebulaAvalanche } = await import('@neylanxyz/nebula-avalanche');

      const nebula = new NebulaAvalanche({
        rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
        indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL ?? 'http://localhost:42069',
      });

      setStatus('Fetching deposits and building Merkle tree...');

      const result = await nebula.withdraw(note, winner, walletClient, {
        onFetchProgress: (progress) => {
          setStatus(`Fetching deposits... ${Math.round(progress.percentage)}%`);
        },
      });

      setTxHash(result.txHash);
      setStatus('Withdrawal complete!');
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus('');
    } finally {
      setIsPending(false);
    }
  }

  return { withdraw, isPending, status, error, txHash };
}
