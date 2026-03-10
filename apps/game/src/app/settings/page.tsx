'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import type { Address } from 'viem';
import { toast } from 'sonner';
import { useIsOwner } from '@/hooks/useIsOwner';
import { useMyGames, type MyGame } from '@/hooks/useMyGames';
import { useCreateGame } from '@/hooks/useCreateGame';
import { useGameList } from '@/hooks/useGameList';
import { useEffect as useEffectRefetch } from 'react';
import { AdminPanel } from '@/components/AdminPanel';

// ─── Mini game card used only in Settings ────────────────────────────────────

function SettingsGameCard({
  game,
  onManage,
}: {
  game: MyGame;
  onManage?: () => void;
}) {
  const statusColor = game.gameResolved
    ? 'text-emerald-400'
    : game.playerCount === 2
      ? 'text-yellow-400'
      : 'text-blue-400';

  const statusDot = game.gameResolved
    ? 'bg-emerald-500'
    : game.playerCount === 2
      ? 'bg-yellow-500'
      : 'bg-blue-500';

  const statusLabel = game.gameResolved
    ? 'Resolved'
    : game.playerCount === 2
      ? 'Full'
      : `${game.playerCount}/2 players`;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60">
      <div className="flex items-center justify-between p-4">
        <span className="font-mono text-xs text-gray-500">
          {game.address.slice(0, 8)}...{game.address.slice(-6)}
        </span>
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${statusColor}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
          {statusLabel}
        </span>
      </div>
      {onManage && (
        <div className="border-t border-gray-800 px-4 pb-3 pt-2.5">
          <button
            onClick={onManage}
            className="w-full rounded-lg border border-purple-700/40 px-3 py-1.5 text-xs font-medium text-purple-400 transition hover:border-purple-600/60 hover:bg-purple-950/40"
          >
            Manage tournament →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="h-[60px] animate-pulse rounded-xl border border-gray-800 bg-gray-900" />
      ))}
    </div>
  );
}

// ─── Settings list view ───────────────────────────────────────────────────────

function SettingsList() {
  const router = useRouter();
  const { owned, played, isLoading } = useMyGames();
  const { games, refetch } = useGameList();
  const { createGame, isPending, isConfirming, isSuccess, error } = useCreateGame();

  useEffectRefetch(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-800" />
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            {games.length} tournament{games.length !== 1 ? 's' : ''} on-chain
          </p>
        </div>
        <button
          onClick={createGame}
          disabled={isPending || isConfirming}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          {isPending || isConfirming ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating...
            </>
          ) : (
            '+ New Tournament'
          )}
        </button>
      </div>

      {isSuccess && (
        <p className="rounded-lg border border-emerald-800/40 bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-400">
          Tournament created successfully!
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-2.5 text-sm text-red-400">
          {(error as Error).message?.slice(0, 120)}
        </p>
      )}

      {/* Your tournaments */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
          Your Tournaments
        </h2>

        {owned.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center">
            <p className="text-sm text-gray-400">You haven&apos;t created any tournament yet.</p>
            <p className="mt-1 text-xs text-gray-600">
              Click &quot;+ New Tournament&quot; above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...owned].reverse().map((game) => (
              <SettingsGameCard
                key={game.address}
                game={game}
                onManage={() => router.push(`/settings?game=${game.address}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tournaments you played */}
      {played.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
            Tournaments You Played
          </h2>
          <div className="space-y-2">
            {[...played].reverse().map((game) => (
              <SettingsGameCard key={game.address} game={game} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main content (handles ?game= param) ─────────────────────────────────────

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameParam = searchParams.get('game');
  const gameAddress =
    gameParam && isAddress(gameParam) ? (gameParam as Address) : null;

  const { isOwner, isLoading } = useIsOwner(
    gameAddress ?? '0x0000000000000000000000000000000000000000',
  );

  useEffect(() => {
    if (gameAddress && !isLoading && !isOwner) {
      toast.error("Access denied — you're not the owner of this tournament.", {
        description: 'Only the tournament creator can manage it.',
        duration: 5000,
      });
      router.replace('/settings');
    }
  }, [gameAddress, isOwner, isLoading, router]);

  if (gameAddress) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
          <p className="text-sm">Verifying permission...</p>
        </div>
      );
    }

    if (!isOwner) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-300"
          >
            ← Back to list
          </button>
          <h1 className="text-lg font-bold text-white">Tournament Settings</h1>
          <div className="w-24" />
        </div>
        <AdminPanel gameAddress={gameAddress} />
      </div>
    );
  }

  return <SettingsList />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="mt-2 text-sm text-gray-400">
            Connect your wallet to manage your tournaments.
          </p>
        </div>
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-gray-300" />
            </div>
          }
        >
          <SettingsContent />
        </Suspense>
      </div>
    </main>
  );
}
