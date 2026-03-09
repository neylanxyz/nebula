'use client';

import { useState, useEffect } from 'react';
import { useWithdrawPrize } from '@/hooks/useWithdrawPrize';
import { isAddress, type Address } from 'viem';
import { NEBULA_NOTE_STORAGE_KEY } from '@/config/contracts';

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
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h3 className="text-lg font-semibold">Sacar Prêmio</h3>
      <p className="text-sm text-gray-400">
        Gera ZK proof no browser e envia o prêmio ao vencedor de forma privada.
      </p>

      {player1 && player2 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Selecione o vencedor:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setWinner(player1)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-mono transition ${
                winner.toLowerCase() === player1.toLowerCase()
                  ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              P1: {player1.slice(0, 6)}...{player1.slice(-4)}
            </button>
            <button
              onClick={() => setWinner(player2)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-mono transition ${
                winner.toLowerCase() === player2.toLowerCase()
                  ? 'border-emerald-500 bg-emerald-900/30 text-emerald-400'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              P2: {player2.slice(0, 6)}...{player2.slice(-4)}
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-gray-400">
          Ou insira o endereço manualmente:
        </label>
        <input
          type="text"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      <button
        onClick={() => withdraw(winner as Address)}
        disabled={!canWithdraw}
        className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Gerando ZK Proof...' : 'Sacar Prêmio para Vencedor'}
      </button>

      {status && (
        <p className="text-sm text-blue-400">{status}</p>
      )}

      {txHash && (
        <p className="text-sm text-emerald-400">
          Prêmio enviado! Tx:{' '}
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

      {error && (
        <p className="text-sm text-red-400">{error.message.slice(0, 200)}</p>
      )}

      {!hasNote && gameResolved && (
        <div className="space-y-3">
          <p className="text-sm text-yellow-400">
            Nota não encontrada neste browser. Importe a nota gerada no resolve:
          </p>

          {!showImport ? (
            <button
              onClick={() => setShowImport(true)}
              className="w-full rounded-lg border border-yellow-600 px-4 py-2 text-sm text-yellow-400 transition hover:bg-yellow-900/20"
            >
              Importar Nota
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={importNote}
                onChange={(e) => setImportNote(e.target.value)}
                placeholder="Cole a nota aqui (string base64)..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 font-mono text-xs text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleImportNote}
                  disabled={!importNote.trim()}
                  className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-500 disabled:opacity-50"
                >
                  Salvar Nota
                </button>
                <button
                  onClick={() => { setShowImport(false); setImportNote(''); }}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 transition hover:border-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {hasNote && (
        <p className="text-xs text-gray-500">
          Nota carregada no browser.
        </p>
      )}
    </div>
  );
}
