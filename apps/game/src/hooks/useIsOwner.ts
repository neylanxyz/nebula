'use client';

import { useAccount } from 'wagmi';
import { useGameState } from './useGameState';

export function useIsOwner() {
  const { address } = useAccount();
  const { owner, isLoading } = useGameState();

  const isOwner =
    !!address &&
    !!owner &&
    address.toLowerCase() === owner.toLowerCase();

  return { isOwner, isLoading };
}
