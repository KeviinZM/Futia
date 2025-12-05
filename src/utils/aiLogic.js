// src/utils/aiLogic.js

export function calculateMetaScore(player) {
    // 1. Si on n'a que les stats de base (résumé), on fait une estimation grossière
    if (!player.detailedStats) {
      return calculateBasicScore(player);
    }
  
    // 2. Si on a les stats détaillées, on lance l'algorithme précis
    const stats = player.detailedStats;
    let score = 0;
  
    // --- LOGIQUE SELON LE POSTE ---
    // On adapte le calcul selon si c'est un attaquant, un défenseur, etc.
    switch (player.position) {
      
      case "BU": // BUTEUR
      case "AT":
      case "AG":
      case "AD":
        // Pour un attaquant : Finition, Vitesse et Calme sont prioritaires
        score = (
          (stats.finishing || 80) * 0.25 +
          (stats.sprint_speed || 80) * 0.20 +
          (stats.agility || 75) * 0.15 +
          (stats.composure || 75) * 0.15 +
          (stats.shot_power || 80) * 0.10 +
          (stats.positioning || 80) * 0.15
        );
        break;
  
      case "DC": // DÉFENSEUR CENTRAL
      case "DG":
      case "DD":
        // Pour un défenseur : Lucidité défensive, Tacle et Vitesse
        score = (
          (stats.def_awareness || 80) * 0.30 +
          (stats.standing_tackle || 80) * 0.20 +
          (stats.strength || 80) * 0.15 +
          (stats.sprint_speed || 70) * 0.15 +
          (stats.reactions || 80) * 0.10 +
          (stats.aggression || 75) * 0.10
        );
        break;
  
      case "MC": // MILIEU
      case "MOC":
      case "MDC":
        // Le milieu doit être complet : Passe, Vision, Contrôle
        score = (
          (stats.short_passing || 80) * 0.20 +
          (stats.vision || 80) * 0.15 +
          (stats.ball_control || 80) * 0.15 +
          (stats.interceptions || 70) * 0.15 +
          (stats.stamina || 80) * 0.15 +
          (stats.strength || 75) * 0.20
        );
        break;
        
      case "G": // GARDIEN (Cas particulier, on utilise les stats de base car pas de détails pertinents)
         const s = player.stats;
         score = (s.dri * 0.3) + (s.han * 0.3) + (s.pos * 0.2) + (s.kic * 0.1) + (s.spe * 0.1); 
         // Note: 'dri' est souvent utilisé pour 'Diving' (Plongeon) sur les cartes gardien dans les API simplifiées
         // Si tu n'as pas les stats détaillées GK, on renvoie une note basée sur le rating global
         return (player.rating / 10).toFixed(1);
  
      default:
        score = 85; // Valeur par défaut
    }
  
    // Bonus PlayStyles (optionnel)
    if (player.playstyles) {
      score += player.playstyles.length * 0.2; 
    }
  
    // On retourne une note sur 10 (ex: 9.4)
    // On s'assure que ça ne dépasse pas 10
    const finalScore = Math.min(score / 10, 9.9);
    return finalScore.toFixed(1);
  }
  
  // Fonction de secours (si on a que les 6 stats de la carte)
  function calculateBasicScore(player) {
    const s = player.stats;
    if (!s) return "8.0"; // Sécurité si pas de stats du tout
  
    let score = 0;
  
    if (["BU", "AG", "AD", "AT"].includes(player.position)) {
      score = (s.pac * 0.4) + (s.sho * 0.4) + (s.dri * 0.2);
    } else if (["DC", "DG", "DD", "DLG", "DLD"].includes(player.position)) {
      score = (s.def * 0.4) + (s.phy * 0.4) + (s.pac * 0.2);
    } else {
      // Milieux
      score = (s.pas * 0.3) + (s.dri * 0.3) + (s.def * 0.2) + (s.phy * 0.2);
    }
    
    return (score / 10).toFixed(1);
  }