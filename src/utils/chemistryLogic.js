// src/utils/chemistryLogic.js

// Seuils pour gagner des points (Standard FC 25)
// Club : 2 joueurs = 1 pt, 4 = 2 pts, 7 = 3 pts
// Ligue : 3 = 1 pt, 5 = 2 pts, 8 = 3 pts
// Nation : 2 = 1 pt, 5 = 2 pts, 8 = 3 pts
const THRESHOLDS = {
    club: [2, 4, 7],
    league: [3, 5, 8],
    nation: [2, 5, 8]
  };
  
  export function calculateSquadChemistry(squad) {
    // 1. On récupère les joueurs actifs (pas les slots vides)
    const players = squad.filter(slot => slot.player !== null).map(slot => slot.player);
    
    // 2. On compte combien de joueurs pour chaque Club, Ligue, Nation
    const counts = {
      club: {},
      league: {},
      nation: {}
    };
  
    players.forEach(p => {
      counts.club[p.club] = (counts.club[p.club] || 0) + 1;
      counts.league[p.league] = (counts.league[p.league] || 0) + 1;
      counts.nation[p.nation] = (counts.nation[p.nation] || 0) + 1;
    });
  
    // 3. On calcule les points pour chaque joueur individuellement
    let totalChemistry = 0;
    
    // On crée une carte des points par Slot ID pour l'affichage (ex: { 'gk': 3, 'st': 2 })
    const chemistryMap = {};
  
    squad.forEach(slot => {
      if (!slot.player) {
        chemistryMap[slot.id] = 0;
        return;
      }
  
      const p = slot.player;
      let points = 0;
  
      // Est-il au bon poste ? (Simplifié : on vérifie juste si le poste du slot est dans la liste du joueur ?)
      // Pour l'instant on assume que le Builder ne permet de mettre les joueurs qu'au bon poste.
      // Si un joueur est hors de position, il a toujours 0.
      
      // Points Club
      const countClub = counts.club[p.club];
      if (countClub >= THRESHOLDS.club[2]) points += 3;
      else if (countClub >= THRESHOLDS.club[1]) points += 2;
      else if (countClub >= THRESHOLDS.club[0]) points += 1;
  
      // Points Ligue (si pas déjà max)
      if (points < 3) {
          const countLeague = counts.league[p.league];
          if (countLeague >= THRESHOLDS.league[2]) points += 3;
          else if (countLeague >= THRESHOLDS.league[1]) points += 2;
          else if (countLeague >= THRESHOLDS.league[0]) points += 1;
      }
  
      // Points Nation (si pas déjà max)
      if (points < 3) {
          const countNation = counts.nation[p.nation];
          if (countNation >= THRESHOLDS.nation[2]) points += 3;
          else if (countNation >= THRESHOLDS.nation[1]) points += 2;
          else if (countNation >= THRESHOLDS.nation[0]) points += 1;
      }
  
      // On plafonne à 3
      points = Math.min(points, 3);
      
      chemistryMap[slot.id] = points;
      totalChemistry += points;
    });
  
    return { totalChemistry, chemistryMap };
  }