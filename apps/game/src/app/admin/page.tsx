'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useIsOwner } from '@/hooks/useIsOwner';
import { AdminPanel } from '@/components/AdminPanel';

const DEV_SIMULATE_OWNER =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_DEV_SIMULATE_OWNER === 'true';

export default function AdminPage() {
  const { isConnected } = useAccount();
  const { isOwner, isLoading } = useIsOwner();

  if (DEV_SIMULATE_OWNER) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <p className="mb-4 rounded bg-yellow-900/40 px-3 py-1 text-xs text-yellow-400">
          DEV — simulando owner conectado
        </p>
        <AdminPanel />
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-bold">Admin — Conecte sua wallet</h1>
        <ConnectButton />
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <p className="text-gray-400">Verificando permissões...</p>
      </main>
    );
  }

  if (!isOwner) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <h1 className="text-2xl font-bold text-red-400">Acesso negado</h1>
        <p className="text-gray-400">
          Apenas o owner do contrato pode acessar esta página.
        </p>
        <ConnectButton />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <AdminPanel />
    </main>
  );
}
