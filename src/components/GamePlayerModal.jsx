import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Star,
  Keyboard,
  Info,
  Sparkles,
  Share2,
  Check
} from 'lucide-react';

export const GamePlayerModal = ({
  game,
  onClose,
  isFavorite,
  onToggleFavorite,
  allGames,
  onSelectGame,
}) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcut: Esc to exit fullscreen or close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (game) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, onClose]);

  if (!game) return null;

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenAboutBlank = () => {
    // Open in about:blank cloak window
    const newWin = window.open('about:blank', '_blank');
    if (!newWin) {
      alert('Pop-up was blocked. Please allow pop-ups for this site.');
      return;
    }
    newWin.document.title = 'Google Docs';
    const iframe = newWin.document.createElement('iframe');
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    if (game.iframe.type === 'srcdoc') {
      iframe.srcdoc = game.iframe.content;
    } else {
      iframe.src = game.iframe.content;
    }
    newWin.document.body.style.margin = '0';
    newWin.document.body.style.overflow = 'hidden';
    newWin.document.body.appendChild(iframe);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Recommended games
  const relatedGames = allGames
    .filter((g) => g.id !== game.id && (g.category === game.category || g.tags.some((t) => game.tags.includes(t))))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-5xl flex flex-col gap-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close and return to games list (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{game.title}</h2>
                <span className="text-xs text-slate-400 font-mono">[{game.category}]</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Loaded via JSON Iframe • Safe Sandbox Active
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Reload Game */}
            <button
              onClick={handleReload}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Restart game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Favorite toggle */}
            <button
              onClick={() => onToggleFavorite(game.id)}
              className={`p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors ${
                isFavorite ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            {/* About:Blank Disguise Popout */}
            <button
              onClick={handleOpenAboutBlank}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              title="Open in about:blank cloak tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cloak Popout</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Game Stage Iframe Container */}
        <div
          ref={containerRef}
          className={`relative w-full rounded-2xl bg-black border-2 border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'aspect-video min-h-[420px] max-h-[75vh]'
          }`}
        >
          {/* Active Iframe */}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title={game.title}
            srcDoc={game.iframe.type === 'srcdoc' ? game.iframe.content : undefined}
            src={game.iframe.type === 'src' ? game.iframe.content : undefined}
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals"
            allow="fullscreen; autoplay; gamepad"
            className="w-full h-full border-none outline-none block"
          />

          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur border border-slate-700 transition-all opacity-40 hover:opacity-100"
              title="Exit fullscreen (Esc)"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Below Stage: Game Information & Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Controls Panel */}
          <div className="md:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-sm">
              <Keyboard className="w-4 h-4" />
              <span>CONTROLS</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {game.controls}
            </p>
            <div className="mt-3 text-[11px] text-slate-500">
              Click anywhere inside the game frame to focus keyboard controls.
            </div>
          </div>

          {/* Description and Instructions */}
          <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold text-sm">
                <Info className="w-4 h-4" />
                <span>HOW TO PLAY & OBJECTIVE</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                {game.description}
              </p>

              {game.instructions && game.instructions.length > 0 && (
                <ul className="space-y-1.5 text-xs text-slate-400">
                  {game.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">›</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>Rating: <strong className="text-amber-400">★ {game.rating}</strong></span>
                <span>•</span>
                <span>Plays: <strong>{game.plays}</strong></span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* More Games Strip */}
        {relatedGames.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>More Unblocked Games</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {relatedGames.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onSelectGame(rel)}
                  className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/50 text-left transition-all group"
                >
                  <div className="font-bold text-xs text-white group-hover:text-cyan-400 truncate">
                    {rel.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                    <span>{rel.category}</span>
                    <span>•</span>
                    <span className="text-amber-400">★ {rel.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
