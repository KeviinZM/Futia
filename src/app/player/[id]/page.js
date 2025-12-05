// src/app/player/[id]/page.js
import { players } from '@/data/players';
import Link from 'next/link';
import { calculateMetaScore } from '@/utils/aiLogic';
// 👇 IMPORT IMPORTANT POUR LE RADAR
import PlayerRadar from '@/components/PlayerRadar'; 

export default async function PlayerPage({ params }) {
  // Gestion de la promesse params (obligatoire en Next.js récent)
  const { id } = await params;
  const player = players.find((p) => p.id.toString() === id);

  if (!player) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Joueur introuvable 404</h1>
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">Retour à l'accueil</Link>
      </div>
    );
  }

  const metaScore = calculateMetaScore(player);

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">← Retour à la recherche</Link>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row">
          
          {/* COLONNE GAUCHE : Carte + RADAR */}
          <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-700">
            
            <div className="relative w-64 h-80 mb-2 transform hover:scale-105 transition-transform duration-500 z-10">
               <img src={player.image} alt={player.name} className="w-full h-full object-contain drop-shadow-2xl" />
            </div>

            {/* 👇 LE RADAR EST ICI 👇 */}
            <div className="w-full h-[300px] mt-[-20px] pt-4">
                <PlayerRadar stats={player.stats} />
            </div>
            
            <div className="w-full mt-4 space-y-2">
                <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold uppercase text-sm">Note Générale</span>
                    <span className="text-3xl font-black text-yellow-400">{player.rating}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold uppercase text-sm">Prix actuel</span>
                    <span className="text-2xl font-black text-green-400">{player.price}</span>
                </div>
            </div>
          </div>

          {/* COLONNE DROITE : Détails & Stats */}
          <div className="w-full md:w-2/3 p-8 md:p-12 bg-[#0f172a]">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{player.name}</h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            <img src={player.club_img} className="w-6 h-6 object-contain" title={player.club}/>
                            <span className="text-sm font-bold text-slate-300">{player.club}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            <img src={player.nation_img} className="w-6 h-6 object-contain" title={player.nation}/>
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

            <h3 className="text-xl font-bold mb-6 text-white border-l-4 border-purple-500 pl-4">Statistiques Détaillées</h3>
            
            {/* Grille des Stats Détaillées */}
            {player.detailedStats ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(player.detailedStats).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors group">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider group-hover:text-slate-300 transition-colors">{key.replace('_', ' ')}</span>
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
            ) : (
                <p className="text-slate-500 italic">Pas de stats détaillées disponibles.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}