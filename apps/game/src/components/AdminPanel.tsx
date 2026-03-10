'use client';

import { useCallback } from 'react';
import { formatEther } from 'viem';
import type { Address } from 'viem';
import { useGameState } from '@/hooks/useGameState';
import { useGameEvents } from '@/hooks/useGameEvents';
import { GameStatus } from './GameStatus';
import { ResolveGame } from './ResolveGame';
import { WithdrawPrize } from './WithdrawPrize';

interface AdminPanelProps {
  gameAddress: Address;
}

export function AdminPanel({ gameAddress }: AdminPanelProps) {
  const gameState = useGameState(gameAddress);
  const {
    gameResolved,
    currentBalance,
    player1,
    player2,
    playerCount,
    isFull,
    nebulaFee,
    refetch,
  } = gameState;

  const handleUpdate = useCallback(() => refetch(), [refetch]);
  useGameEvents(handleUpdate, gameAddress);

  return (
    <div className="space-y-4">
      {/* Contract address */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
          Contract
        </p>
        <p className="mt-0.5 break-all font-mono text-xs text-gray-400">
          {gameAddress}
        </p>
      </div>

      {/* Status stepper */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
        <GameStatus playerCount={playerCount} gameResolved={gameResolved} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-xs text-gray-500">Players</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {playerCount}
            <span className="text-lg font-normal text-gray-600">/2</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-xs text-gray-500">Balance</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {currentBalance !== undefined ? formatEther(currentBalance) : '—'}
            <span className="text-sm font-normal text-gray-500"> AVAX</span>
          </p>
        </div>
      </div>

      {/* Players */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-400">Players</p>
        {[
          { label: 'Player 1', addr: player1 },
          { label: 'Player 2', addr: player2 },
        ].map(({ label, addr }) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${addr ? 'bg-emerald-500' : 'bg-gray-700'}`}
            />
            <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
            {addr ? (
              <span className="font-mono text-xs text-gray-300 truncate">
                {addr.slice(0, 8)}...{addr.slice(-6)}
              </span>
            ) : (
              <span className="text-xs italic text-gray-600">Waiting...</span>
            )}
          </div>
        ))}
      </div>

      <ResolveGame
        gameAddress={gameAddress}
        isFull={isFull}
        gameResolved={gameResolved}
        nebulaFee={nebulaFee}
      />

      <WithdrawPrize
        gameResolved={gameResolved}
        player1={player1}
        player2={player2}
      />
    </div>
  );
}
