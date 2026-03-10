'use client';

import { useEnterGame } from '@/hooks/useEnterGame';
import { formatEther } from 'viem';
import type { Address } from 'viem';

interface EnterButtonProps {
  gameAddress: Address;
  entryFee: bigint | undefined;
  disabled: boolean;
}

export function EnterButton({ gameAddress, entryFee, disabled }: EnterButtonProps) {
  const { enter, isPending, isConfirming, isSuccess, error } = useEnterGame(gameAddress);

  const feeDisplay = entryFee ? formatEther(entryFee) : '...';

  return (
    <div className="space-y-2">
      <button
        onClick={() => entryFee && enter(entryFee)}
        disabled={disabled || isPending || isConfirming || !entryFee}
        className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? 'Confirmando na wallet...'
          : isConfirming
            ? 'Processando...'
            : `Entrar no Torneio — ${feeDisplay} AVAX`}
      </button>
      {isSuccess && <p className="text-sm text-emerald-400">Entrada confirmada!</p>}
      {error && (
        <p className="text-sm text-red-400">
          {(error as Error).message?.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
