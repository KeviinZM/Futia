import React, { useState } from 'react';
import Papa from 'papaparse';

export default function ClubImporter() {
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState(null);

  // Fonction déclenchée quand on choisit le fichier
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true, // Pour lire les titres (Rating, Name...)
      skipEmptyLines: true,
      complete: (results) => {
        // On trie les joueurs par Note (Rating) du plus grand au plus petit
        const sortedData = results.data.sort((a, b) => parseInt(b.Rating) - parseInt(a.Rating));
        setPlayers(sortedData);
        
        // Calcul rapide de stats
        const avg = sortedData.reduce((acc, curr) => acc + parseInt(curr.Rating || 0), 0) / sortedData.length;
        setStats({ count: sortedData.length, avg: Math.round(avg) });
      },
      error: (err) => {
        console.error("Erreur CSV:", err);
      }
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-900 min-h-screen text-white">
      
      <h1 className="text-3xl font-bold text-cyan-400 mb-6 text-center">
        MON CLUB ANALYZER
      </h1>

      {/* ZONE D'UPLOAD */}
      <div className="mb-8 flex flex-col items-center">
        <label className="cursor-pointer bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-6 rounded-full transition transform hover:scale-105">
          📂 Importer mon CSV Paletools
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden" 
          />
        </label>
        
        {stats && (
          <div className="mt-4 flex gap-6 text-sm">
            <span className="bg-gray-800 px-4 py-2 rounded border border-cyan-500/30">
              Joueurs : <b className="text-cyan-400">{stats.count}</b>
            </span>
            <span className="bg-gray-800 px-4 py-2 rounded border border-yellow-500/30">
              Note Moyenne : <b className="text-yellow-400">{stats.avg}</b>
            </span>
          </div>
        )}
      </div>

      {/* GRILLE DES JOUEURS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {players.map((p, index) => (
          p.Name ? (
            <div key={index} className="relative bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3 hover:border-cyan-400 transition group">
              
              {/* Note et Position */}
              <div className="absolute top-2 left-3">
                <div className="text-2xl font-bold">{p.Rating}</div>
                <div className="text-xs text-gray-400 font-bold uppercase">{p.Position}</div>
              </div>

              {/* Indicateur Invendable */}
              {(p.Untradeable === "true" || p.Untradeable === true) && (
                <span className="absolute top-2 right-2 text-xs opacity-50">🛡️</span>
              )}

              {/* Image (Placeholder ou API EA si possible) */}
              <div className="h-20 flex justify-center items-end mb-2 mt-2">
                 {/* Si tu as l'ID, on peut tenter de charger l'image */}
                 <img 
                    src={p.Id ? `https://cdn.sofifa.net/players/${p.Id.toString().padStart(3, '0').slice(0,3)}/${p.Id.toString().padStart(3, '0').slice(3)}/25_120.png` : "https://cdn.sofifa.net/player_0.svg"}
                    alt={p.Name}
                    className="h-full object-contain"
                    onError={(e) => e.target.src = "https://cdn.sofifa.net/player_0.svg"}
                 />
              </div>

              {/* Infos Joueur */}
              <div className="text-center">
                <div className="font-bold text-yellow-500 truncate text-sm">{p.Name}</div>
                <div className="text-xs text-gray-500 truncate">{p.Club}</div>
                <div className="text-[10px] text-gray-600 truncate mt-1">{p.League}</div>
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}