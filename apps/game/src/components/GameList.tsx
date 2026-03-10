"use client";

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
  const { gameResolved, playerCount, currentBalance, isLoading } =
    useGameState(gameAddress);

  const statusColor = gameResolved
    ? "text-emerald-400"
    : playerCount === 2
      ? "text-yellow-400"
      : "text-blue-400";

  const statusLabel = gameResolved
    ? "Resolvido"
    : playerCount === 2
      ? "Lotado"
      : `${playerCount}/2 jogadores`;

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-purple-500 bg-purple-900/20"
          : "border-gray-800 bg-gray-900 hover:border-gray-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-500">
          {gameAddress.slice(0, 10)}...{gameAddress.slice(-8)}
        </span>
        <span className={`text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      {!isLoading && (
        <div className="mt-2 flex gap-4 text-sm">
          <span className="text-gray-400">
            Prize:{" "}
            <span className="text-white">
              {currentBalance !== undefined
                ? `${formatEther(currentBalance)} AVAX`
                : "..."}
            </span>
          </span>
        </div>
      )}
    </button>
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

  const isFactoryDeployed =
    GAME_FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  if (!isFactoryDeployed) {
    return (
      <div className="rounded-xl border border-yellow-700/50 bg-yellow-900/10 p-6 text-center text-sm text-yellow-400">
        Factory não deployada ainda. Atualize <code>GAME_FACTORY_ADDRESS</code>{" "}
        em <code>config/contracts.ts</code>.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Torneios</h2>
        {showCreate && (
          <button
            onClick={() => {
              createGame();
            }}
            disabled={isPending || isConfirming}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
          >
            {isPending || isConfirming ? "Criando..." : "+ Novo Torneio"}
          </button>
        )}
      </div>

      {isSuccess && (
        <p className="text-sm text-emerald-400">
          Torneio criado!{" "}
          <button onClick={() => refetch()} className="underline">
            Atualizar lista
          </button>
        </p>
      )}

      {error && (
        <p className="text-sm text-red-400">
          {(error as Error).message?.slice(0, 100)}
        </p>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-gray-500">
          Carregando torneios...
        </p>
      ) : games.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center text-sm text-gray-500">
          Nenhum torneio criado ainda.
          {showCreate && ' Clique em "+ Novo Torneio" para começar.'}
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
