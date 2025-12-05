// src/components/SquadBuilder.js
'use client';

import { useState } from 'react';
import { players } from '@/data/players';
// On importe l'algo qu'on a créé tout à l'heure pour calculer le score en direct
import { calculateMetaScore } from '@/utils/aiLogic'; 

export default function SquadBuilder() {
  // --- CONFIGURATION DU TERRAIN ---
  const initialSquad = [
    { id: 'gk', position: 'G', player: null, x: 50, y: 88 },
    { id: 'lb', position: 'DG', player: null, x: 15, y: 70 },
    { id: 'lcb', position: 'DC', player: null, x: 38, y: 75 },
    { id: 'rcb', position: 'DC', player: null, x: 62, y: 75 },
    { id: 'rb', position: 'DD', player: null, x: 85, y: 70 },
    { id: 'lcm', position: 'MC', player: null, x: 30, y: 50 },
    { id: 'cm', position: 'MC', player: null, x: 50, y: 55 },
    { id: 'rcm', position: 'MC', player: null, x: 70, y: 50 },
    { id: 'lw', position: 'AG', player: null, x: 15, y: 20 },
    { id: 'st', position: 'BU', player: null, x: 50, y: 15 },
    { id: 'rw', position: 'AD', player: null, x: 85, y: 20 },
  ];

  const [squad, setSquad] = useState(initialSquad);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // --- OUTILS MATHÉMATIQUES ---

  // Transforme "3.2M" en 3200000
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const clean = priceStr.toUpperCase().replace(/[^0-9.KM]/g, ""); // Nettoie
    let value = parseFloat(clean);
    if (priceStr.includes('M')) value *= 1000000;
    else if (priceStr.includes('K')) value *= 1000;
    return value;
  };

  // Transforme 3200000 en "3.2M"
  const formatPrice = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  // --- CALCULS DES STATS DE L'ÉQUIPE ---
  
  // On récupère uniquement les slots qui ont un vrai joueur
  const activePlayers = squad.filter(slot => slot.player !== null);
  const playerCount = activePlayers.length;

  // 1. Prix Total
  const totalPriceRaw = activePlayers.reduce((total, slot) => total + parsePrice(slot.player.price), 0);
  const totalPriceDisplay = formatPrice(totalPriceRaw);

  // 2. Note Moyenne (Rating)
  const avgRating = playerCount > 0 
    ? (activePlayers.reduce((total, slot) => total + slot.player.rating, 0) / playerCount).toFixed(0) 
    : 0;

  // 3. Meta Score Moyen (IA)
  const avgMetaScore = playerCount > 0
    ? (activePlayers.reduce((total, slot) => total + parseFloat(calculateMetaScore(slot.player)), 0) / playerCount).toFixed(1)
    : 0;


  // --- GESTION DU CLIC ---
  const handlePlayerSelect = (player) => {
    const newSquad = squad.map((slot) => {
      if (slot.id === selectedSlot) {
        return { ...slot, player: player };
      }
      return slot;
    });
    setSquad(newSquad);
    setSelectedSlot(null);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
        
      {/* --- NOUVEAU : LE TABLEAU DE BORD --- */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 shadow-xl flex justify-between items-center text-white">
        
        {/* Prix Total */}
        <div className="text-center w-1/3 border-r border-slate-700">
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Prix Est.</p>
            <p className="text-2xl font-black text-yellow-400">{totalPriceDisplay}</p>
        </div>

        {/* Note Moyenne */}
        <div className="text-center w-1/3 border-r border-slate-700">
            <p className="text-slate-400 text-xs uppercase font-bold mb-1">Note Moy.</p>
            <div className="flex justify-center items-baseline gap-1">
                <span className="text-2xl font-black">{avgRating}</span>
                <span className="text-slate-500 text-xs">/ 99</span>
            </div>
        </div>

        {/* Score IA */}
        <div className="text-center w-1/3">
            <p className="text-purple-400 text-xs uppercase font-bold mb-1">Meta Score</p>
            <div className="flex justify-center items-center gap-2">
                <span className="text-2xl font-black text-white">{avgMetaScore}</span>
                {/* Petite pastille de couleur selon la note */}
                <span className={`w-3 h-3 rounded-full ${avgMetaScore >= 9 ? 'bg-green-500' : avgMetaScore >= 7 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
            </div>
        </div>

      </div>

      {/* --- LE TERRAIN (Inchangé visuellement) --- */}
      <div className="h-[600px] bg-green-800 rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30 top-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full"></div>
        <div className="absolute top-0 left-1/4 right-1/4 h-16 border-b-2 border-l-2 border-r-2 border-white/30"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-t-2 border-l-2 border-r-2 border-white/30"></div>

        {squad.map((slot) => (
            <div
            key={slot.id}
            onClick={() => setSelectedSlot(slot.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform z-10"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
            <div className={`w-16 h-20 rounded-lg flex items-center justify-center border-2 shadow-lg overflow-hidden ${slot.player ? 'bg-slate-900 border-purple-500' : 'bg-slate-900/80 border-slate-600 hover:border-yellow-400'}`}>
                {slot.player ? (
                <img src={slot.player.image} alt={slot.player.name} className="w-full h-full object-contain p-1"/>
                ) : (
                <span className="text-slate-400 font-bold text-xl group-hover:text-yellow-400">+</span>
                )}
            </div>
            
            <div className="mt-1 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase truncate max-w-[80px]">
                {slot.player ? slot.player.name : slot.position}
            </div>
            </div>
        ))}
      </div>

      {/* --- LA MODALE (Inchangée) --- */}
      {selectedSlot && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <h3 className="text-xl font-bold text-white">Sélectionner un joueur</h3>
                <button 
                    onClick={() => setSelectedSlot(null)}
                    className="text-slate-400 hover:text-white"
                >
                    Fermer ✕
                </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {players.map((player) => (
                    <div 
                        key={player.id}
                        onClick={() => handlePlayerSelect(player)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-900/30 border border-transparent hover:border-purple-500 cursor-pointer transition-all"
                    >
                        <img src={player.image} alt={player.name} className="w-10 h-10 object-contain bg-slate-800 rounded-md" />
                        <div>
                            <p className="font-bold text-white text-sm">{player.name}</p>
                            <div className="flex gap-2 text-xs text-slate-400">
                                <span className="text-yellow-400 font-bold">{player.rating}</span>
                                <span>{player.position}</span>
                                <span>{player.price}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}