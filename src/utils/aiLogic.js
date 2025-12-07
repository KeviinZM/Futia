// src/utils/aiLogic.js

export function calculateMetaScore(player) {
  if (!player.detailedStats) return calculateBasicScore(player);

  const getStat = (statName) => {
    const ds = player.detailedStats;
    if (!ds) return 75;

    const map = {
      sprint_speed: ds.pace?.["Sprint Speed"],
      acceleration: ds.pace?.["Acceleration"],

      finishing: ds.shooting?.["Finishing"],
      shot_power: ds.shooting?.["Shot Power"],
      positioning: ds.shooting?.["Positioning"],
      long_shots: ds.shooting?.["Long Shots"],
      volleys: ds.shooting?.["Volleys"],
      penalties: ds.shooting?.["Penalties"],

      vision: ds.passing?.["Vision"],
      crossing: ds.passing?.["Crossing"],
      short_passing: ds.passing?.["Short Passing"],
      long_passing: ds.passing?.["Long Passing"],
      curve: ds.passing?.["Curve"],

      agility: ds.dribbling?.["Agility"],
      balance: ds.dribbling?.["Balance"],
      reactions: ds.dribbling?.["Reactions"],
      ball_control: ds.dribbling?.["Ball Control"],
      dribbling: ds.dribbling?.["Dribbling"],
      composure: ds.dribbling?.["Composure"],

      interceptions: ds.defending?.["Interceptions"],
      heading_accuracy: ds.defending?.["Heading Acc."],
      def_awareness: ds.defending?.["Def. Awareness"],
      standing_tackle: ds.defending?.["Stand Tackle"],
      sliding_tackle: ds.defending?.["Slide Tackle"],

      jumping: ds.physical?.["Jumping"],
      stamina: ds.physical?.["Stamina"],
      strength: ds.physical?.["Strength"],
      aggression: ds.physical?.["Aggression"]
    };

    const val = map[statName];
    return typeof val === 'number' ? val : 75;
  };

  let score = 0;

  switch (player.position) {
    case "ST": case "CF": case "LW": case "RW": case "LF": case "RF":
      score = (
        getStat("sprint_speed") * 0.25 +
        getStat("finishing") * 0.20 +
        getStat("agility") * 0.15 +
        getStat("dribbling") * 0.10 +
        getStat("shot_power") * 0.10 +
        getStat("reactions") * 0.10 +
        getStat("composure") * 0.10
      );
      break;

    case "CAM": case "MOC": case "LM": case "RM":
      score = (
        getStat("vision") * 0.20 +
        getStat("short_passing") * 0.20 +
        getStat("dribbling") * 0.20 +
        getStat("agility") * 0.15 +
        getStat("sprint_speed") * 0.15 +
        getStat("stamina") * 0.10
      );
      break;

    case "CM": case "CDM":
      score = (
        getStat("interceptions") * 0.20 +
        getStat("def_awareness") * 0.20 +
        getStat("short_passing") * 0.15 +
        getStat("stamina") * 0.15 +
        getStat("strength") * 0.15 +
        getStat("reactions") * 0.15
      );
      break;

    case "CB": case "LB": case "RB": case "LWB": case "RWB":
      score = (
        getStat("def_awareness") * 0.25 +
        getStat("sprint_speed") * 0.25 +
        getStat("standing_tackle") * 0.15 +
        getStat("strength") * 0.15 +
        getStat("reactions") * 0.10 +
        getStat("interceptions") * 0.10
      );
      break;

    case "GK":
      const s = player.stats;
      const g = (key) => typeof s[key] === 'number' ? s[key] : 75;
      return ((g('dri') * 0.1 + g('han') * 0.3 + g('pos') * 0.2 + g('kic') * 0.1 + g('ref') * 0.3) / 10).toFixed(1);

    default:
      score = 800;
  }

  score = score / 11.5;

  const skills = player.info?.skillMoves || 0;
  if (skills === 5) score += 0.6;
  else if (skills === 4) score += 0.2;
  else score -= 0.3;

  const wf = player.info?.weakFoot || 0;
  if (wf === 5) score += 0.6;
  else if (wf === 4) score += 0.2;
  else if (wf < 3) score -= 0.5;

  if (player.playstyles && Array.isArray(player.playstyles)) {
    player.playstyles.forEach(ps => {
      if (ps.includes('+')) {
        score += 0.25;
      } else {
        score += 0.05;
      }
    });
  }

  return (Math.min(Math.max(score, 1.0), 9.9)).toFixed(1);
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

export function generateCoachAdvice(squad) {
  const activePlayers = squad.filter(slot => slot.player !== null).map(s => s.player);
  if (activePlayers.length < 5) return ["Ajoute plus de joueurs pour que je puisse analyser ton équipe !"];

  const advice = [];

  const defenders = activePlayers.filter(p => ["DC", "DG", "DD", "DLG", "DLD"].includes(p.position));
  if (defenders.length > 0) {
    const avgDefPace = defenders.reduce((sum, p) => sum + (p.stats.pac || 0), 0) / defenders.length;
    if (avgDefPace < 75) advice.push("⚠️ Ta défense est lente (Vitesse < 75). Attention aux ballons en profondeur !");
    else if (avgDefPace > 85) advice.push("✅ Ta défense est très rapide, c'est parfait pour jouer haut.");
  }

  const mids = activePlayers.filter(p => ["MC", "MDC", "MOC"].includes(p.position));
  if (mids.length > 0) {
    const avgMidPhy = mids.reduce((sum, p) => sum + (p.stats.phy || 0), 0) / mids.length;
    if (avgMidPhy < 70) advice.push("⚠️ Ton milieu manque d'impact physique. Tu risques de te faire bouger dans les duels.");
  }

  const attackers = activePlayers.filter(p => ["BU", "AT", "AG", "AD"].includes(p.position));
  if (attackers.length > 0) {
    const avgAttSho = attackers.reduce((sum, p) => sum + (p.stats.sho || 0), 0) / attackers.length;
    if (avgAttSho > 88) advice.push("🔥 Ton attaque est létale ! Finition redoutable.");
  }

  const metaScores = activePlayers.map(p => parseFloat(calculateMetaScore(p)));
  const avgMeta = metaScores.reduce((a, b) => a + b, 0) / metaScores.length;

  if (avgMeta > 9.0) advice.push("💎 C'est une équipe 'End Game'. Tu es prêt pour FUT Champions.");
  else if (avgMeta < 8.0) advice.push("💡 Certains joueurs ne sont pas assez 'Meta'. Cherche des alternatives plus rapides.");

  return advice.length > 0 ? advice : ["Ton équipe semble équilibrée. Bon match !"];
}