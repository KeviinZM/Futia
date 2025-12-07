// src/utils/aiLogic.js

// --- CALCUL DU SCORE META (Existant) ---
export function calculateMetaScore(player) {
  if (!player.detailedStats) return calculateBasicScore(player);

  const stats = player.detailedStats;
  let score = 0;

  switch (player.position) {
    case "ST": case "CF": case "LW": case "RW": case "LF": case "RF":
      score = ((stats.finishing || 80) * 0.25 + (stats.sprint_speed || 80) * 0.20 + (stats.agility || 75) * 0.15 + (stats.composure || 75) * 0.15 + (stats.shot_power || 80) * 0.10 + (stats.positioning || 80) * 0.15);
      break;
    case "CB": case "LB": case "RB": case "LWB": case "RWB":
      score = ((stats.def_awareness || 80) * 0.30 + (stats.standing_tackle || 80) * 0.20 + (stats.strength || 80) * 0.15 + (stats.sprint_speed || 70) * 0.15 + (stats.reactions || 80) * 0.10 + (stats.aggression || 75) * 0.10);
      break;
    case "CM": case "CAM": case "CDM": case "LM": case "RM":
      score = ((stats.short_passing || 80) * 0.20 + (stats.vision || 80) * 0.15 + (stats.ball_control || 80) * 0.15 + (stats.interceptions || 70) * 0.15 + (stats.stamina || 80) * 0.15 + (stats.strength || 75) * 0.20);
      break;
    case "GK":
      const s = player.stats;
      return ((s.dri * 0.3 + s.han * 0.3 + s.pos * 0.2 + s.kic * 0.1 + s.spe * 0.1) / 10).toFixed(1);
    default:
      score = 85;
  }

  if (player.playstyles) score += player.playstyles.length * 0.2;
  return (Math.min(score / 10, 9.9)).toFixed(1);
}

function calculateBasicScore(player) {
  const s = player.stats;
  if (!s) return "8.0";
  let score = 0;
  if (["ST", "CF", "LW", "RW", "LF", "RF"].includes(player.position)) score = (s.pac * 0.4) + (s.sho * 0.4) + (s.dri * 0.2);
  else if (["CB", "LB", "RB", "LWB", "RWB"].includes(player.position)) score = (s.def * 0.4) + (s.phy * 0.4) + (s.pac * 0.2);
  else score = (s.pas * 0.3) + (s.dri * 0.3) + (s.def * 0.2) + (s.phy * 0.2);
  return (score / 10).toFixed(1);
}

// --- NOUVEAU : LE CERVEAU DU COACH ---
export function generateCoachAdvice(squad) {
  const activePlayers = squad.filter(slot => slot.player !== null).map(s => s.player);
  if (activePlayers.length < 5) return ["Ajoute plus de joueurs pour que je puisse analyser ton équipe !"];

  const advice = [];

  // 1. Analyse de la Vitesse (Défense)
  const defenders = activePlayers.filter(p => ["DC", "DG", "DD", "DLG", "DLD"].includes(p.position));
  if (defenders.length > 0) {
    const avgDefPace = defenders.reduce((sum, p) => sum + (p.stats.pac || 0), 0) / defenders.length;
    if (avgDefPace < 75) advice.push("⚠️ Ta défense est lente (Vitesse < 75). Attention aux ballons en profondeur !");
    else if (avgDefPace > 85) advice.push("✅ Ta défense est très rapide, c'est parfait pour jouer haut.");
  }

  // 2. Analyse du Milieu (Physique & Passe)
  const mids = activePlayers.filter(p => ["MC", "MDC", "MOC"].includes(p.position));
  if (mids.length > 0) {
    const avgMidPhy = mids.reduce((sum, p) => sum + (p.stats.phy || 0), 0) / mids.length;
    if (avgMidPhy < 70) advice.push("⚠️ Ton milieu manque d'impact physique. Tu risques de te faire bouger dans les duels.");
  }

  // 3. Analyse de l'Attaque (Finition)
  const attackers = activePlayers.filter(p => ["BU", "AT", "AG", "AD"].includes(p.position));
  if (attackers.length > 0) {
    const avgAttSho = attackers.reduce((sum, p) => sum + (p.stats.sho || 0), 0) / attackers.length;
    if (avgAttSho > 88) advice.push("🔥 Ton attaque est létale ! Finition redoutable.");
  }

  // 4. Analyse Globale (Collectif & Meta)
  const metaScores = activePlayers.map(p => parseFloat(calculateMetaScore(p)));
  const avgMeta = metaScores.reduce((a, b) => a + b, 0) / metaScores.length;

  if (avgMeta > 9.0) advice.push("💎 C'est une équipe 'End Game'. Tu es prêt pour FUT Champions.");
  else if (avgMeta < 8.0) advice.push("💡 Certains joueurs ne sont pas assez 'Meta'. Cherche des alternatives plus rapides.");

  return advice.length > 0 ? advice : ["Ton équipe semble équilibrée. Bon match !"];
}