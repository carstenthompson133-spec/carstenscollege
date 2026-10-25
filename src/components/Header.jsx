import React, { useState, useEffect } from 'react';
import { Gamepad2, Search, ShieldAlert, PlusCircle, FileCode, Star, X } from 'lucide-react';

export const Header = ({
  searchQuery,
  setSearchQuery,
  onOpenCloakModal,
  onOpenAddGame,
  onOpenJsonViewer,
  favoritesCount,
  showFavoritesOnly,
  setShowFavoritesOnly,
  currentCloak,
  onTriggerPanic,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Global keyboard shortcut '/' to focus search, and 'Escape' to clear or panic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = document.getElementById('search-games-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                NOVA <span className="text-cyan-400 font-semibold text-base sm:text-lg">ARCADE</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                UNBLOCKED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Lightweight HTML5 JSON Games Portal
            </p>
          </div>
        </div>

        {/* Live Search */}
        <div className="flex-1 max-w-lg mx-2 relative">
          <div
            className={`relative flex items-center w-full transition-all duration-200 rounded-lg bg-slate-900/90 border ${
              isSearchFocused
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md shadow-cyan-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0" />
            <input
              id="search-games-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search unblocked games... (Press '/' to focus)"
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-2 text-slate-400 hover:text-white p-1 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex mr-2 text-[10px] text-slate-400 bg-slate-800 border-slate-700">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Favorites Filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`relative p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 border ${
              showFavoritesOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
            title="Show saved favorite games"
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Quick Panic Button */}
          <button
            onClick={onTriggerPanic}
            className="p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:border-rose-500/50"
            title="Emergency disguise / cloak (shortcut: Esc or Panic button)"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Panic Cloak</span>
          </button>

          {/* Cloak Settings */}
          <button
            onClick={onOpenCloakModal}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/70 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Configure Tab Cloak disguise (Classroom, Drive, Docs)"
          >
            <span className="text-xs font-mono px-1 text-slate-300 uppercase">
              {currentCloak === 'default' ? 'Tab' : currentCloak}
            </span>
          </button>

          {/* Add Game */}
          <button
            onClick={onOpenAddGame}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-900/70 border border-slate-800 hover:bg-slate-800 hover:text-white transition-colors"
            title="Add a custom game by iframe URL or embed code"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Add Game</span>
          </button>

          {/* View JSON */}
          <button
            onClick={onOpenJsonViewer}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/70 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Inspect games.json data file"
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
