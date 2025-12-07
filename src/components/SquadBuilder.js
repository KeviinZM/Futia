'use client';

import { useState, useMemo, useEffect } from 'react';
import { formations } from '@/data/formations';
// Calculate instant stats
import { calculateMetaScore } from '@/utils/aiLogic';
import { calculateSquadChemistry } from '@/utils/chemistryLogic';

export default function SquadBuilder({ availablePlayersList = [] }) {
  const [currentFormation, setCurrentFormation] = useState("4-3-3");

  const getInitialSquad = (formName) => {
    return formations[formName].map(slot => ({ ...slot, player: null }));
  };

  const [squad, setSquad] = useState(getInitialSquad("4-3-3"));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // --- NEW: GEMINI AI STATES ---
  const [geminiAdvice, setGeminiAdvice] = useState("");
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('futia-squad-en-v1');
    if (savedData) {
      try {
        const { squad: savedSquad, formation } = JSON.parse(savedData);
        if (formation && formations[formation]) {
          setCurrentFormation(formation);
          setSquad(savedSquad);
        }
      } catch (e) { console.error(e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('futia-squad-en-v1', JSON.stringify({ squad, formation: currentFormation }));
    }
  }, [squad, currentFormation, isLoaded]);

  // --- FUNCTION TO CALL GEMINI API ---
  const askGeminiCoach = async () => {
    setIsLoadingGemini(true);
    setGeminiAdvice("");

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squad })
      });

      const data = await response.json();
      if (data.advice) {
        setGeminiAdvice(data.advice);
      } else {
        setGeminiAdvice("Sorry, the coach is out for coffee (API Error).");
      }
    } catch (error) {
      setGeminiAdvice("Connection error with the coach.");
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const handleFormationChange = (e) => {
    const newFormName = e.target.value;
    const newLayout = formations[newFormName];
    const currentPlayers = squad.map(s => s.player).filter(p => p !== null);
    const newSquad = newLayout.map((slot, index) => {
      // Map old players to new slots if possible, otherwise reset
      return { ...slot, player: currentPlayers[index] || null };
    });
    setCurrentFormation(newFormName);
    setSquad(newSquad);
  };

  const handleResetSquad = () => {
    if (confirm("Clear squad?")) {
      setSquad(getInitialSquad(currentFormation));
      setGeminiAdvice("");
    }
  };

  // MAPPING: Squad Position -> Allowed Player Positions (ENGLISH)
  const positionMapping = {
    'GK': ['GK'],
    'LB': ['LB', 'LWB'],
    'RB': ['RB', 'RWB'],
    'CB': ['CB'],
    'LWB': ['LWB', 'LB', 'LM'],
    'RWB': ['RWB', 'RB', 'RM'],
    'CM': ['CM', 'CDM', 'CAM'],
    'CDM': ['CDM', 'CM'],
    'CAM': ['CAM', 'CM', 'CF', 'ST'],
    'LM': ['LM', 'LW', 'LWB'],
    'RM': ['RM', 'RW', 'RWB'],
    'LW': ['LW', 'LM', 'ST'],
    'RW': ['RW', 'RM', 'ST'],
    'ST': ['ST', 'CF', 'LF', 'RF'],
    'CF': ['CF', 'ST', 'CAM']
  };

  const parsePrice = (p) => {
    if (!p) return 0;
    // Check if it's a number first
    if (typeof p === 'number') return p;
    let v = parseFloat(p.toString().toUpperCase().replace(/[^0-9.KM]/g, ""));
    if (p.toString().includes('M')) v *= 1000000; else if (p.toString().includes('K')) v *= 1000;
    return v;
  };

  const formatPrice = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n;

  const { totalPriceDisplay, avgRating, avgMetaScore, totalChemistry, chemistryMap } = useMemo(() => {
    const activePlayers = squad.filter(slot => slot.player !== null);
    const count = activePlayers.length;
    const totalRaw = activePlayers.reduce((sum, slot) => sum + parsePrice(slot.player.price), 0);
    const avgRat = count > 0 ? (activePlayers.reduce((sum, slot) => sum + slot.player.rating, 0) / count).toFixed(0) : 0;
    const avgMeta = count > 0 ? (activePlayers.reduce((sum, slot) => sum + parseFloat(calculateMetaScore(slot.player)), 0) / count).toFixed(1) : 0;
    const { totalChemistry, chemistryMap } = calculateSquadChemistry(squad);

    return { totalPriceDisplay: formatPrice(totalRaw), avgRating: avgRat, avgMetaScore: avgMeta, totalChemistry, chemistryMap };
  }, [squad]);

  const availablePlayers = useMemo(() => {
    if (!selectedSlot) return [];
    const currentSlotObj = squad.find(s => s.id === selectedSlot);
    if (!currentSlotObj) return [];
    const playersInSquadIds = squad.filter(slot => slot.player !== null && slot.id !== selectedSlot).map(slot => slot.player.id);
    let filtered = availablePlayersList.filter(player => !playersInSquadIds.includes(player.id));

    if (!showAllPlayers) {
      // Use the mapping to filter suitable players
      const allowed = positionMapping[currentSlotObj.position] || [currentSlotObj.position];
      // Also allow exact match if not in mapping
      filtered = filtered.filter(p => allowed.includes(p.position) || p.position === currentSlotObj.position);
    }

    if (modalSearch) filtered = filtered.filter(p => p.name.toLowerCase().includes(modalSearch.toLowerCase()));

    // Sort by rating desc
    return filtered.sort((a, b) => b.rating - a.rating).slice(0, 100); // Limit to top 100 matches
  }, [selectedSlot, showAllPlayers, modalSearch, squad, availablePlayersList]);

  const handlePlayerSelect = (player) => {
    const newSquad = squad.map(slot => slot.id === selectedSlot ? { ...slot, player: player } : slot);
    setSquad(newSquad);
    closeModal();
  };

  const closeModal = () => { setSelectedSlot(null); setModalSearch(""); setShowAllPlayers(false); };

  if (!isLoaded) return <div className="h-[600px] w-full bg-green-900 rounded-xl animate-pulse"></div>;

  return (
    <div className="relative w-full max-w-2xl mx-auto">

      {/* DASHBOARD */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 shadow-xl text-white">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
          <label className="text-sm font-bold text-slate-400 mr-2 uppercase tracking-wide">Formation</label>
          <select value={currentFormation} onChange={handleFormationChange} className="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg block w-48 p-2.5 font-bold">
            {Object.keys(formations).map(f => (<option key={f} value={f}>{f}</option>))}
          </select>
        </div>
        <div className="flex justify-between items-center text-center">
          <div><p className="text-slate-400 text-[10px] uppercase font-bold">Price</p><p className="text-xl font-black text-yellow-400">{totalPriceDisplay}</p></div>
          <div><p className="text-slate-400 text-[10px] uppercase font-bold">Rating</p><span className="text-xl font-black">{avgRating}</span></div>
          <div><p className="text-blue-400 text-[10px] uppercase font-bold">Chemistry</p><span className="text-xl font-black text-blue-300">{totalChemistry}<span className="text-xs text-slate-500">/33</span></span></div>
          <div><p className="text-purple-400 text-[10px] uppercase font-bold">Meta</p><span className="text-xl font-black">{avgMetaScore}</span></div>
          <button onClick={handleResetSquad} className="text-red-400 hover:text-white transition bg-red-900/20 p-2 rounded-lg ml-2">🗑️</button>
        </div>
      </div>

      {/* FIELD */}
      <div className="h-[600px] bg-green-800 rounded-xl border-4 border-white/20 shadow-2xl overflow-hidden relative transition-all duration-500">
        <div className="absolute top-0 left-0 right-0 h-px bg-white/30 top-1/2"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full"></div>
        <div className="absolute top-0 left-1/4 right-1/4 h-16 border-b-2 border-l-2 border-r-2 border-white/30"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-16 border-t-2 border-l-2 border-r-2 border-white/30"></div>

        {squad.map((slot) => {
          const chem = chemistryMap[slot.id] || 0;
          return (
            <div key={slot.id} onClick={() => setSelectedSlot(slot.id)} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group hover:scale-110 transition-all duration-500 ease-in-out z-10" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              <div className={`w-16 h-20 rounded-lg flex items-center justify-center border-2 shadow-lg overflow-hidden ${slot.player ? 'bg-slate-900 border-purple-500' : 'bg-slate-900/80 border-slate-600 hover:border-yellow-400'}`}>
                {slot.player ? <img src={slot.player.image} className="w-full h-full object-contain p-1" /> : <span className="text-slate-400 font-bold text-xl group-hover:text-yellow-400">+</span>}
              </div>
              {slot.player && (<div className="absolute -bottom-3 z-20 flex gap-0.5 bg-black/80 px-1 py-0.5 rounded shadow-sm border border-white/10">{[1, 2, 3].map(i => (<div key={i} className={`w-2 h-2 transform rotate-45 border border-black ${i <= chem ? 'bg-blue-400' : 'bg-slate-600'}`}></div>))}</div>)}
              {/* Display POS in English, which is what `slot.position` effectively is if data/formations is in EN */}
              <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase truncate max-w-[80px] ${slot.player ? 'bg-black/80 text-white' : 'bg-black/60 text-yellow-400'}`}>{slot.player ? slot.player.name : slot.position}</div>
            </div>
          )
        })}
      </div>

      {/* GEMINI COACH */}
      <div className="mt-6 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
          <h3 className="flex items-center text-xl font-bold text-indigo-300">
            <span className="text-2xl mr-2">✨</span> Gemini Coach
          </h3>

          <button
            onClick={askGeminiCoach}
            disabled={isLoadingGemini}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${isLoadingGemini
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-white text-indigo-900 hover:bg-indigo-100 hover:scale-105"
              }`}
          >
            {isLoadingGemini ? "Analysis in progress..." : "Analyze my squad"}
          </button>
        </div>

        {/* Answer Zone */}
        <div className="bg-black/20 rounded-lg p-4 min-h-[100px] border border-white/5 relative z-10">
          {geminiAdvice ? (
            <div className="text-slate-200 text-sm whitespace-pre-line leading-relaxed">
              {geminiAdvice}
            </div>
          ) : (
            <p className="text-slate-400 text-sm italic text-center mt-6">
              Click "Analyze" to get tactical advice from AI.
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedSlot && (
        <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 flex flex-col">
          <div className="flex justify-between items-start mb-4 border-b border-slate-700 pb-2">
            <div className="w-full mr-4">
              <h3 className="text-sm font-bold text-slate-400 mb-2">Position: <span className="text-yellow-400 text-lg">{squad.find(s => s.id === selectedSlot)?.position}</span></h3>
              <input type="text" placeholder="Search..." autoFocus className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" value={modalSearch} onChange={(e) => setModalSearch(e.target.value)} />
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer"><input type="checkbox" checked={showAllPlayers} onChange={(e) => setShowAllPlayers(e.target.checked)} className="rounded border-slate-600 bg-slate-800 text-purple-600" /> Show all</label>
            </div>
            <button onClick={closeModal} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded">✕</button>
          </div>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {availablePlayers.length > 0 ? (availablePlayers.map((player) => (<div key={player.id} onClick={() => handlePlayerSelect(player)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-900/30 border border-transparent hover:border-purple-500 cursor-pointer transition-all group"><img src={player.image} className="w-10 h-10 object-contain bg-slate-800 rounded-md" /><div className="flex-1"><p className="font-bold text-white text-sm group-hover:text-purple-300">{player.name}</p><div className="flex gap-2 text-xs text-slate-400"><span className="text-yellow-400 font-bold">{player.rating}</span><span className="text-slate-300 font-semibold">{player.position}</span><span>{player.price}</span></div></div><span className={`text-xs font-bold px-1.5 py-0.5 rounded ${parseFloat(calculateMetaScore(player)) >= 9 ? 'bg-green-900 text-green-300' : 'bg-slate-800 text-slate-400'}`}>{calculateMetaScore(player)}</span></div>))) : (<div className="text-center text-slate-500 py-10"><p>No players found.</p></div>)}
          </div>
        </div>
      )}
    </div>
  );
}