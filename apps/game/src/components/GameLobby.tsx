'use client';

import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import type { Address } from 'viem';
import { useGameState } from '@/hooks/useGameState';
import { useGameEvents } from '@/hooks/useGameEvents';
import { EnterButton } from './EnterButton';
import { GameStatus } from './GameStatus';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface GameLobbyProps {
  gameAddress: Address;
}

export function GameLobby({ gameAddress }: GameLobbyProps) {
  const { isConnected, address } = useAccount();
  const gameState = useGameState(gameAddress);
  const {
    gameResolved,
    currentBalance,
    player1,
    player2,
    playerCount,
    isFull,
    entryFee,
    refetch,
  } = gameState;

  const handleUpdate = useCallback(() => refetch(), [refetch]);
  useGameEvents(handleUpdate, gameAddress);

  const alreadyEntered =
    address &&
    ((player1 && player1.toLowerCase() === address.toLowerCase()) ||
      (player2 && player2.toLowerCase() === address.toLowerCase()));

  const canEnter = isConnected && !isFull && !gameResolved && !alreadyEntered;

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
          <p className="text-xs text-gray-500">Prize Pool</p>
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
            <span className="font-mono text-xs text-gray-300 truncate">
              {addr ? shortenAddress(addr) : 'Waiting...'}
            </span>
          </div>
        ))}
      </div>

      {/* State messages */}
      {gameResolved && (
        <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/10 p-4 text-center text-sm text-emerald-400">
          Game resolved — prize deposited in Nebula Pool
        </div>
      )}
      {alreadyEntered && !gameResolved && !isFull && (
        <div className="rounded-xl border border-blue-800/50 bg-blue-900/10 p-4 text-center text-sm text-blue-400">
          You&apos;ve entered. Waiting for second player...
        </div>
      )}
      {alreadyEntered && !gameResolved && isFull && (
        <div className="rounded-xl border border-purple-800/50 bg-purple-900/10 p-4 text-center text-sm text-purple-400">
          Game full! Waiting for the owner to resolve.
        </div>
      )}

      {/* Actions */}
      {isConnected && !alreadyEntered && !gameResolved && (
        <EnterButton
          gameAddress={gameAddress}
          entryFee={entryFee}
          disabled={!canEnter}
          onSuccess={handleUpdate}
        />
      )}
      {!isConnected && (
        <p className="text-center text-sm text-gray-500">
          Connect your wallet to play
        </p>
      )}
    </div>
  );
}
