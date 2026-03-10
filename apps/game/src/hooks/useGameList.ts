'use client';

import { useReadContract } from 'wagmi';
import { gameFactoryAbi } from '@/lib/gameAbi';
import { GAME_FACTORY_ADDRESS } from '@/config/contracts';
import type { Address } from 'viem';

export function useGameList() {
  const { data: games, isLoading, refetch } = useReadContract({
    address: GAME_FACTORY_ADDRESS,
    abi: gameFactoryAbi,
    functionName: 'getGames',
  });

  return {
    games: (games as Address[] | undefined) ?? [],
    isLoading,
    refetch,
  };
}
