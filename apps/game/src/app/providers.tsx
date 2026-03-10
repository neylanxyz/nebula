'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Toaster } from 'sonner';
import { useState, type ReactNode } from 'react';
import { config } from '@/config/wagmi';

import '@rainbow-me/rainbowkit/styles.css';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: { background: '#111827', border: '1px solid #1f2937', color: '#f9fafb' },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
