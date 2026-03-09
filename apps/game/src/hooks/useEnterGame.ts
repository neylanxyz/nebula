'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import { GAME_CONTRACT_ADDRESS } from '@/config/contracts';

export function useEnterGame() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function enter(entryFee: bigint) {
    writeContract({
      address: GAME_CONTRACT_ADDRESS,
      abi: gameAbi,
      functionName: 'enter',
      value: entryFee,
    });
  }

  return {
    enter,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
