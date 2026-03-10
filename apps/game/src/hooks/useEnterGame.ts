'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import type { Address } from 'viem';

export function useEnterGame(gameAddress: Address) {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function enter(entryFee: bigint) {
    writeContract({
      address: gameAddress,
      abi: gameAbi,
      functionName: 'enter',
      value: entryFee,
    });
  }

  return { enter, txHash, isPending, isConfirming, isSuccess, error };
}
