'use client'; 

import { useState } from 'react';
import PlayerCard from '@/components/PlayerCard';
import { players } from '@/data/players.js';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  // --- 1. La fonction magique pour nettoyer le texte ---
  const normalizeText = (text) => {
    return text
      .normalize("NFD")                // Sépare la lettre de l'accent (é devient e + ')
      .replace(/[\u0300-\u036f]/g, "") // Supprime les traces d'accents
      .toLowerCase();                  // Met tout en minuscule
  };

  // --- 2. Le filtre amélioré ---
  // On compare la version "propre" du nom avec la version "propre" de la recherche
  const filteredPlayers = players.filter((player) =>
    normalizeText(player.name).includes(normalizeText(searchTerm))
  );

  return (
    <main className="min-h-screen bg-[#0f172a] p-8 font-sans">
      <header className="mb-12 text-center flex flex-col items-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 tracking-tighter">
          FUTIA
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Base de données & Analyse IA (12 Joueurs)
        </p>

        {/* Barre de recherche */}
        <div className="relative w-full max-w-md group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            
            <input 
              type="text" 
              placeholder="Chercher un joueur (ex: Theo, Mbappe)..." 
              className="relative w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-4 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div className="absolute right-4 top-4 text-slate-500 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
      </header>

      {/* Grille des résultats */}
      <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto transition-all duration-500">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-10 animate-pulse">
            <p className="text-2xl font-bold">Aucun joueur trouvé 😢</p>
            <p className="text-md mt-2">Essaie "Saliba" ou "De Bruyne"</p>
          </div>
        )}
      </div>

      <div className="mt-20 text-center border-t border-slate-800 pt-8 text-slate-600 text-sm">
        Futia V1 - Projet Next.js
      </div>
    </main>
  );
}