// src/app/page.js
'use client'; 

import { useState } from 'react';
import PlayerCard from '@/components/PlayerCard';
import { players } from '@/data/players.js';

export default function Home() {
  // --- États (Mémoire) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tous"); // "Tous", "Attaquants", "Milieux", "Défenseurs"

  // --- Configuration des positions ---
  const positionCategories = {
    "Attaquants": ["BU", "AG", "AD", "AT", "AVG", "AVD"],
    "Milieux": ["MC", "MOC", "MDC", "MG", "MD"],
    "Défenseurs": ["DC", "DG", "DD", "DLG", "DLD", "G"]
  };

  // --- Fonction de normalisation (accents) ---
  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // --- Le Super Filtre (Texte + Catégorie) ---
  const filteredPlayers = players.filter((player) => {
    // 1. Filtre Texte
    const matchesSearch = normalizeText(player.name).includes(normalizeText(searchTerm));
    
    // 2. Filtre Catégorie
    let matchesCategory = true;
    if (activeFilter !== "Tous") {
      // On regarde si la position du joueur est dans la liste de la catégorie active
      // On utilise ?. car positionCategories[activeFilter] peut être undefined si bug
      matchesCategory = positionCategories[activeFilter]?.includes(player.position);
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#0f172a] p-8 font-sans">
      <header className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 tracking-tighter">
          FUTIA
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Base de données & Analyse IA (12 Joueurs)
        </p>

        {/* --- Barre de Recherche --- */}
        <div className="relative w-full max-w-md group mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <input 
              type="text" 
              placeholder="Rechercher (ex: Saliba)..." 
              className="relative w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-4 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* --- Les Boutons de Filtres --- */}
        <div className="flex flex-wrap justify-center gap-3">
          {["Tous", "Attaquants", "Milieux", "Défenseurs"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 transform hover:scale-105 ${
                activeFilter === category 
                  ? "bg-white text-slate-900 shadow-lg shadow-white/20" // Style Actif (Blanc)
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700" // Style Inactif (Sombre)
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </header>

      {/* --- Grille des Résultats --- */}
      <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto transition-all duration-500">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-10 animate-pulse">
            <p className="text-2xl font-bold">Aucun joueur trouvé 😢</p>
            <p className="text-md mt-2">Essaie de changer de filtre ou de recherche.</p>
          </div>
        )}
      </div>

      <div className="mt-20 text-center border-t border-slate-800 pt-8 text-slate-600 text-sm">
        Futia V1.1 - Projet Next.js
      </div>
    </main>
  );
}