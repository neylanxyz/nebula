'use client';

import { useState } from 'react';
import { useResolveGame } from '@/hooks/useResolveGame';
import type { Address } from 'viem';

interface ResolveGameProps {
  gameAddress: Address;
  isFull: boolean;
  gameResolved: boolean | undefined;
  nebulaFee: bigint | undefined;
}

export function ResolveGame({ gameAddress, isFull, gameResolved, nebulaFee }: ResolveGameProps) {
  const { resolve, isPending, error, note, txHash } = useResolveGame(gameAddress);
  const [copied, setCopied] = useState(false);

  const canResolve = isFull && !gameResolved && !!nebulaFee;

  async function copyNote() {
    if (!note) return;
    await navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <div>
        <h3 className="text-base font-semibold text-white">Resolve Game</h3>
        <p className="mt-1 text-sm text-gray-400">
          Generates a commitment, deposits into Nebula Pool and saves the note in the browser.
        </p>
      </div>

      <button
        onClick={() => nebulaFee && resolve(nebulaFee)}
        disabled={!canResolve || isPending}
        className="w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          'Resolve Game'
        )}
      </button>

      {!canResolve && !gameResolved && (
        <p className="text-center text-xs text-gray-600">
          {!isFull ? 'Waiting for both players to enter.' : ''}
        </p>
      )}

      {txHash && (
        <p className="text-sm text-emerald-400">
          Tx:{' '}
          <a
            href={`https://testnet.snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-300"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}

      {note && (
        <div className="space-y-3 rounded-xl border border-yellow-600/40 bg-yellow-900/10 p-4">
          <p className="text-sm font-semibold text-yellow-400">
            ⚠ Save this note — it&apos;s the only way to claim the prize.
          </p>
          <textarea
            readOnly
            value={note}
            className="w-full rounded-lg bg-gray-800 p-3 font-mono text-xs text-gray-300 focus:outline-none"
            rows={3}
          />
          <button
            onClick={copyNote}
            className="w-full rounded-xl border border-yellow-600/50 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-900/20"
          >
            {copied ? '✓ Copied!' : 'Copy Note'}
          </button>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
          {error.message.slice(0, 200)}
        </p>
      )}
    </div>
  );
}
