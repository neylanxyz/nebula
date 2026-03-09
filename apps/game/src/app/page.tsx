export const dynamic = 'force-dynamic';

import { GameLobby } from '@/components/GameLobby';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <GameLobby />
    </main>
  );
}
