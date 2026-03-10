'use client';

import { useState, useEffect } from 'react';
import { useWithdrawPrize } from '@/hooks/useWithdrawPrize';
import { isAddress, type Address } from 'viem';
import { NEBULA_NOTE_STORAGE_KEY } from '@/config/contracts';
import { EncryptedText } from './EncryptedText';

interface WithdrawPrizeProps {
  gameResolved: boolean | undefined;
  player1: Address | undefined;
  player2: Address | undefined;
}

export function WithdrawPrize({
  gameResolved,
  player1,
  player2,
}: WithdrawPrizeProps) {
  const [winner, setWinner] = useState('');
  const [importNote, setImportNote] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const { withdraw, isPending, status, error, txHash } = useWithdrawPrize();

  useEffect(() => {
    setHasNote(!!localStorage.getItem(NEBULA_NOTE_STORAGE_KEY));
  }, []);

  function handleImportNote() {
    const trimmed = importNote.trim();
    if (!trimmed) return;
    localStorage.setItem(NEBULA_NOTE_STORAGE_KEY, trimmed);
    setHasNote(true);
    setShowImport(false);
    setImportNote('');
  }

  const canWithdraw =
    gameResolved && hasNote && isAddress(winner) && !isPending;

  return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <div>
        <h3 className="text-base font-semibold text-white">Claim Prize</h3>
        <p className="mt-1 text-sm text-gray-400">
          Generates a ZK proof in the browser and sends the prize to the winner anonymously.
        </p>
      </div>

      {/* Winner selection */}
      {player1 && player2 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Select winner:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setWinner(player1)}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-mono transition ${
                winner.toLowerCase() === player1.toLowerCase()
                  ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              P1: {player1.slice(0, 6)}...{player1.slice(-4)}
            </button>
            <button
              onClick={() => setWinner(player2)}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-mono transition ${
                winner.toLowerCase() === player2.toLowerCase()
                  ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              P2: {player2.slice(0, 6)}...{player2.slice(-4)}
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm text-gray-400">
          Or enter address manually:
        </label>
        <input
          type="text"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 font-mono text-sm text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none"
        />
      </div>

      <button
        onClick={() => withdraw(winner as Address)}
        disabled={!canWithdraw}
        className="w-full rounded-xl bg-purple-600 px-6 py-3.5 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <EncryptedText text="GENERATING ZK PROOF..." />
        ) : (
          'Send Prize to Winner'
        )}
      </button>

      {isPending && status && (
        <div className="rounded-xl border border-[#00FFB3]/20 bg-[#00FFB3]/5 px-4 py-3">
          <EncryptedText text={status.toUpperCase()} className="text-sm" />
        </div>
      )}

      {txHash && (
        <p className="text-sm text-emerald-400">
          Prize sent! Tx:{' '}
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

      {error && (
        <p className="rounded-lg bg-red-900/20 p-3 text-sm text-red-400">
          {error.message.slice(0, 200)}
        </p>
      )}

      {/* ZK Note */}
      <div className="space-y-2 border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">
            ZK Note{' '}
            {hasNote && (
              <span className="ml-1 text-xs text-emerald-400">(loaded)</span>
            )}
          </label>
          {hasNote && (
            <button
              onClick={() => setShowImport((v) => !v)}
              className="text-xs text-gray-500 underline hover:text-gray-300"
            >
              {showImport ? 'Cancel' : 'Replace'}
            </button>
          )}
        </div>

        {(!hasNote || showImport) && (
          <div className="space-y-2">
            {!hasNote && (
              <p className="text-xs text-yellow-400">
                Note not found in this browser. Paste the note generated during resolve.
              </p>
            )}
            <textarea
              value={importNote}
              onChange={(e) => setImportNote(e.target.value)}
              placeholder="Paste your note here (base64 string)..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-2.5 font-mono text-xs text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none"
              rows={3}
            />
            <button
              onClick={handleImportNote}
              disabled={!importNote.trim()}
              className="w-full rounded-xl bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-50"
            >
              Save Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
