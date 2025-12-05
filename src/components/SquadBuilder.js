// src/components/SquadBuilder.js
'use client';

import { useState, useMemo, useEffect } from 'react';
import { players } from '@/data/players';
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
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [modalSearch, setModalSearch] = useState(""); // NOUVEAU : Recherche dans la modale
  const [isLoaded, setIsLoaded] = useState(false);

  // --- SAUVEGARDE AUTOMATIQUE ---
  useEffect(() => {
    const savedSquad = localStorage.getItem('futia-squad-v1');
    if (savedSquad) {
      try { setSquad(JSON.parse(savedSquad)); } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('futia-squad-v1', JSON.stringify(squad));
  }, [squad, isLoaded]);

  const handleResetSquad = () => {
    if (confirm("Voulez-vous vraiment effacer votre équipe ?")) {
      setSquad(initialSquad);
      localStorage.removeItem('futia-squad-v1');
    }
  };

  // --- LOGIQUE ---
  const positionMapping = {
    'G': ['G'],
    'DG': ['DG', 'DLG'],
    'DD': ['DD', 'DLD'],
    'DC': ['DC'],
    'MC': ['MC', 'MDC', 'MOC'],
    'MDC': ['MDC', 'MC'],
    'MOC': ['MOC', 'MC', 'AT'],
    'AG': ['AG', 'AVG', 'MG'],
    'AD': ['AD', 'AVD', 'MD'],
    'BU': ['BU', 'AT', 'AC']
  };

  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    const clean = priceStr.toUpperCase().replace(/[^0-9.KM]/g, "");
    let value = parseFloat(clean);
    if (priceStr.includes('M')) value *= 1000000;
    else if (priceStr.includes('K')) value *= 1000;
    return value;
  };

  const formatPrice = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  // --- CALCULS ---
  const { totalPriceDisplay, avgRating, avgMetaScore } = useMemo(() => {
    const activePlayers = squad.filter(slot => slot.player !== null);
    const count = activePlayers.length;

    const totalRaw = activePlayers.reduce((sum, slot) => sum + parsePrice(slot.player.price), 0);
    const avgRat = count > 0 ? (activePlayers.reduce((sum, slot) => sum + slot.player.rating, 0) / count).toFixed(0) : 0;
    const avgMeta = count > 0 ? (activePlayers.reduce((sum, slot) => sum + parseFloat(calculateMetaScore(slot.player)), 0) / count).toFixed(1) : 0;

    return { totalPriceDisplay: formatPrice(totalRaw), avgRating: avgRat, avgMetaScore: avgMeta };
  }, [squad]);

  // --- FILTRE AMÉLIORÉ (Poste + Recherche Texte) ---
  const availablePlayers = useMemo(() => {
    if (!selectedSlot) return [];
    
    const currentSlotObj = squad.find(s => s.id === selectedSlot);
    if (!currentSlotObj) return [];

    // 1. Filtrer par poste (sauf si "Voir tout")
    let filtered = players;
    if (!showAllPlayers) {
        const allowedPositions = positionMapping[currentSlotObj.position] || [];
        filtered = filtered.filter(player => allowedPositions.includes(player.position));
    }

    // 2. NOUVEAU : Filtrer par texte (si recherche)
    if (modalSearch) {
        const searchLower = modalSearch.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower));
    }
    
    return filtered;
  }, [selectedSlot, showAllPlayers, modalSearch, squad]); // Ajout de modalSearch aux dépendances

  const handlePlayerSelect = (player) => {
    const newSquad = squad.map((slot) => {
      if (slot.id === selectedSlot) {
        return { ...slot, player: player };
      }
      return slot;
    });
    setSquad(newSquad);
    closeModal(); // On utilise une fonction pour fermer proprement
  };

  const closeModal = () => {
    setSelectedSlot(null);
    setModalSearch(""); // On vide la recherche quand on ferme
    setShowAllPlayers(false);
  };

  if (!isLoaded) return <div className="h-[600px] w-full max-w-2xl mx-auto bg-green-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
        
      {/* DASHBOARD */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 shadow-xl text-white">
        <div className="flex justify-between items-center">
            <div className="flex w-full">
                <div className="text-center w-1/3 border-r border-slate-700 px-2">
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Prix</p>
                    <p className="text-xl font-black text-yellow-400">{totalPriceDisplay}</p>
                </div>
                <div className="text-center w-1/3 border-r border-slate-700 px-2">
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Note</p>
                    <span className="text-xl font-black">{avgRating}</span>
                </div>
                <div className="text-center w-1/3 px-2">
                    <p className="text-purple-400 text-[10px] uppercase font-bold mb-1">Meta</p>
                    <div className="flex justify-center items-center gap-1">
                        <span className="text-xl font-black">{avgMetaScore}</span>
                        <span className={`w-2 h-2 rounded-full ${avgMetaScore >= 9 ? 'bg-green-500' : avgMetaScore >= 7 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                    </div>
                </div>
            </div>
            <button onClick={handleResetSquad} className="ml-4 p-2 bg-red-900/30 hover:bg-red-600 rounded-lg text-red-400 hover:text-white transition-colors">
                🗑️
            </button>
        </div>
      </div>

      {/* TERRAIN */}
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

      {/* MODALE AVEC RECHERCHE */}
      {selectedSlot && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Header Modale */}
            <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
                <div className="w-full mr-4">
                    <h3 className="text-sm font-bold text-slate-400 mb-2">
                        Poste : <span className="text-yellow-400 text-lg">{squad.find(s => s.id === selectedSlot)?.position}</span>
                    </h3>
                    
                    {/* BARRE DE RECHERCHE DANS LA MODALE */}
                    <input 
                        type="text" 
                        placeholder="Chercher..." 
                        autoFocus
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                        value={modalSearch}
                        onChange={(e) => setModalSearch(e.target.value)}
                    />
                    
                    <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showAllPlayers}
                            onChange={(e) => setShowAllPlayers(e.target.checked)}
                            className="rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                        />
                        Ignorer le poste
                    </label>
                </div>
                <button onClick={closeModal} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">✕</button>
            </div>

            {/* Liste filtrée */}
            <div className="overflow-y-auto flex-1 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {availablePlayers.length > 0 ? (
                    availablePlayers.map((player) => (
                        <div key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-900/30 border border-transparent hover:border-purple-500 cursor-pointer transition-all">
                            <img src={player.image} alt={player.name} className="w-10 h-10 object-contain bg-slate-800 rounded-md" />
                            <div className="flex-1">
                                <p className="font-bold text-white text-sm">{player.name}</p>
                                <div className="flex gap-2 text-xs text-slate-400">
                                    <span className="text-yellow-400 font-bold">{player.rating}</span>
                                    <span className="text-slate-300 font-semibold">{player.position}</span>
                                    <span>{player.price}</span>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${parseFloat(calculateMetaScore(player)) >= 9 ? 'bg-green-900 text-green-300' : 'bg-slate-800 text-slate-400'}`}>{calculateMetaScore(player)}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-slate-500 py-10">
                        <p>Aucun joueur trouvé.</p>
                        {modalSearch && <p className="text-xs mt-1">Essaie avec un autre nom.</p>}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}