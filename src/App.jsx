import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_GAMES } from './data/gamesData';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { GameCard } from './components/GameCard';
import { GamePlayerModal } from './components/GamePlayerModal';
import { CloakModal, CLOAK_PRESETS } from './components/CloakModal';
import { PanicOverlay } from './components/PanicOverlay';
import { AddGameModal } from './components/AddGameModal';
import { JsonViewerModal } from './components/JsonViewerModal';
import {
  Gamepad2,
  Cpu,
  ShieldCheck,
  Flame,
  Search,
  RotateCcw
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Arcade',
  'Action',
  'Retro',
  'Puzzle',
  'Sports',
  'Strategy',
];

export default function App() {
  const [games, setGames] = useState(INITIAL_GAMES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedGame, setSelectedGame] = useState(null);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('nova_favs');
      return saved ? JSON.parse(saved) : ['slope-tunnel', 'retro-snake', 'puzzle-2048'];
    } catch {
      return ['slope-tunnel', 'retro-snake'];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Modals state
  const [isCloakModalOpen, setIsCloakModalOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isAddGameOpen, setIsAddGameOpen] = useState(false);
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);

  // Current tab cloak preset
  const [currentCloak, setCurrentCloak] = useState(() => {
    try {
      return localStorage.getItem('nova_cloak') || 'default';
    } catch {
      return 'default';
    }
  });

  // Load custom games from localStorage & fetch latest public/games.json
  useEffect(() => {
    // 1. Load custom user games from localStorage
    try {
      const customGamesRaw = localStorage.getItem('custom_unblocked_games');
      if (customGamesRaw) {
        const customGames = JSON.parse(customGamesRaw);
        setGames((prev) => {
          const ids = new Set(prev.map((g) => g.id));
          const newItems = customGames.filter((cg) => !ids.has(cg.id));
          return [...prev, ...newItems];
        });
      }
    } catch (e) {
      console.warn('Could not read custom games:', e);
    }

    // 2. Fetch fresh /games.json if available
    fetch('/games.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setGames((prev) => {
            const customOnly = prev.filter((g) => g.isCustom);
            return [...data, ...customOnly];
          });
        }
      })
      .catch((err) => {
        console.info('Using bundled games data store:', err);
      });
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nova_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites:', e);
    }
  }, [favorites]);

  // Apply tab cloak (title + favicon)
  useEffect(() => {
    try {
      localStorage.setItem('nova_cloak', currentCloak);
    } catch {}

    const preset = CLOAK_PRESETS.find((p) => p.id === currentCloak) || CLOAK_PRESETS[0];
    document.title = preset.title;

    // Favicon update
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = preset.iconUrl;
  }, [currentCloak]);

  // Panic button keyboard trigger (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If pressing Backquote (~) or Alt+P, toggle Panic:
      if (e.key === '`' || (e.altKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        setIsPanicActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFavorite = (gameId) => {
    setFavorites((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  const handleAddGame = (newGame) => {
    setGames((prev) => [newGame, ...prev]);
    try {
      const customGamesRaw = localStorage.getItem('custom_unblocked_games');
      const customGames = customGamesRaw ? JSON.parse(customGamesRaw) : [];
      localStorage.setItem('custom_unblocked_games', JSON.stringify([newGame, ...customGames]));
    } catch (e) {
      console.warn('Could not save custom game:', e);
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      All: games.length,
      Arcade: 0,
      Action: 0,
      Retro: 0,
      Puzzle: 0,
      Sports: 0,
      Strategy: 0,
    };
    games.forEach((g) => {
      if (counts[g.category] !== undefined) {
        counts[g.category]++;
      }
    });
    return counts;
  }, [games]);

  // Filtered & sorted games
  const filteredGames = useMemo(() => {
    let result = [...games];

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((g) => favorites.includes(g.id));
    }

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((g) => g.category === activeCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // 'popular' default: parse plays string roughly or rating
      const aPlays = parseFloat(String(a.plays).replace(/[^0-9.]/g, '')) || 0;
      const bPlays = parseFloat(String(b.plays).replace(/[^0-9.]/g, '')) || 0;
      return bPlays - aPlays;
    });

    return result;
  }, [games, searchQuery, activeCategory, sortBy, showFavoritesOnly, favorites]);

  // Featured game for the hero section
  const featuredGame = games.find((g) => g.id === 'slope-tunnel') || games[0];

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Panic Cloak Overlay */}
      <PanicOverlay isOpen={isPanicActive} onExit={() => setIsPanicActive(false)} />

      {/* Main App Navigation */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCloakModal={() => setIsCloakModalOpen(true)}
        onOpenAddGame={() => setIsAddGameOpen(true)}
        onOpenJsonViewer={() => setIsJsonViewerOpen(true)}
        favoritesCount={favorites.length}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        currentCloak={currentCloak}
        onTriggerPanic={() => setIsPanicActive(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Spotlight / Quick Launcher */}
        {!searchQuery && activeCategory === 'All' && !showFavoritesOnly && featuredGame && (
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Featured Unblocked Game</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {featuredGame.title}
                </h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {featuredGame.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setSelectedGame(featuredGame)}
                    className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>PLAY SPOTLIGHT</span>
                  </button>

                  <button
                    onClick={() => setIsJsonViewerOpen(true)}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center gap-2 transition-colors"
                  >
                    <span>View JSON Spec</span>
                  </button>
                </div>
              </div>

              {/* School Chromebook Feature Badges */}
              <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">Chromebook Ready</div>
                    <div className="text-[11px] text-slate-400">Pure HTML5 / Zero Lag</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="font-bold text-white">No Proxy Required</div>
                    <div className="text-[11px] text-slate-400">Embedded JSON Iframes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background subtle neon glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          </section>
        )}

        {/* Category Filter Bar */}
        <CategoryBar
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            if (showFavoritesOnly) setShowFavoritesOnly(false);
          }}
          categoryCounts={categoryCounts}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalGames={games.length}
        />

        {/* Games Section Header */}
        <div className="flex items-center justify-between mt-6 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {showFavoritesOnly
                ? 'Your Saved Favorites'
                : activeCategory === 'All'
                ? searchQuery
                  ? `Search results for "${searchQuery}"`
                  : 'All Unblocked Games'
                : `${activeCategory} Games`}
            </h2>
            <span className="text-xs text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800/80">
              {filteredGames.length}
            </span>
          </div>

          {(searchQuery || activeCategory !== 'All' || showFavoritesOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
                setShowFavoritesOnly(false);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Games Grid or Compact List */}
        {filteredGames.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col space-y-2'
            }
          >
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={(g) => setSelectedGame(g)}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={toggleFavorite}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/70 text-slate-400 flex items-center justify-center mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No unblocked games found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-5">
              We couldn&apos;t find any games matching your current filters. Try searching with different keywords or add your own custom game.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                  setShowFavoritesOnly(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsAddGameOpen(true)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Add Custom Game
              </button>
            </div>
          </div>
        )}
      </main>

      {/* School Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950/70 mt-12 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-200">NOVA ARCADE</span>
            <span>•</span>
            <span>Unblocked Games JSON Store</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Shortcuts:</span>
            <span><kbd>/</kbd> Search</span>
            <span><kbd>~</kbd> Panic Cloak</span>
            <span><kbd>Esc</kbd> Exit Player</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsJsonViewerOpen(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Inspect games.json</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Game Player Stage Modal */}
      <GamePlayerModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        isFavorite={selectedGame ? favorites.includes(selectedGame.id) : false}
        onToggleFavorite={toggleFavorite}
        allGames={games}
        onSelectGame={(g) => setSelectedGame(g)}
      />

      {/* Cloak Settings Modal */}
      <CloakModal
        isOpen={isCloakModalOpen}
        onClose={() => setIsCloakModalOpen(false)}
        currentCloak={currentCloak}
        onSelectCloak={(c) => setCurrentCloak(c)}
        onTriggerPanic={() => setIsPanicActive(true)}
      />

      {/* Add Custom Game Modal */}
      <AddGameModal
        isOpen={isAddGameOpen}
        onClose={() => setIsAddGameOpen(false)}
        onAddGame={handleAddGame}
      />

      {/* View JSON Modal */}
      <JsonViewerModal
        isOpen={isJsonViewerOpen}
        onClose={() => setIsJsonViewerOpen(false)}
        games={games}
      />
    </div>
  );
}
