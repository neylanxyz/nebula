'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import type { Address } from 'viem';
import { toast } from 'sonner';
import { useIsOwner } from '@/hooks/useIsOwner';
import { AdminPanel } from '@/components/AdminPanel';
import { GameList } from '@/components/GameList';

function AdminContent() {
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
        description: 'Only the tournament creator can access the admin panel.',
        duration: 5000,
      });
      router.replace('/');
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
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-300"
          >
            ← Back to list
          </button>
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <div className="w-24" />
        </div>
        <AdminPanel gameAddress={gameAddress} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="mt-1 text-sm text-gray-400">
          Click &quot;Manage tournament&quot; on a tournament you own.
        </p>
      </div>
      <GameList
        selectedGame={null}
        onSelect={() => {}}
        showCreate
      />
    </div>
  );
}

export default function AdminPage() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">Admin</h1>
          <p className="mt-2 text-sm text-gray-400">
            Connect your wallet to access the admin panel.
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
          <AdminContent />
        </Suspense>
      </div>
    </main>
  );
}
