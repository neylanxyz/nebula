'use client';

import { useEffect } from 'react';
import { useEnterGame } from '@/hooks/useEnterGame';
import { formatEther } from 'viem';
import type { Address } from 'viem';

interface EnterButtonProps {
  gameAddress: Address;
  entryFee: bigint | undefined;
  disabled: boolean;
  onSuccess?: () => void;
}

export function EnterButton({ gameAddress, entryFee, disabled, onSuccess }: EnterButtonProps) {
  const { enter, isPending, isConfirming, isSuccess, error } = useEnterGame(gameAddress);

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  const feeDisplay = entryFee ? formatEther(entryFee) : '...';

  return (
    <div className="space-y-2">
      <button
        onClick={() => entryFee && enter(entryFee)}
        disabled={disabled || isPending || isConfirming || !entryFee}
        className="w-full rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending
          ? 'Confirming in wallet...'
          : isConfirming
            ? 'Processing...'
            : `Join Tournament — ${feeDisplay} AVAX`}
      </button>
      {isSuccess && (
        <p className="text-center text-sm text-emerald-400">Entry confirmed!</p>
      )}
      {error && (
        <p className="text-sm text-red-400">
          {(error as Error).message?.slice(0, 100)}
        </p>
      )}
    </div>
  );
}
