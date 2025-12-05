// src/components/SquadBuilder.js
'use client';

import { useState, useMemo, useEffect } from 'react';
import { players } from '@/data/players';
import { calculateMetaScore } from '@/utils/aiLogic'; 
import { calculateSquadChemistry } from '@/utils/chemistryLogic'; // Import du nouveau fichier

export default function SquadBuilder() {
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
  const [modalSearch, setModalSearch] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSquad = localStorage.getItem('futia-squad-v1');
    if (savedSquad) { try { setSquad(JSON.parse(savedSquad)); } catch (e) {} }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('futia-squad-v1', JSON.stringify(squad));
  }, [squad, isLoaded]);

  const handleResetSquad = () => {
    if (confirm("Effacer l'équipe ?")) {
      setSquad(initialSquad);
      localStorage.removeItem('futia-squad-v1');
    }
  };

  const positionMapping = {
    'G': ['G'], 'DG': ['DG', 'DLG'], 'DD': ['DD', 'DLD'], 'DC': ['DC'],
    'MC': ['MC', 'MDC', 'MOC'], 'MDC': ['MDC', 'MC'], 'MOC': ['MOC', 'MC', 'AT'],
    'AG': ['AG', 'AVG', 'MG'], 'AD': ['AD', 'AVD', 'MD'], 'BU': ['BU', 'AT', 'AC']
  };

  const parsePrice = (p) => {
    if (!p) return 0;
    let v = parseFloat(p.toUpperCase().replace(/[^0-9.KM]/g, ""));
    if (p.includes('M')) v *= 1000000; else if (p.includes('K')) v *= 1000;
    return v;
  };
  const formatPrice = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(0)+'K' : n;

  // --- CALCULS (Avec Chimie) ---
  const { totalPriceDisplay, avgRating, avgMetaScore, totalChemistry, chemistryMap } = useMemo(() => {
    const activePlayers = squad.filter(slot => slot.player !== null);
    const count = activePlayers.length;

    const totalRaw = activePlayers.reduce((sum, slot) => sum + parsePrice(slot.player.price), 0);
    const avgRat = count > 0 ? (activePlayers.reduce((sum, slot) => sum + slot.player.rating, 0) / count).toFixed(0) : 0;
    const avgMeta = count > 0 ? (activePlayers.reduce((sum, slot) => sum + parseFloat(calculateMetaScore(slot.player)), 0) / count).toFixed(1) : 0;
    
    // Calcul du collectif via notre nouvelle fonction
    const { totalChemistry, chemistryMap } = calculateSquadChemistry(squad);

    return { totalPriceDisplay: formatPrice(totalRaw), avgRating: avgRat, avgMetaScore: avgMeta, totalChemistry, chemistryMap };
  }, [squad]);

  const availablePlayers = useMemo(() => {
    if (!selectedSlot) return [];
    const currentSlotObj = squad.find(s => s.id === selectedSlot);
    if (!currentSlotObj) return [];
    let filtered = players;
    if (!showAllPlayers) {
        const allowed = positionMapping[currentSlotObj.position] || [];
        filtered = filtered.filter(p => allowed.includes(p.position));
    }
    if (modalSearch) filtered = filtered.filter(p => p.name.toLowerCase().includes(modalSearch.toLowerCase()));
    return filtered;
  }, [selectedSlot, showAllPlayers, modalSearch, squad]);

  const handlePlayerSelect = (player) => {
    const newSquad = squad.map(slot => slot.id === selectedSlot ? { ...slot, player: player } : slot);
    setSquad(newSquad);
    setSelectedSlot(null); setModalSearch(""); setShowAllPlayers(false);
  };

  if (!isLoaded) return <div className="h-[600px] w-full bg-green-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      
      {/* DASHBOARD */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 shadow-xl text-white">
        <div className="flex justify-between items-center text-center">
            <div><p className="text-slate-400 text-[10px] uppercase font-bold">Prix</p><p className="text-xl font-black text-yellow-400">{totalPriceDisplay}</p></div>
            <div><p className="text-slate-400 text-[10px] uppercase font-bold">Note</p><span className="text-xl font-black">{avgRating}</span></div>
            <div>
                <p className="text-blue-400 text-[10px] uppercase font-bold">Collectif</p>
                <span className="text-xl font-black text-blue-300">{totalChemistry}<span className="text-xs text-slate-500">/33</span></span>
            </div>
            <div><p className="text-purple-400 text-[10px] uppercase font-bold">Meta</p><span className="text-xl font-black">{avgMetaScore}</span></div>
            <button onClick={handleResetSquad} className="text-red-400 hover:text-white transition">🗑️</button>
        </div>
      </div>

      {/* TERRAIN */}
      <div className="h-[600px] bg-green-800 rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden relative">
        {/* Lignes... */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30 top-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full"></div>
        <div className="absolute top-0 left-1/4 right-1/4 h-16 border-b-2 border-l-2 border-r-2 border-white/30"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-t-2 border-l-2 border-r-2 border-white/30"></div>

        {squad.map((slot) => {
            const chem = chemistryMap[slot.id] || 0; // Points de ce joueur (0, 1, 2 ou 3)
            return (
            <div key={slot.id} onClick={() => setSelectedSlot(slot.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform z-10"
            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
            
            <div className={`w-16 h-20 rounded-lg flex items-center justify-center border-2 shadow-lg overflow-hidden ${slot.player ? 'bg-slate-900 border-purple-500' : 'bg-slate-900/80 border-slate-600 hover:border-yellow-400'}`}>
                {slot.player ? <img src={slot.player.image} className="w-full h-full object-contain p-1"/> : <span className="text-slate-400 font-bold text-xl group-hover:text-yellow-400">+</span>}
            </div>
            
            {/* INDICATEUR DE COLLECTIF (LOSANGES) */}
            {slot.player && (
                <div className="absolute -bottom-2 flex gap-0.5 bg-black/50 px-1 py-0.5 rounded">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-2 h-2 transform rotate-45 border border-black ${i <= chem ? 'bg-blue-400' : 'bg-slate-600'}`}></div>
                    ))}
                </div>
            )}

            {!slot.player && (
                <div className="mt-1 bg-black/80 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase truncate max-w-[80px]">
                    {slot.position}
                </div>
            )}
            </div>
        )})}
      </div>

      {/* MODALE (Identique à avant) */}
      {selectedSlot && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-700">
                <input type="text" placeholder="Chercher..." autoFocus className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} />
                <button onClick={() => {setSelectedSlot(null); setModalSearch(""); setShowAllPlayers(false)}} className="ml-2 text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <label className="flex items-center gap-2 mb-2 text-xs text-slate-400 cursor-pointer"><input type="checkbox" checked={showAllPlayers} onChange={(e) => setShowAllPlayers(e.target.checked)} className="rounded bg-slate-800 text-purple-600"/> Ignorer poste</label>
            <div className="overflow-y-auto flex-1 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                {availablePlayers.map((player) => (
                    <div key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-900/30 border border-transparent hover:border-purple-500 cursor-pointer">
                        <img src={player.image} className="w-10 h-10 object-contain bg-slate-800 rounded-md" />
                        <div className="flex-1"><p className="font-bold text-white text-sm">{player.name}</p><div className="flex gap-2 text-xs text-slate-400"><span className="text-yellow-400 font-bold">{player.rating}</span><span className="text-slate-300">{player.position}</span><span>{player.price}</span></div></div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}