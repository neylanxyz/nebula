'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { useGameState } from '@/hooks/useGameState';
import { useGameEvents } from '@/hooks/useGameEvents';
import { EnterButton } from './EnterButton';
import { GameStatus } from './GameStatus';
import { useCallback } from 'react';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function GameLobby() {
  const { isConnected, address } = useAccount();
  const gameState = useGameState();
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

  const handleUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useGameEvents(handleUpdate);

  const alreadyEntered =
    address &&
    ((player1 && player1.toLowerCase() === address.toLowerCase()) ||
      (player2 && player2.toLowerCase() === address.toLowerCase()));

  const canEnter = isConnected && !isFull && !gameResolved && !alreadyEntered;

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Nebula Privacy Tournament</h1>
        <p className="mt-2 text-gray-400">
          Torneio com prêmio distribuído de forma privada via ZK proofs
        </p>
      </div>

      <div className="flex justify-center">
        <ConnectButton />
      </div>

      <GameStatus playerCount={playerCount} gameResolved={gameResolved} />

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Estado do Jogo</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Jogadores</span>
            <p className="font-mono text-lg">{playerCount} / 2</p>
          </div>
          <div>
            <span className="text-gray-400">Prize Pool</span>
            <p className="font-mono text-lg">
              {currentBalance !== undefined
                ? `${formatEther(currentBalance)} AVAX`
                : '...'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${player1 ? 'bg-emerald-500' : 'bg-gray-600'}`}
            />
            <span className="text-gray-400">Player 1:</span>
            <span className="font-mono">
              {player1 ? shortenAddress(player1) : 'Vazio'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${player2 ? 'bg-emerald-500' : 'bg-gray-600'}`}
            />
            <span className="text-gray-400">Player 2:</span>
            <span className="font-mono">
              {player2 ? shortenAddress(player2) : 'Vazio'}
            </span>
          </div>
        </div>

        {gameResolved && (
          <div className="rounded-lg bg-emerald-900/30 p-3 text-center text-sm text-emerald-400">
            Jogo resolvido — prêmio depositado no Nebula Pool
          </div>
        )}

        {alreadyEntered && !gameResolved && !isFull && (
          <div className="rounded-lg bg-blue-900/30 p-3 text-center text-sm text-blue-400">
            Você já entrou no torneio. Aguardando segundo jogador...
          </div>
        )}

        {alreadyEntered && !gameResolved && isFull && (
          <div className="rounded-lg bg-purple-900/30 p-3 text-center text-sm text-purple-400">
            Jogo lotado! Aguardando o owner resolver o jogo...
          </div>
        )}
      </div>

      {isConnected && !alreadyEntered && (
        <EnterButton entryFee={entryFee} disabled={!canEnter} />
      )}

      {!isConnected && (
        <p className="text-center text-sm text-gray-500">
          Conecte sua wallet para participar
        </p>
      )}
    </div>
  );
}
