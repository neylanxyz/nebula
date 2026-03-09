'use client';

import { useReadContracts } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import { GAME_CONTRACT_ADDRESS } from '@/config/contracts';
import type { Address } from 'viem';

const contract = {
  address: GAME_CONTRACT_ADDRESS,
  abi: gameAbi,
} as const;

export function useGameState() {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...contract, functionName: 'gameResolved' },
      { ...contract, functionName: 'currentBalance' },
      { ...contract, functionName: 'players', args: [0n] },
      { ...contract, functionName: 'players', args: [1n] },
      { ...contract, functionName: 'ENTRY_FEE' },
      { ...contract, functionName: 'owner' },
      { ...contract, functionName: 'NEBULA_FEE' },
    ],
  });

  const gameResolved = data?.[0]?.result as boolean | undefined;
  const currentBalance = data?.[1]?.result as bigint | undefined;
  const player1 = data?.[2]?.result as Address | undefined;
  const player2 = data?.[3]?.result as Address | undefined;
  const entryFee = data?.[4]?.result as bigint | undefined;
  const owner = data?.[5]?.result as Address | undefined;
  const nebulaFee = data?.[6]?.result as bigint | undefined;

  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const hasPlayer1 = player1 !== undefined && player1 !== zeroAddress;
  const hasPlayer2 = player2 !== undefined && player2 !== zeroAddress;
  const playerCount = (hasPlayer1 ? 1 : 0) + (hasPlayer2 ? 1 : 0);
  const isFull = playerCount === 2;

  return {
    gameResolved,
    currentBalance,
    player1: hasPlayer1 ? player1 : undefined,
    player2: hasPlayer2 ? player2 : undefined,
    playerCount,
    isFull,
    entryFee,
    owner,
    nebulaFee,
    isLoading,
    refetch,
  };
}
