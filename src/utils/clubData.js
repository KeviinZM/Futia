export const clubMap = {
    // Premier League
    "Arsenal": 1,
    "Aston Villa": 2,
    "Chelsea": 5,
    "Liverpool": 9,
    "Manchester City": 10,
    "Manchester Utd": 11, // Check CSV naming
    "Man Utd": 11,
    "Newcastle Utd": 13,
    "Tottenham Hotspur": 18,
    "Spurs": 18,
    "West Ham": 19,

    // La Liga
    "Real Madrid": 243,
    "FC Barcelona": 241,
    "Atlético de Madrid": 240,
    "Sevilla FC": 481,
    "Valencia CF": 461,

    // Bundesliga
    "FC Bayern München": 21,
    "Borussia Dortmund": 22,
    "Bayer 04 Leverkusen": 32,
    "Leverkusen": 32,
    "RB Leipzig": 112172,

    // Serie A
    "Juventus": 45,
    "AC Milan": 47, // Check CSV "Milano FC" or similar due to licensing?
    "Milan": 47,
    "Inter": 44,
    "Roma": 52,
    "Napoli": 48,
    "Lazio": 46,

    // Ligue 1
    "Paris SG": 73,
    "OM": 219,
    "Olympique de Marseille": 219,
    "Lyon": 66,
    "OL": 66,
    "Monaco": 69,

    // Others
    "Ajax": 245,
    "PSV": 247,
    "Feyenoord": 246,
    "Benfica": 234,
    "FC Porto": 236,
    "Sporting CP": 237,
    "Al Nassr": 112139,
    "Al Hilal": 605,
    "Al Ittihad": 607,
    "Al Ahli": 112387,
    "Inter Miami CF": 112893
};

export const getClubLogo = (clubName) => {
    if (!clubName) return "https://cdn.sofifa.net/teams/beta/light/0.png"; // Placeholder
    const id = clubMap[clubName];
    if (id) {
        return `https://cdn.sofifa.net/teams/beta/light/${id}.png`;
    }
    // Default placeholder or maybe try a search-based URL (unreliable)
    return "https://cdn.sofifa.net/teams/beta/light/0.png";
};
