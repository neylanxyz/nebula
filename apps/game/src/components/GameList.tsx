"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useGameList } from "@/hooks/useGameList";
import { useGameState } from "@/hooks/useGameState";
import { useCreateGame } from "@/hooks/useCreateGame";
import { formatEther } from "viem";
import type { Address } from "viem";
import { GAME_FACTORY_ADDRESS } from "@/config/contracts";

interface GameCardProps {
  gameAddress: Address;
  selected: boolean;
  onSelect: () => void;
}

function GameCard({ gameAddress, selected, onSelect }: GameCardProps) {
  const { address } = useAccount();
  const router = useRouter();
  const { gameResolved, playerCount, currentBalance, owner, isLoading } =
    useGameState(gameAddress);

  const isOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  const statusColor = gameResolved
    ? "text-emerald-400"
    : playerCount === 2
      ? "text-yellow-400"
      : "text-blue-400";

  const statusDot = gameResolved
    ? "bg-emerald-500"
    : playerCount === 2
      ? "bg-yellow-500"
      : "bg-blue-500";

  const statusLabel = gameResolved
    ? "Resolved"
    : playerCount === 2
      ? "Full"
      : `${playerCount}/2 players`;

  return (
    <div
      className={`rounded-xl border transition-all ${
        selected
          ? "border-purple-500 bg-purple-950/30"
          : "border-gray-800 bg-gray-900/60 hover:border-gray-700"
      }`}
    >
      <button onClick={onSelect} className="w-full p-4 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-gray-500 truncate">
            {gameAddress.slice(0, 8)}...{gameAddress.slice(-6)}
          </span>
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${statusColor}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
            {statusLabel}
          </span>
        </div>

        {isLoading ? (
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-800" />
        ) : (
          <div className="mt-2 text-sm text-gray-400">
            Prize:{" "}
            <span className="font-medium text-white">
              {currentBalance !== undefined
                ? `${formatEther(currentBalance)} AVAX`
                : "—"}
            </span>
          </div>
        )}
      </button>

      {isOwner && (
        <div className="border-t border-gray-800 px-4 pb-3 pt-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin?game=${gameAddress}`);
            }}
            className="w-full rounded-lg border border-purple-700/40 px-3 py-1.5 text-xs font-medium text-purple-400 transition hover:bg-purple-950/40 hover:border-purple-600/60"
          >
            Manage tournament →
          </button>
        </div>
      )}
    </div>
  );
}

interface GameListProps {
  selectedGame: Address | null;
  onSelect: (address: Address) => void;
  showCreate?: boolean;
}

export function GameList({
  selectedGame,
  onSelect,
  showCreate = false,
}: GameListProps) {
  const { games, isLoading, refetch } = useGameList();
  const { createGame, isPending, isConfirming, isSuccess, error } =
    useCreateGame();

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const isFactoryDeployed =
    GAME_FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  if (!isFactoryDeployed) {
    return (
      <div className="rounded-xl border border-yellow-700/50 bg-yellow-900/10 p-6 text-center text-sm text-yellow-400">
        Factory not deployed. Set{" "}
        <code className="rounded bg-yellow-900/30 px-1">
          GAME_FACTORY_ADDRESS
        </code>{" "}
        in{" "}
        <code className="rounded bg-yellow-900/30 px-1">
          config/contracts.ts
        </code>
        .
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Tournaments</h2>
        {showCreate && (
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
              "+ New Tournament"
            )}
          </button>
        )}
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

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-xl border border-gray-800 bg-gray-900"
            />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700 p-10 text-center">
          <p className="text-sm text-gray-500">No tournaments yet.</p>
          {showCreate && (
            <p className="mt-1 text-xs text-gray-600">
              Click &quot;+ New Tournament&quot; to get started.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {[...games].reverse().map((game) => (
            <GameCard
              key={game}
              gameAddress={game}
              selected={selectedGame?.toLowerCase() === game.toLowerCase()}
              onSelect={() => onSelect(game)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
