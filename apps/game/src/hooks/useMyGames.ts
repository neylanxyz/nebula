'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import { useGameList } from './useGameList';
import type { Address } from 'viem';

export interface MyGame {
  address: Address;
  playerCount: number;
  gameResolved: boolean;
}

export function useMyGames() {
  const { address } = useAccount();
  const { games, isLoading: isLoadingGames } = useGameList();

  // Batch-read owner + players[0] + players[1] + gameResolved for every game
  // in a single multicall — no per-game RPC overhead
  const contracts = games.flatMap((game) => [
    { address: game, abi: gameAbi, functionName: 'owner' as const },
    { address: game, abi: gameAbi, functionName: 'players' as const, args: [0n] as const },
    { address: game, abi: gameAbi, functionName: 'players' as const, args: [1n] as const },
    { address: game, abi: gameAbi, functionName: 'gameResolved' as const },
  ]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: games.length > 0 && !!address },
  });

  const owned: MyGame[] = [];
  const played: MyGame[] = [];
  const zero = '0x0000000000000000000000000000000000000000';

  if (data && address) {
    games.forEach((game, i) => {
      const owner = data[i * 4]?.result as Address | undefined;
      const p1 = data[i * 4 + 1]?.result as Address | undefined;
      const p2 = data[i * 4 + 2]?.result as Address | undefined;
      const resolved = data[i * 4 + 3]?.result as boolean | undefined;

      const hasP1 = !!p1 && p1 !== zero;
      const hasP2 = !!p2 && p2 !== zero;
      const playerCount = (hasP1 ? 1 : 0) + (hasP2 ? 1 : 0);
      const entry: MyGame = { address: game, playerCount, gameResolved: !!resolved };

      if (owner?.toLowerCase() === address.toLowerCase()) {
        owned.push(entry);
      } else if (
        (hasP1 && p1!.toLowerCase() === address.toLowerCase()) ||
        (hasP2 && p2!.toLowerCase() === address.toLowerCase())
      ) {
        played.push(entry);
      }
    });
  }

  return {
    owned,
    played,
    isLoading: isLoadingGames || isLoading,
  };
}
