// src/components/PlayerRadar.js
'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function PlayerRadar({ stats }) {
  // Transformation des données pour le format du graphique
  const data = [
    { subject: 'VITESSE', A: stats.pac, fullMark: 99 },
    { subject: 'TIR', A: stats.sho, fullMark: 99 },
    { subject: 'PASSE', A: stats.pas, fullMark: 99 },
    { subject: 'DRIBBLE', A: stats.dri, fullMark: 99 },
    { subject: 'DÉFENSE', A: stats.def, fullMark: 99 },
    { subject: 'PHYSIQUE', A: stats.phy, fullMark: 99 },
  ];

  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          {/* La toile d'araignée */}
          <PolarGrid stroke="#475569" />
          
          {/* Les labels (PAC, SHO...) */}
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 'bold' }} />
          
          {/* L'axe invisible pour l'échelle 0-99 */}
          <PolarRadiusAxis angle={30} domain={[0, 99]} tick={false} axisLine={false} />
          
          {/* La forme remplie */}
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#a855f7" // Violet Futia
            strokeWidth={3}
            fill="#a855f7"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Petit effet visuel au centre */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-purple-500/20 blur-xl rounded-full pointer-events-none"></div>
    </div>
  );
}