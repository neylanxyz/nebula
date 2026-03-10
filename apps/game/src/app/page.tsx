export const dynamic = 'force-dynamic';

import { GameListPage } from '@/components/GameListPage';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <GameListPage />
    </main>
  );
}
