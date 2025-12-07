import Papa from 'papaparse';
import { calculateMetaScore } from './aiLogic';

const positionMap = {
    // French to English
    'G': 'GK',
    'DG': 'LB', 'DD': 'RB', 'DC': 'CB', 'DLG': 'LWB', 'DLD': 'RWB',
    'MDC': 'CDM', 'MC': 'CM', 'MOC': 'CAM', 'MG': 'LM', 'MD': 'RM',
    'AG': 'LW', 'AD': 'RW', 'AVG': 'LF', 'AVD': 'RF',
    'BU': 'ST', 'AT': 'CF',
    // Already English (Keep existing)
    'GK': 'GK',
    'LB': 'LB', 'RB': 'RB', 'CB': 'CB', 'LWB': 'LWB', 'RWB': 'RWB',
    'CDM': 'CDM', 'CM': 'CM', 'CAM': 'CAM', 'LM': 'LM', 'RM': 'RM',
    'LW': 'LW', 'RW': 'RW', 'LF': 'LF', 'RF': 'RF',
    'ST': 'ST', 'CF': 'CF'
};

const normalizePosition = (pos) => {
    if (!pos) return "SUB";
    const upperPos = pos.toUpperCase().trim();
    return positionMap[upperPos] || upperPos; // Default to original if no match (fallback)
};

export const parseCSV = async (fileOrUrl) => {
    const isUrl = typeof fileOrUrl === 'string';
    let csvData = fileOrUrl;

    if (isUrl) {
        try {
            const response = await fetch(fileOrUrl);
            if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.statusText}`);
            // Get content length if available for progress (optional optimization for future)
            csvData = await response.text();
        } catch (err) {
            throw new Error(`Network error loading CSV: ${err.message}`);
        }
    }

    return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            worker: true, // Critical for performance
            complete: (results) => {
                if (results.errors.length > 0) {
                    console.warn("⚠️ CSV Warnings:", results.errors);
                }
                resolve(results.data);
            },
            error: (err) => {
                reject(err);
            },
        });
    });
};

export const normalizePlayer = (row, index) => {
    const safeInt = (val) => val ? parseInt(val) : 0;

    // Robust stat extraction handles multiple CSV formats
    const stats = {
        pac: safeInt(row.PAC || row.Vitesse || row.Pace),
        sho: safeInt(row.SHO || row.Tir || row.Shooting),
        pas: safeInt(row.PAS || row.Passe || row.Passing),
        dri: safeInt(row.DRI || row.Dribble || row.Dribbling),
        def: safeInt(row.DEF || row.Defense || row.Defending),
        phy: safeInt(row.PHY || row.Physique || row.Physical)
    };

    const id = row.ID || row.Id || index;
    const name = row.Name || row.Nom || "Inconnu";

    // Pre-calculate normalized name for performant search
    const normalizeText = (text) => text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    const nameNormalized = normalizeText(name);

    const player = {
        id: id,
        name: name,
        nameNormalized: nameNormalized, // Optimized usage
        rating: safeInt(row.OVR || row.Rating || row.Note),
        position: normalizePosition(row.Position || "SUB"),
        price: row['Market Average'] || row['Bought For'] || 0,
        club: row.Team || row.Club || "Free Agent",
        league: row.League || "Unknown League",
        nation: row.Nation || row.Country || "Unknown Nation",
        untradeable: row.Untradeable || false,
        games: safeInt(row['Games Played']),
        goals: safeInt(row.Goals),
        assists: safeInt(row.Assists),
        image: row.ID
            ? `https://cdn.sofifa.net/players/${row.ID.toString().padStart(3, '0').slice(0, 3)}/${row.ID.toString().padStart(3, '0').slice(3)}/25_120.png`
            : `https://cdn.sofifa.net/players/${id.toString().padStart(3, '0').slice(0, 3)}/${id.toString().padStart(3, '0').slice(3)}/25_120.png`,
        nation_img: "https://cdn.sofifa.net/flags/fr.png",
        club_img: "https://cdn.sofifa.net/teams/beta/light/73.png",
        stats: stats,
        meta_score: null, // Will be calculated below
        isOwned: !!row['Bought For'] || !!row['Games Played']
    };

    // Calculate meta score using the partial object (needs position and stats)
    player.meta_score = calculateMetaScore(player);
    return player;
};
