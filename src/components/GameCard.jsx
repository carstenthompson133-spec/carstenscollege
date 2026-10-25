import React from 'react';
import { Play, Star, Sparkles, Zap, Flame, Trophy } from 'lucide-react';

export const GameCard = ({
  game,
  onSelectGame,
  isFavorite,
  onToggleFavorite,
  viewMode = 'grid',
}) => {
  const getBadgeIcon = (badge) => {
    if (!badge) return null;
    switch (badge.toUpperCase()) {
      case 'HOT':
        return <Flame className="w-3 h-3 text-rose-400" />;
      case 'POPULAR':
        return <Trophy className="w-3 h-3 text-amber-400" />;
      case 'TRENDING':
        return <Zap className="w-3 h-3 text-cyan-400" />;
      default:
        return <Sparkles className="w-3 h-3 text-indigo-400" />;
    }
  };

  if (viewMode === 'compact') {
    return (
      <div className="group relative flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-slate-700 transition-all duration-200">
        <div className="flex items-center gap-3 min-w-0">
          {/* Accent indicator */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
            style={{ backgroundColor: `${game.themeColor}25`, border: `1px solid ${game.themeColor}50` }}
          >
            <span style={{ color: game.themeColor }} className="text-sm font-mono uppercase">
              {game.title.slice(0, 2)}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                {game.title}
              </h3>
              {game.badge && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400/90 tracking-wider">
                  {getBadgeIcon(game.badge)}
                  {game.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{game.category}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">★ {Number(game.rating).toFixed(1)}</span>
              <span>•</span>
              <span>{game.plays} plays</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            className={`p-2 rounded-lg text-slate-400 hover:text-amber-400 transition-colors ${
              isFavorite ? 'text-amber-400' : ''
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
          <button
            onClick={() => onSelectGame(game)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelectGame(game)}
      className="group relative flex flex-col justify-between rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700/80 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer"
    >
      <div>
        {/* Top Header Card Info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner"
              style={{
                backgroundColor: `${game.themeColor}1a`,
                borderColor: `${game.themeColor}40`,
                borderWidth: '1px',
                color: game.themeColor,
              }}
            >
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium tracking-wide">
                {game.category}
              </span>
              <div className="text-[11px] text-slate-500">
                {game.plays} plays
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {game.badge && (
              <span
                className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider"
                style={{
                  backgroundColor: `${game.themeColor}15`,
                  color: game.themeColor,
                  border: `1px solid ${game.themeColor}30`,
                }}
              >
                {getBadgeIcon(game.badge)}
                {game.badge}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(game.id);
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors mb-1.5 line-clamp-1">
          {game.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {game.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-mono text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer with Play Button */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-amber-400 font-bold">★ {Number(game.rating).toFixed(1)}</span>
          <span className="text-slate-500">/ 5.0</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectGame(game);
          }}
          className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 group-hover:scale-105"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>PLAY NOW</span>
        </button>
      </div>
    </div>
  );
};
