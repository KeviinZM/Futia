'use client';

import { useState, useEffect, useMemo } from 'react';
import PlayerCard from '@/components/PlayerCard';
import SquadBuilder from '@/components/SquadBuilder';
import { parseCSV, normalizePlayer } from '@/utils/csvParsing';

const positionCategories = {
  "Attackers": ["BU", "AG", "AD", "AT", "AVG", "AVD", "ST", "LW", "RW", "CF", "LF", "RF"],
  "Midfielders": ["MC", "MOC", "MDC", "MG", "MD", "CM", "CAM", "CDM", "LM", "RM"],
  "Defenders": ["DC", "DG", "DD", "DLG", "DLD", "G", "CB", "LB", "RB", "LWB", "RWB"],
  "Goalkeepers": ["G", "GK"]
};

const normalizeText = (text) => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export default function Home() {
  const [currentData, setCurrentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(50);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // Load default database on mount
  useEffect(() => {
    const loadDefaultDatabase = async () => {
      try {
        setLoadingMessage("Downloading database (7MB)...");

        // Load the EAFC26.csv from public/data
        const rawData = await parseCSV('/data/EAFC26.csv');

        setLoadingMessage("Analyzing players...");

        // Normalize and sort
        const players = rawData
          .map((row, index) => normalizePlayer(row, index))
          .sort((a, b) => b.rating - a.rating);

        setCurrentData(players);
        setLoadingMessage("");
      } catch (error) {
        console.error("Failed to load default database:", error);
        setLoadingMessage("Error loading database.");
      }
    };

    loadDefaultDatabase();
  }, []);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 50);
  };

  const filteredPlayers = useMemo(() => {
    // Optimization: Don't filter if no search and "All" category (fast path)
    if (!searchTerm && activeFilter === "All") return currentData;

    const normalizedSearch = normalizeText(searchTerm);

    return currentData.filter((player) => {
      // Use pre-calculated normalized name if available, otherwise fallback
      const nameToCheck = player.nameNormalized || normalizeText(player.name);

      const matchesSearch = !normalizedSearch || nameToCheck.includes(normalizedSearch);

      let matchesCategory = true;
      if (activeFilter !== "All") {
        matchesCategory = positionCategories[activeFilter]?.includes(player.position);
      }
      return matchesSearch && matchesCategory;
    });
  }, [currentData, searchTerm, activeFilter]);

  const visiblePlayers = filteredPlayers.slice(0, visibleCount);

  return (
    <main className="min-h-screen bg-[#0f172a] p-8 font-sans">
      <header className="mb-10 text-center flex flex-col items-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 tracking-tighter">
          FUTIA
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Full Database ({currentData.length} Players)
        </p>

        {loadingMessage && (
          <div className="fixed top-4 right-4 z-50 px-6 py-3 bg-slate-800/90 backdrop-blur border border-purple-500/50 rounded-lg shadow-2xl text-purple-400 animate-pulse flex items-center gap-3">
            <span className="animate-spin text-xl">⏳</span> {loadingMessage}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full max-w-md group mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <input
            type="text"
            placeholder="Search player..."
            className="relative w-full bg-slate-900 text-white border border-slate-700 rounded-lg py-4 px-6 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveFilter("All")}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 transform hover:scale-105 ${activeFilter === "All"
              ? "bg-white text-slate-900 shadow-lg shadow-white/20"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
              }`}
          >
            All
          </button>

          {Object.keys(positionCategories).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat === activeFilter ? "All" : cat)}
              className={`px-6 py-2 rounded-full font-bold transition-all duration-300 transform hover:scale-105 ${activeFilter === cat
                ? "bg-white text-slate-900 shadow-lg shadow-white/20"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* --- SQUAD BUILDER SECTION --- */}
      {currentData.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-6 uppercase tracking-widest border-b border-slate-800 pb-4 w-max mx-auto">
            Squad Builder
          </h2>
          <SquadBuilder availablePlayersList={currentData} />
        </section>
      )}

      {/* --- PLAYERS GRID --- */}
      <section>
        <div className="flex flex-wrap justify-center gap-8 max-w-[1920px] mx-auto transition-all duration-500">
          {visiblePlayers.length > 0 ? (
            <>
              {visiblePlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
              {/* Show More Button */}
              {visiblePlayers.length < filteredPlayers.length && (
                <div className="w-full text-center mt-8 order-last">
                  <button
                    onClick={handleShowMore}
                    className="bg-slate-800 hover:bg-slate-700 text-purple-400 font-bold py-3 px-8 rounded-full border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all transform hover:-translate-y-1"
                  >
                    👇 Show more ({filteredPlayers.length - visiblePlayers.length} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-500 mt-10 animate-pulse w-full">
              <p className="text-2xl font-bold">No players found 😢</p>
              {loadingMessage && <p className="text-purple-400 mt-2">{loadingMessage}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="mt-20 text-center border-t border-slate-800 pt-8 text-slate-600 text-sm">
        Futia V2.0 - Full Database Version
      </div>
    </main>
  );
}