'use client';

import { useAccount } from 'wagmi';
import { useGameState } from './useGameState';
import type { Address } from 'viem';

export function useIsOwner(gameAddress: Address) {
  const { address } = useAccount();
  const { owner, isLoading } = useGameState(gameAddress);

  const isOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  return { isOwner, isLoading };
}
