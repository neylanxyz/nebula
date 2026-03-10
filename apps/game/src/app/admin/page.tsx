'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useIsOwner } from '@/hooks/useIsOwner';
import { useGameList } from '@/hooks/useGameList';
import { AdminPanel } from '@/components/AdminPanel';
import { GameList } from '@/components/GameList';
import type { Address } from 'viem';

const DEV_SIMULATE_OWNER =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_DEV_SIMULATE_OWNER === 'true';

function AdminPageInner() {
  const [selectedGame, setSelectedGame] = useState<Address | null>(null);
  const { games } = useGameList();

  // Check ownership only when a game is selected
  const { isOwner } = useIsOwner(
    selectedGame ?? '0x0000000000000000000000000000000000000000',
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="mt-2 text-gray-400">Gerenciar torneios</p>
      </div>

      <GameList
        selectedGame={selectedGame}
        onSelect={setSelectedGame}
        showCreate
      />

      {selectedGame && (
        <div className="border-t border-gray-800 pt-8">
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-6 text-sm text-gray-500 hover:text-gray-300"
          >
            ← Voltar para lista
          </button>

          {DEV_SIMULATE_OWNER || isOwner ? (
            <AdminPanel gameAddress={selectedGame} />
          ) : (
            <div className="rounded-xl border border-red-800 bg-red-900/10 p-6 text-center text-sm text-red-400">
              Você não é o owner deste torneio.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-bold">Admin — Conecte sua wallet</h1>
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <AdminPageInner />
    </main>
  );
}
