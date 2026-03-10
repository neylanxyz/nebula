'use client';

import { useState } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import { NEBULA_NOTE_STORAGE_KEY } from '@/config/contracts';
import type { Address } from 'viem';

// keccak256("Deposit(bytes32,uint32)") — topic0 emitido pelo NebulaPrivatePool (0x254d...)
const DEPOSIT_EVENT_TOPIC =
  '0x84fc9eb8cd0a782a1d1734fbeed616bd0ef775f8b9bd437636b62d634fe4baf3';

export function useResolveGame(gameAddress: Address) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  async function resolve(nebulaFee: bigint) {
    if (!walletClient || !publicClient) {
      setError(new Error('Wallet not connected'));
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const { createNote, encodeNote } = await import('@neylanxyz/nebula');
      const { noteData, commitment } = await createNote();

      const hash = await walletClient.writeContract({
        address: gameAddress,
        abi: gameAbi,
        functionName: 'resolveGameAndDeposit',
        args: [commitment],
        value: nebulaFee,
      });

      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      let leafIndex = 0;
      for (const log of receipt.logs) {
        if (log.topics[0] === DEPOSIT_EVENT_TOPIC) {
          if (log.data && log.data.length >= 66) {
            leafIndex = parseInt(log.data.slice(2, 66), 16);
          }
        }
      }

      noteData.leafIndex = leafIndex;
      const encodedNote = encodeNote(noteData);

      localStorage.setItem(NEBULA_NOTE_STORAGE_KEY, encodedNote);
      setNote(encodedNote);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsPending(false);
    }
  }

  return { resolve, isPending, error, note, txHash };
}
