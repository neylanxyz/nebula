'use client';

import { useWatchContractEvent } from 'wagmi';
import { gameAbi } from '@/lib/gameAbi';
import { GAME_CONTRACT_ADDRESS } from '@/config/contracts';
import { useCallback } from 'react';

export function useGameEvents(onUpdate: () => void) {
  const handleEvent = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  useWatchContractEvent({
    address: GAME_CONTRACT_ADDRESS,
    abi: gameAbi,
    eventName: 'PlayerEntered',
    onLogs: handleEvent,
  });

  useWatchContractEvent({
    address: GAME_CONTRACT_ADDRESS,
    abi: gameAbi,
    eventName: 'PrizeDeposited',
    onLogs: handleEvent,
  });
}
