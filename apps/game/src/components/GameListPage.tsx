'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { GameList } from './GameList';
import { GameLobby } from './GameLobby';
import type { Address } from 'viem';

export function GameListPage() {
  const [selectedGame, setSelectedGame] = useState<Address | null>(null);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Nebula
          </h1>
          <p className="text-xs text-gray-500">Privacy Tournament</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-gray-500 hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
            </svg>
            Settings
          </Link>
          <ConnectButton
            showBalance={false}
            chainStatus="none"
            accountStatus="avatar"
          />
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400">
          Powered by ZK Proofs
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Private prize tournaments
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Enter, play and claim your prize completely anonymously.
        </p>
      </div>

      {/* Game list */}
      <GameList selectedGame={selectedGame} onSelect={setSelectedGame} />

      {/* Selected game lobby */}
      {selectedGame && (
        <div className="border-t border-gray-800 pt-6">
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-300"
          >
            ← Back to list
          </button>
          <GameLobby gameAddress={selectedGame} />
        </div>
      )}
    </div>
  );
}
