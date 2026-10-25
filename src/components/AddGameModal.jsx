import React, { useState } from 'react';
import { X, Plus, Code2, Globe } from 'lucide-react';

export const AddGameModal = ({
  isOpen,
  onClose,
  onAddGame,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Arcade');
  const [embedType, setEmbedType] = useState('src');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [controls, setControls] = useState('WASD or Arrow keys to move');
  const [tags, setTags] = useState('custom, web');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a game title.');
      return;
    }
    if (!content.trim()) {
      setError('Please provide an iframe URL or HTML srcdoc content.');
      return;
    }

    const newGame = {
      id: 'custom-' + Date.now(),
      title: title.trim(),
      category: category === 'All' ? 'Arcade' : category,
      description: description.trim() || 'Custom community game added via iframe JSON loader.',
      controls: controls.trim() || 'Standard keyboard & mouse',
      tags: tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      rating: 5.0,
      plays: '1',
      badge: 'CUSTOM',
      aspectRatio: '16:9',
      themeColor: '#06b6d4',
      isCustom: true,
      iframe: {
        type: embedType,
        content: content.trim(),
      },
    };

    onAddGame(newGame);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <Plus className="w-5 h-5" />
            <h3 className="font-extrabold text-lg text-white">Add Custom Iframe Game</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Game Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Space Combat 2025"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="Arcade">Arcade</option>
                <option value="Action">Action</option>
                <option value="Retro">Retro</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Sports">Sports</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                Embed Type
              </label>
              <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setEmbedType('src')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                    embedType === 'src' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  URL (src)
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedType('srcdoc')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${
                    embedType === 'srcdoc' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  HTML (srcdoc)
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              {embedType === 'src' ? 'Iframe Web URL (HTTPS)' : 'Iframe HTML / Canvas Code'}
            </label>
            {embedType === 'src' ? (
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://example.com/game.html"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="<!DOCTYPE html><html><body><h1>Game</h1>...</body></html>"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Description & Summary
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fast paced browser runner..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Controls Guide
            </label>
            <input
              type="text"
              value={controls}
              onChange={(e) => setControls(e.target.value)}
              placeholder="Arrow Keys or Mouse to steer"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/20"
            >
              Add To Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
