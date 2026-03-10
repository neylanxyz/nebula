export const dynamic = 'force-dynamic';

import { GameListPage } from '@/components/GameListPage';

export default function HomePage() {
  return (
    <main className="min-h-screen p-4 sm:p-8">
      <GameListPage />
    </main>
  );
}
