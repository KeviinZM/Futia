'use client';

import { useState, useEffect } from 'react';
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
        // Load full DB - cached by browser mostly (force reload with timestamp)
        const rawData = await parseCSV(`/data/EAFC26.csv?v=${Date.now()}`);
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
                <span className="text-slate-400 font-bold uppercase text-sm">Price</span>
                <span className="text-2xl font-black text-green-400">{player.price}</span>
              </div>

              {/* BIO INFO GRID */}
              <div className="grid grid-cols-2 gap-2 w-full pt-4">
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Skills</span>
                  <span className="text-yellow-400 font-bold text-sm">
                    {'★'.repeat(player.info?.skillMoves || 0)}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">W. Foot</span>
                  <span className="text-yellow-400 font-bold text-sm">
                    {'★'.repeat(player.info?.weakFoot || 0)}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Foot</span>
                  <span className="text-white font-bold text-sm">{player.info?.foot}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Age</span>
                  <span className="text-white font-bold text-sm">{player.info?.age}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Height</span>
                  <span className="text-white font-bold text-sm">{player.info?.height}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Weight</span>
                  <span className="text-white font-bold text-sm">{player.info?.weight}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 text-center">
                  <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Alt Pos</span>
                  <span className="text-white font-bold text-sm">
                    {player.altPositions && player.altPositions.length > 0 ? player.altPositions.join(', ') : '-'}
                  </span>
                </div>
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



            {/* Playstyles Section */}
            {player.playstyles && player.playstyles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-white border-l-4 border-purple-500 pl-4">Playstyles</h3>
                <div className="flex flex-wrap gap-3">
                  {player.playstyles.map((style, index) => {
                    const isPlus = style.includes('+');
                    return (
                      <span
                        key={index}
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105 ${isPlus
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 shadow-[0_0_10px_-2px_rgba(234,179,8,0.3)]"
                          : "bg-slate-800 text-slate-300 border border-slate-600"
                          }`}
                      >
                        {style}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold mb-6 text-white border-l-4 border-purple-500 pl-4">Detailed Stats</h3>

            {/* Stats Grid */}
            {/* Detailed Stats Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mapping categories: mapping standard names to the detailedStats keys */}
              {[
                { label: "Pace", key: "pace", short: "PAC", statKey: "pac", color: "text-blue-400", bar: "bg-blue-500" },
                { label: "Shooting", key: "shooting", short: "SHO", statKey: "sho", color: "text-green-400", bar: "bg-green-500" },
                { label: "Passing", key: "passing", short: "PAS", statKey: "pas", color: "text-orange-400", bar: "bg-orange-500" },
                { label: "Dribbling", key: "dribbling", short: "DRI", statKey: "dri", color: "text-purple-400", bar: "bg-purple-500" },
                { label: "Defending", key: "defending", short: "DEF", statKey: "def", color: "text-red-400", bar: "bg-red-500" },
                { label: "Physical", key: "physical", short: "PHY", statKey: "phy", color: "text-yellow-400", bar: "bg-yellow-500" }
              ].map((category) => (
                <div key={category.key} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                  <div className={`flex justify-between items-center mb-4 border-b border-slate-700 pb-2 ${category.color}`}>
                    <h4 className="font-black uppercase tracking-widest">{category.label}</h4>
                    <span className="text-xl font-bold">{player.stats[category.statKey]}</span>
                  </div>
                  <div className="space-y-3">
                    {player.detailedStats && player.detailedStats[category.key] ? (
                      Object.entries(player.detailedStats[category.key]).map(([statName, statValue]) => (
                        <div key={statName} className="flex flex-col">
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-slate-400 text-xs font-bold uppercase">{statName}</span>
                            <span className={`text-sm font-bold ${statValue >= 90 ? 'text-green-400' : statValue >= 80 ? 'text-green-200' : 'text-white'}`}>{statValue}</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${category.bar} opacity-80`} style={{ width: `${statValue}%` }}></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs">No detailed data</p>
                    )}
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