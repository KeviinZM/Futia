// src/components/PlayerCard.js
import Link from 'next/link';

export default function PlayerCard({ player }) {
  return (
    // On enveloppe toute la carte dans un Link qui pointe vers la page dynamique
    <Link href={`/player/${player.id}`} className="block">
        <div className="relative group w-64 h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700 shadow-xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-purple-500/50 hover:border-purple-500 cursor-pointer">
        
        {/* Background Decoratif */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600 blur-3xl opacity-20 rounded-full"></div>

        {/* Infos Haut Gauche */}
        <div className="absolute top-4 left-4 z-10 text-white">
            <div className="text-3xl font-black">{player.rating}</div>
            <div className="text-xl font-bold text-center text-slate-300">{player.position}</div>
            <div className="mt-2 space-y-1">
                <div className="w-6 h-6 bg-white rounded-full overflow-hidden p-0.5"><img src={player.nation_img} className="w-full h-full object-cover"/></div>
                <div className="w-6 h-6 bg-white rounded-full overflow-hidden p-0.5"><img src={player.club_img} className="w-full h-full object-cover"/></div>
            </div>
        </div>

        {/* Image Joueur */}
        <div className="absolute top-4 right-[-10px] w-44 h-44 z-0">
            <img src={player.image} alt={player.name} className="object-contain w-full h-full drop-shadow-2xl"/>
        </div>

        {/* Nom */}
        <div className="absolute top-48 w-full text-center z-10">
            <h2 className="text-white text-xl font-black uppercase tracking-wider truncate px-2">{player.name}</h2>
            <p className="text-yellow-400 text-sm font-bold mt-1">Prix: {player.price}</p>
        </div>

        {/* Stats Grid */}
        <div className="absolute bottom-0 w-full bg-slate-950/80 p-3 backdrop-blur-sm border-t border-slate-700">
            <div className="grid grid-cols-6 gap-1 text-center">
                <div className="flex flex-col"><span className="text-[10px] text-slate-400">PAC</span><span className="text-sm font-bold text-white">{player.stats.pac}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400">SHO</span><span className="text-sm font-bold text-white">{player.stats.sho}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400">PAS</span><span className="text-sm font-bold text-white">{player.stats.pas}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400">DRI</span><span className="text-sm font-bold text-white">{player.stats.dri}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400">DEF</span><span className="text-sm font-bold text-white">{player.stats.def}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-400">PHY</span><span className="text-sm font-bold text-white">{player.stats.phy}</span></div>
            </div>
            
            <div className="mt-2 flex justify-between items-center bg-purple-900/50 rounded px-2 py-1 border border-purple-500/30">
                <span className="text-xs text-purple-200 uppercase font-semibold">AI Meta Score</span>
                <span className="text-sm font-bold text-green-400">{player.meta_score}</span>
            </div>
        </div>
        </div>
    </Link>
  );
}