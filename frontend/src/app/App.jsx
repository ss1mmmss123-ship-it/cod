import { LobbyPanel } from '../features/lobby/LobbyPanel.jsx';
import { GameTable } from '../features/game/GameTable.jsx';
import { WalletPanel } from '../features/wallet/WalletPanel.jsx';
import { Leaderboard } from '../features/leaderboard/Leaderboard.jsx';
import { ProfileCard } from '../features/profile/ProfileCard.jsx';

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">DurakChain</h1>
        <WalletPanel />
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <section className="xl:col-span-1"><LobbyPanel /></section>
        <section className="xl:col-span-2"><GameTable /></section>
        <section className="xl:col-span-1 space-y-4">
          <ProfileCard />
          <Leaderboard />
        </section>
      </main>
    </div>
  );
}
