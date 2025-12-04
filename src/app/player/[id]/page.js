// src/app/player/[id]/page.js
import { players } from '@/data/players';
import Link from 'next/link';
import Image from 'next/image';

// Cette fonction génère la page. "params" contient l'id de l'URL.
export default async function PlayerPage({ params }) {
  // 1. On récupère l'ID depuis l'URL (ex: '1')
  // Note: Dans les versions récentes de Next.js, params peut être une Promise, on l'attend.
  const { id } = await params;

  // 2. On cherche le joueur correspondant dans notre "Base de données"
  const player = players.find((p) => p.id.toString() === id);

  // 3. Gestion d'erreur (Si l'ID n'existe pas)
  if (!player) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Joueur introuvable 404</h1>
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // 4. Affichage de la page Profil
  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white font-sans">
      {/* Bouton Retour */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-slate-400 hover:text-white transition-colors"
        >
          ← Retour à la recherche
        </Link>
      </div>

      <div className="max-w-6xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <div className="flex flex-col md:flex-row">
          
          {/* COLONNE GAUCHE : La Carte & Info Générales */}
          <div className="w-full md:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-700">
            <div className="relative w-64 h-80 mb-6 transform hover:scale-105 transition-transform duration-500">
               {/* On réutilise l'image du joueur mais en plus grand */}
               <img src={player.image} alt={player.name} className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
            
            <h1 className="text-4xl font-black text-center mb-2 uppercase tracking-wide">{player.name}</h1>
            <div className="flex items-center gap-4 mt-2">
                <img src={player.club_img} alt="Club" className="w-10 h-10 bg-white rounded-full p-1" />
                <img src={player.nation_img} alt="Nation" className="w-10 h-10 bg-white rounded-full p-1" />
            </div>
            
            <div className="mt-8 w-full">
                <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl mb-2">
                    <span className="text-slate-400 font-bold">Note Générale</span>
                    <span className="text-3xl font-black text-yellow-400">{player.rating}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/50 p-4 rounded-xl">
                    <span className="text-slate-400 font-bold">Prix actuel</span>
                    <span className="text-2xl font-bold text-green-400">{player.price}</span>
                </div>
            </div>
          </div>

          {/* COLONNE DROITE : Les Stats Détaillées */}
          <div className="w-full md:w-2/3 p-8 md:p-12">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-purple-400 mb-1">Analyse Meta IA</h2>
                    <p className="text-slate-400 text-sm">Basé sur le moteur de jeu actuel</p>
                </div>
                <div className="bg-purple-600 px-6 py-3 rounded-2xl shadow-lg shadow-purple-500/20">
                    <span className="block text-xs uppercase font-bold text-purple-200">Meta Score</span>
                    <span className="text-3xl font-black">{player.meta_score}</span>
                </div>
            </div>

            {/* Grille des Stats */}
            <h3 className="text-xl font-bold mb-6 text-slate-200 border-l-4 border-yellow-500 pl-3">Statistiques In-Game</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Object.entries(player.stats).map(([key, value]) => (
                    <div key={key} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-slate-400 font-bold uppercase text-sm">{key}</span>
                            <span className={`text-2xl font-black ${value >= 90 ? 'text-green-400' : value >= 80 ? 'text-green-200' : 'text-yellow-200'}`}>
                                {value}
                            </span>
                        </div>
                        {/* Barre de progression visuelle */}
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${value >= 90 ? 'bg-green-500' : value >= 80 ? 'bg-green-300' : 'bg-yellow-400'}`} 
                                style={{ width: `${value}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 p-6 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                <h4 className="font-bold text-blue-300 mb-2">💡 Conseil du Coach IA</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                    Ce joueur possède un Meta Score de <strong className="text-white">{player.meta_score}</strong>. 
                    {player.stats.pac > 90 ? " Sa vitesse est un atout majeur pour déborder les défenses." : " Il compense sa vitesse par un excellent placement."}
                    {player.stats.def > 80 ? " C'est un roc défensif indispensable." : ""}
                    {player.price.includes("M") ? " C'est un investissement 'End Game' pour les équipes d'élite." : " Un excellent rapport qualité/prix pour commencer."}
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}