'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { gameFactoryAbi } from '@/lib/gameAbi';
import { GAME_FACTORY_ADDRESS } from '@/config/contracts';

export function useCreateGame() {
  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function createGame() {
    writeContract({
      address: GAME_FACTORY_ADDRESS,
      abi: gameFactoryAbi,
      functionName: 'createGame',
    });
  }

  return { createGame, txHash, isPending, isConfirming, isSuccess, error };
}
