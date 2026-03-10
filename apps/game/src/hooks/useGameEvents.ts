'use client';

import { useWatchContractEvent } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import { useCallback } from 'react';
import type { Address } from 'viem';

export function useGameEvents(onUpdate: () => void, gameAddress: Address) {
  const handleEvent = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: 'PlayerEntered',
    onLogs: handleEvent,
  });

  useWatchContractEvent({
    address: gameAddress,
    abi: gameAbi,
    eventName: 'PrizeDeposited',
    onLogs: handleEvent,
  });
}
