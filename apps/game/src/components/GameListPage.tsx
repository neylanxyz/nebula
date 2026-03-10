'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GameList } from './GameList';
import { GameLobby } from './GameLobby';
import type { Address } from 'viem';

export function GameListPage() {
  const [selectedGame, setSelectedGame] = useState<Address | null>(null);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Nebula Privacy Tournament</h1>
        <p className="mt-2 text-gray-400">
          Torneios com prêmio privado via ZK proofs
        </p>
      </div>

      <div className="flex justify-center">
        <ConnectButton />
      </div>

      <GameList selectedGame={selectedGame} onSelect={setSelectedGame} showCreate />

      {selectedGame && (
        <div className="border-t border-gray-800 pt-8">
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-6 text-sm text-gray-500 hover:text-gray-300"
          >
            ← Voltar para lista
          </button>
          <GameLobby gameAddress={selectedGame} />
        </div>
      )}
    </div>
  );
}
