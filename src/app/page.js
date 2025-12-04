// src/app/page.js
import PlayerCard from '@/compenents/PlayerCard';
import { players } from '@/data/players.js';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] p-8">
      {/* Header du site */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          NEXT GEN FUT
        </h1>
        <p className="text-slate-400 text-lg">
          L'alternative intelligente à FUTBIN. Analyse IA & Meta Data.
        </p>
      </header>

      {/* Grille des joueurs */}
      <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>

      {/* Footer / Appel à l'action */}
      <div className="mt-20 text-center border-t border-slate-800 pt-8">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors">
          + Analyser mon équipe
        </button>
      </div>
    </main>
  );
}