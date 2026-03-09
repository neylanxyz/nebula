'use client';

import { useState } from 'react';
import { useResolveGame } from '@/hooks/useResolveGame';

interface ResolveGameProps {
  isFull: boolean;
  gameResolved: boolean | undefined;
  nebulaFee: bigint | undefined;
}

export function ResolveGame({
  isFull,
  gameResolved,
  nebulaFee,
}: ResolveGameProps) {
  const { resolve, isPending, error, note, txHash } = useResolveGame();
  const [copied, setCopied] = useState(false);

  const canResolve = isFull && !gameResolved && !!nebulaFee;

  async function copyNote() {
    if (!note) return;
    await navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-lg font-semibold">Resolver Jogo</h3>
      <p className="text-sm text-gray-400">
        Gera um commitment, deposita no Nebula Pool e salva a nota no browser.
      </p>

      <button
        onClick={() => nebulaFee && resolve(nebulaFee)}
        disabled={!canResolve || isPending}
        className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Processando...' : 'Resolver Jogo'}
      </button>

      {txHash && (
        <p className="text-sm text-emerald-400">
          Tx:{' '}
          <a
            href={`https://testnet.snowtrace.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 10)}...
          </a>
        </p>
      )}

      {note && (
        <div className="space-y-2 rounded-lg border border-yellow-600/50 bg-yellow-900/10 p-4">
          <p className="text-sm font-bold text-yellow-400">
            IMPORTANTE: Copie e salve esta nota! Ela é necessária para sacar o prêmio.
            Se acessar de outro PC/browser, precisará importá-la.
          </p>
          <textarea
            readOnly
            value={note}
            className="w-full rounded bg-gray-800 p-2 font-mono text-xs text-gray-300"
            rows={3}
          />
          <button
            onClick={copyNote}
            className="w-full rounded-lg border border-yellow-600 px-4 py-2 text-sm font-semibold text-yellow-400 transition hover:bg-yellow-900/20"
          >
            {copied ? 'Copiado!' : 'Copiar Nota'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error.message.slice(0, 200)}</p>
      )}
    </div>
  );
}
