'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { calculateMetaScore } from '@/utils/aiLogic';
import PlayerRadar from '@/components/PlayerRadar';
import { parseCSV, normalizePlayer } from '@/utils/csvParsing';

export default function PlayerPage({ params }) {
  // Unwrap params using React.use() if available, or just treat as promise
  // Safe handling for Next.js 15+ where params is a Promise
  const [unwrappedParams, setUnwrappedParams] = useState(null);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Unwrap params
    Promise.resolve(params).then(p => setUnwrappedParams(p));
  }, [params]);

  useEffect(() => {
    if (!unwrappedParams) return;

    const loadData = async () => {
      try {
        setLoading(true);
        // Load full DB - cached by browser mostly
        const rawData = await parseCSV('/data/EAFC26.csv');
        const players = rawData.map((row, index) => normalizePlayer(row, index));

        const found = players.find((p) => p.id.toString() === unwrappedParams.id);

        if (found) {
          setPlayer(found);
        } else {
          setError("Joueur introuvable in database");
        }
      } catch (err) {
        console.error(err);
        setError("Erreur chargement données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [unwrappedParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-xl font-bold">Scouting player...</p>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Player not found (404)</h1>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">Back to Home</Link>
      </div>
    );
  }

  const metaScore = calculateMetaScore(player);

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">← Back to Search</Link>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row">

          {/* LEFT COLUMN: Card + RADAR */}
          <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-700">

            <div className="relative w-64 h-80 mb-2 transform hover:scale-105 transition-transform duration-500 z-10">
              <img src={player.image} alt={player.name} className="w-full h-full object-contain drop-shadow-2xl" />
            </div>

            {/* RADAR */}
            <div className="w-full h-[300px] mt-[-20px] pt-4">
              <PlayerRadar stats={player.stats} />
            </div>

            <div className="w-full mt-4 space-y-2">
              <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-sm">Rating</span>
                <span className="text-3xl font-black text-yellow-400">{player.rating}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-bold uppercase text-sm">Price</span>
                <span className="text-2xl font-black text-green-400">{player.price}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Details & Stats */}
          <div className="w-full md:w-2/3 p-8 md:p-12 bg-[#0f172a]">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{player.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <img src={player.club_img} className="w-6 h-6 object-contain" title={player.club} />
                    <span className="text-sm font-bold text-slate-300">{player.club}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <img src={player.nation_img} className="w-6 h-6 object-contain" title={player.nation} />
                    <span className="text-sm font-bold text-slate-300">{player.nation}</span>
                  </div>
                  <span className="text-slate-500 font-bold text-sm tracking-widest uppercase">{player.league}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-6 py-4 rounded-2xl shadow-xl shadow-purple-900/50 text-center transform rotate-2 border border-purple-400/30">
                <span className="block text-[10px] uppercase font-bold text-purple-100 tracking-widest mb-1">AI Score</span>
                <span className="text-4xl font-black text-white">{metaScore}</span>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-6 text-white border-l-4 border-purple-500 pl-4">Detailed Stats</h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(player.stats).map(([key, value]) => (
                <div key={key} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider group-hover:text-slate-300 transition-colors">{key}</span>
                    <span className={`text-lg font-black ${value >= 90 ? 'text-green-400' : value >= 80 ? 'text-green-200' : 'text-slate-200'}`}>
                      {value}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${value >= 90 ? 'bg-green-500' : value >= 80 ? 'bg-green-300' : 'bg-yellow-500'}`} style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-slate-500 text-sm">
              <p>Games: {player.games} | Goals: {player.goals} | Assists: {player.assists}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}