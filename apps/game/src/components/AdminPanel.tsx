'use client';

import { formatEther } from 'viem';
import { useGameState } from '@/hooks/useGameState';
import { useGameEvents } from '@/hooks/useGameEvents';
import { GameStatus } from './GameStatus';
import { ResolveGame } from './ResolveGame';
import { WithdrawPrize } from './WithdrawPrize';
import { useCallback } from 'react';

export function AdminPanel() {
  const gameState = useGameState();
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

  const handleUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useGameEvents(handleUpdate);

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-2 text-gray-400">Gerenciar o torneio como owner</p>
      </div>

      <GameStatus playerCount={playerCount} gameResolved={gameResolved} />

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-3">
        <h2 className="text-lg font-semibold">Info do Jogo</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Jogadores</span>
            <p className="font-mono">{playerCount} / 2</p>
          </div>
          <div>
            <span className="text-gray-400">Balance</span>
            <p className="font-mono">
              {currentBalance !== undefined
                ? `${formatEther(currentBalance)} AVAX`
                : '...'}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Player 1</span>
            <p className="font-mono text-xs">
              {player1 ? `${player1.slice(0, 8)}...${player1.slice(-6)}` : '—'}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Player 2</span>
            <p className="font-mono text-xs">
              {player2 ? `${player2.slice(0, 8)}...${player2.slice(-6)}` : '—'}
            </p>
          </div>
        </div>
      </div>

      <ResolveGame
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
