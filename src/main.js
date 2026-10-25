import './index.css';
import { INITIAL_GAMES } from './data/gamesData.js';
import { ICONS } from './icons.js';

// Cloak Presets
const CLOAK_PRESETS = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes - Google Classroom',
    iconUrl: 'https://ssl.gstatic.com/classroom/favicon.png'
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    iconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png'
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Article',
    title: 'Photosynthesis - Wikipedia',
    iconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico'
  },
  {
    id: 'calculator',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    iconUrl: 'https://www.desmos.com/favicon.ico'
  },
  {
    id: 'default',
    name: 'Default (Nova Games)',
    title: 'Nova Unblocked Games',
    iconUrl: '/favicon.ico'
  }
];

const CATEGORIES = ['All', 'Arcade', 'Action', 'Retro', 'Puzzle', 'Sports', 'Strategy'];

// Application State
const state = {
  games: [...INITIAL_GAMES],
  favorites: JSON.parse(localStorage.getItem('nova_favs') || '["slope-tunnel","retro-snake","puzzle-2048"]'),
  searchQuery: '',
  activeCategory: 'All',
  sortBy: 'popular',
  viewMode: 'grid',
  showFavoritesOnly: false,
  selectedGame: null,
  currentCloak: localStorage.getItem('nova_cloak') || 'default',
  isPanicActive: false,
  isCloakModalOpen: false,
  isAddGameOpen: false,
  isJsonViewerOpen: false,
  jsonSearchQuery: '',
  isFullscreen: false,
  iframeKey: 0
};

// Initialize Tab Cloaking
function applyCloak(cloakId) {
  state.currentCloak = cloakId;
  localStorage.setItem('nova_cloak', cloakId);
  const preset = CLOAK_PRESETS.find(p => p.id === cloakId) || CLOAK_PRESETS[0];
  document.title = preset.title;

  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  link.href = preset.iconUrl;
}

// Load external games.json & custom games
function loadGames() {
  try {
    const custom = JSON.parse(localStorage.getItem('custom_unblocked_games') || '[]');
    if (Array.isArray(custom)) {
      const ids = new Set(state.games.map(g => g.id));
      custom.forEach(cg => {
        if (!ids.has(cg.id)) state.games.push(cg);
      });
    }
  } catch(e){}

  const base = import.meta.env?.BASE_URL || './';
  const jsonPath = base.endsWith('/') ? `${base}games.json` : `${base}/games.json`;
  fetch(jsonPath)
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const customOnly = state.games.filter(g => g.isCustom);
        state.games = [...data, ...customOnly];
        render();
      }
    })
    .catch(() => {});
}

// Filter and Sort Games
function getFilteredGames() {
  let list = [...state.games];

  if (state.showFavoritesOnly) {
    list = list.filter(g => state.favorites.includes(g.id));
  }

  if (state.activeCategory !== 'All') {
    list = list.filter(g => g.category === state.activeCategory);
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  list.sort((a, b) => {
    if (state.sortBy === 'rating') return b.rating - a.rating;
    if (state.sortBy === 'title') return a.title.localeCompare(b.title);
    const aP = parseFloat(String(a.plays).replace(/[^0-9.]/g, '')) || 0;
    const bP = parseFloat(String(b.plays).replace(/[^0-9.]/g, '')) || 0;
    return bP - aP;
  });

  return list;
}

function getCategoryCounts() {
  const counts = { All: state.games.length };
  CATEGORIES.forEach(c => { if(c !== 'All') counts[c] = 0; });
  state.games.forEach(g => {
    if (counts[g.category] !== undefined) counts[g.category]++;
  });
  return counts;
}

// Action Handlers
window.novaAction = {
  setSearch(q) {
    state.searchQuery = q;
    render();
    const input = document.getElementById('search-games-input');
    if (input) {
      input.value = q;
      input.focus();
    }
  },
  clearSearch() {
    state.searchQuery = '';
    render();
  },
  setCategory(cat) {
    state.activeCategory = cat;
    if (state.showFavoritesOnly) state.showFavoritesOnly = false;
    render();
  },
  toggleFavoritesFilter() {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    render();
  },
  toggleFavorite(id, e) {
    if (e) e.stopPropagation();
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter(x => x !== id);
    } else {
      state.favorites.push(id);
    }
    localStorage.setItem('nova_favs', JSON.stringify(state.favorites));
    render();
  },
  setSort(val) {
    state.sortBy = val;
    render();
  },
  setViewMode(mode) {
    state.viewMode = mode;
    render();
  },
  selectGame(id) {
    const g = state.games.find(x => x.id === id);
    if (g) {
      state.selectedGame = g;
      state.iframeKey++;
      render();
    }
  },
  closeGame() {
    state.selectedGame = null;
    render();
  },
  reloadGame() {
    state.iframeKey++;
    render();
  },
  toggleFullscreen() {
    const el = document.getElementById('game-stage-wrapper');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  },
  openAboutBlank() {
    const g = state.selectedGame;
    if (!g) return;
    const win = window.open('about:blank', '_blank');
    if (!win) {
      alert('Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }
    win.document.title = 'Google Docs';
    const iframe = win.document.createElement('iframe');
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.style.position = 'fixed';
    iframe.style.inset = '0';
    if (g.iframe.type === 'srcdoc') {
      iframe.srcdoc = g.iframe.content;
    } else {
      iframe.src = g.iframe.content;
    }
    win.document.body.style.margin = '0';
    win.document.body.appendChild(iframe);
  },
  triggerPanic() {
    state.isPanicActive = true;
    render();
  },
  exitPanic() {
    state.isPanicActive = false;
    render();
  },
  openCloakModal() {
    state.isCloakModalOpen = true;
    render();
  },
  closeCloakModal() {
    state.isCloakModalOpen = false;
    render();
  },
  chooseCloak(id) {
    applyCloak(id);
    render();
  },
  openAddGame() {
    state.isAddGameOpen = true;
    render();
  },
  closeAddGame() {
    state.isAddGameOpen = false;
    render();
  },
  submitCustomGame(e) {
    e.preventDefault();
    const f = e.target;
    const title = f.title.value.trim();
    const category = f.category.value;
    const embedType = f.embedType.value;
    const content = f.content.value.trim();
    const description = f.description.value.trim() || 'Custom community unblocked game.';
    const controls = f.controls.value.trim() || 'Standard keyboard & mouse controls';

    if (!title || !content) return;

    const newGame = {
      id: 'custom-' + Date.now(),
      title,
      category,
      description,
      controls,
      tags: ['custom', 'iframe'],
      rating: 5.0,
      plays: '1',
      badge: 'CUSTOM',
      aspectRatio: '16:9',
      themeColor: '#06b6d4',
      isCustom: true,
      iframe: { type: embedType, content }
    };

    state.games.unshift(newGame);
    try {
      const custom = JSON.parse(localStorage.getItem('custom_unblocked_games') || '[]');
      custom.unshift(newGame);
      localStorage.setItem('custom_unblocked_games', JSON.stringify(custom));
    } catch(err){}

    state.isAddGameOpen = false;
    state.selectedGame = newGame;
    render();
  },
  openJsonViewer() {
    state.isJsonViewerOpen = true;
    render();
  },
  closeJsonViewer() {
    state.isJsonViewerOpen = false;
    render();
  },
  copyJson() {
    navigator.clipboard.writeText(JSON.stringify(state.games, null, 2));
    const btn = document.getElementById('copy-json-btn');
    if (btn) btn.innerHTML = `${ICONS.check} <span>Copied!</span>`;
    setTimeout(() => {
      if (btn) btn.innerHTML = `${ICONS.copy} <span>Copy JSON</span>`;
    }, 2000);
  },
  downloadJson() {
    const blob = new Blob([JSON.stringify(state.games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'games.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Keyboard Shortcuts
window.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const input = document.getElementById('search-games-input');
    input?.focus();
  }
  if (e.key === '`' || (e.altKey && e.key.toLowerCase() === 'p')) {
    e.preventDefault();
    state.isPanicActive = !state.isPanicActive;
    render();
  }
  if (e.key === 'Escape') {
    if (state.isPanicActive) {
      state.isPanicActive = false;
      render();
    } else if (state.isCloakModalOpen) {
      state.isCloakModalOpen = false;
      render();
    } else if (state.isAddGameOpen) {
      state.isAddGameOpen = false;
      render();
    } else if (state.isJsonViewerOpen) {
      state.isJsonViewerOpen = false;
      render();
    } else if (state.selectedGame) {
      state.selectedGame = null;
      render();
    }
  }
});

// HTML Template Renderer
function render() {
  const root = document.getElementById('root');
  if (!root) return;

  // 1. Panic Overlay Active
  if (state.isPanicActive) {
    root.innerHTML = `
      <div class="fixed inset-0 z-[100] bg-white text-gray-800 font-sans overflow-y-auto select-none">
        <header class="border-b border-gray-200 bg-white sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-4">
            <button class="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">C</div>
              <span class="text-xl font-medium text-gray-700 tracking-tight">Google Classroom</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="novaAction.exitPanic()" class="px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 transition-colors">
              Return (Esc)
            </button>
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">S</div>
          </div>
        </header>
        <main class="max-w-6xl mx-auto p-6">
          <div class="flex items-center gap-6 text-sm font-medium text-gray-600 border-b border-gray-200 pb-2 mb-6">
            <span class="text-emerald-700 font-semibold border-b-2 border-emerald-600 pb-2 -mb-2">To-do</span>
            <span>Enrolled</span>
            <span>Calendar</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onclick="novaAction.exitPanic()" class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs cursor-pointer">
              <div class="bg-emerald-700 p-4 text-white">
                <h3 class="font-semibold text-lg">AP US History - Period 2</h3>
                <p class="text-xs text-white/80 mt-1">Mr. Richardson • Room 204</p>
              </div>
              <div class="p-4"><div class="text-xs font-semibold text-gray-500 uppercase">Upcoming</div><p class="text-xs text-gray-700 font-medium mt-1">Due tomorrow: Chapter 18 DBQ Outline</p></div>
            </div>
            <div onclick="novaAction.exitPanic()" class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs cursor-pointer">
              <div class="bg-blue-700 p-4 text-white">
                <h3 class="font-semibold text-lg">Honors Physics 1</h3>
                <p class="text-xs text-white/80 mt-1">Dr. Evelyn Martinez • Lab 3</p>
              </div>
              <div class="p-4"><div class="text-xs font-semibold text-gray-500 uppercase">Upcoming</div><p class="text-xs text-gray-700 font-medium mt-1">Due Friday: Kinematics Lab Report</p></div>
            </div>
            <div onclick="novaAction.exitPanic()" class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs cursor-pointer">
              <div class="bg-indigo-700 p-4 text-white">
                <h3 class="font-semibold text-lg">Algebra II & Trigonometry</h3>
                <p class="text-xs text-white/80 mt-1">Ms. Jenkins • Room 112</p>
              </div>
              <div class="p-4"><div class="text-xs font-semibold text-gray-500 uppercase">Upcoming</div><p class="text-xs text-gray-700 font-medium mt-1">No work due soon</p></div>
            </div>
          </div>
        </main>
      </div>
    `;
    return;
  }

  const filteredGames = getFilteredGames();
  const counts = getCategoryCounts();
  const featured = state.games.find(g => g.id === 'slope-tunnel') || state.games[0];

  // 2. Main Portal HTML
  root.innerHTML = `
    <div class="min-h-screen bg-[#070a14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <!-- Sticky Header -->
      <header class="sticky top-0 z-30 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <!-- Logo -->
          <div class="flex items-center gap-3 shrink-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              ${ICONS.gamepad}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                  NOVA <span class="text-cyan-400 font-semibold text-base sm:text-lg">ARCADE</span>
                </span>
                <span class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  UNBLOCKED
                </span>
              </div>
              <p class="text-[11px] text-slate-400 hidden sm:block">Lightweight HTML5 JSON Games Portal</p>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="flex-1 max-w-lg mx-2 relative">
            <div class="relative flex items-center w-full rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <span class="ml-3 text-slate-400 shrink-0">${ICONS.search}</span>
              <input
                id="search-games-input"
                type="text"
                value="${escapeHtml(state.searchQuery)}"
                oninput="novaAction.setSearch(this.value)"
                placeholder="Search unblocked games... (Press '/' to focus)"
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                style="width: 100%; background: transparent; padding: 8px 12px; font-size: 14px; color: #e2e8f0; border: none; outline: none;"
              />
              ${state.searchQuery ? `
                <button onclick="novaAction.clearSearch()" class="mr-2 text-slate-400 hover:text-white p-1 rounded">
                  ${ICONS.close}
                </button>
              ` : `
                <kbd class="hidden md:inline-flex mr-2 text-[10px] text-slate-400 bg-slate-800 border-slate-700">
                  /
                </kbd>
              `}
            </div>
          </div>

          <!-- Header Action Buttons -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              onclick="novaAction.toggleFavoritesFilter()"
              class="relative p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 border ${
                state.showFavoritesOnly
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }"
              title="Show saved favorites"
            >
              ${state.showFavoritesOnly ? ICONS.starFilled : ICONS.star}
              <span class="hidden md:inline">Favorites</span>
              ${state.favorites.length > 0 ? `
                <span class="text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  ${state.favorites.length}
                </span>
              ` : ''}
            </button>

            <!-- Panic Button -->
            <button
              onclick="novaAction.triggerPanic()"
              class="p-2 sm:px-3 sm:py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
              title="Emergency disguise (shortcut: ~ or Esc)"
            >
              ${ICONS.shield}
              <span class="hidden sm:inline">Panic Cloak</span>
            </button>

            <!-- Tab Cloaker Modal Button -->
            <button
              onclick="novaAction.openCloakModal()"
              class="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/70 border border-slate-800 hover:bg-slate-800 text-xs font-mono uppercase"
              title="Tab Cloak Presets"
            >
              ${state.currentCloak === 'default' ? 'Tab' : state.currentCloak}
            </button>

            <!-- Add Game -->
            <button
              onclick="novaAction.openAddGame()"
              class="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-900/70 border border-slate-800 hover:bg-slate-800 hover:text-white"
            >
              ${ICONS.plus}
              <span>Add Game</span>
            </button>

            <!-- View JSON -->
            <button
              onclick="novaAction.openJsonViewer()"
              class="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/70 border border-slate-800 hover:bg-slate-800"
              title="Inspect games.json"
            >
              ${ICONS.fileCode}
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Spotlight Banner (When not filtering) -->
        ${(!state.searchQuery && state.activeCategory === 'All' && !state.showFavoritesOnly && featured) ? `
          <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 mb-8 shadow-xl">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div class="max-w-xl">
                <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                  ${ICONS.flame}
                  <span>Featured Unblocked Game</span>
                </div>
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  ${escapeHtml(featured.title)}
                </h1>
                <p class="mt-2 text-sm text-slate-300 leading-relaxed line-clamp-2">
                  ${escapeHtml(featured.description)}
                </p>
                <div class="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    onclick="novaAction.selectGame('${featured.id}')"
                    class="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
                  >
                    ${ICONS.gamepad}
                    <span>PLAY SPOTLIGHT</span>
                  </button>
                  <button
                    onclick="novaAction.openJsonViewer()"
                    class="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 flex items-center gap-2"
                  >
                    <span>View JSON Spec</span>
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 shrink-0 text-xs">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5">
                  <span class="text-emerald-400">${ICONS.cpu}</span>
                  <div>
                    <div class="font-bold text-white">Chromebook Ready</div>
                    <div class="text-[11px] text-slate-400">Pure HTML5 / Zero Lag</div>
                  </div>
                </div>
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5">
                  <span class="text-cyan-400">${ICONS.shield}</span>
                  <div>
                    <div class="font-bold text-white">No Proxy Required</div>
                    <div class="text-[11px] text-slate-400">Embedded JSON Iframes</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </section>
        ` : ''}

        <!-- Category & Sort Filter Bar -->
        <div class="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-800/80">
          <div class="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none no-scrollbar">
            ${CATEGORIES.map(cat => {
              const isActive = state.activeCategory === cat;
              const count = counts[cat] || 0;
              return `
                <button
                  onclick="novaAction.setCategory('${cat}')"
                  class="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
                  }"
                >
                  <span>${cat}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }">${count}</span>
                </button>
              `;
            }).join('')}
          </div>

          <div class="flex items-center justify-between md:justify-end gap-3 shrink-0">
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <span class="hidden sm:inline">Sort:</span>
              <select
                onchange="novaAction.setSort(this.value)"
                class="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="popular" ${state.sortBy === 'popular' ? 'selected' : ''}>Most Popular</option>
                <option value="rating" ${state.sortBy === 'rating' ? 'selected' : ''}>Top Rated</option>
                <option value="title" ${state.sortBy === 'title' ? 'selected' : ''}>Alphabetical (A-Z)</option>
              </select>
            </div>
            <div class="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onclick="novaAction.setViewMode('grid')"
                class="p-1.5 rounded-md text-xs transition-colors ${state.viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400'}"
                title="Grid view"
              >
                ${ICONS.grid}
              </button>
              <button
                onclick="novaAction.setViewMode('compact')"
                class="p-1.5 rounded-md text-xs transition-colors ${state.viewMode === 'compact' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400'}"
                title="Compact list view"
              >
                ${ICONS.list}
              </button>
            </div>
          </div>
        </div>

        <!-- Section Header -->
        <div class="flex items-center justify-between mt-6 mb-4">
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-white tracking-tight">
              ${state.showFavoritesOnly
                ? 'Your Saved Favorites'
                : state.activeCategory === 'All'
                ? state.searchQuery ? `Search results for "${escapeHtml(state.searchQuery)}"` : 'All Unblocked Games'
                : `${state.activeCategory} Games`}
            </h2>
            <span class="text-xs text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800/80">
              ${filteredGames.length}
            </span>
          </div>
          ${(state.searchQuery || state.activeCategory !== 'All' || state.showFavoritesOnly) ? `
            <button onclick="novaAction.clearSearch(); novaAction.setCategory('All');" class="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
              Reset filters
            </button>
          ` : ''}
        </div>

        <!-- Games Grid -->
        ${filteredGames.length > 0 ? `
          <div class="${state.viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col space-y-2'}">
            ${filteredGames.map(game => {
              const isFav = state.favorites.includes(game.id);
              if (state.viewMode === 'compact') {
                return `
                  <div class="group relative flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/70 hover:border-slate-700 transition-all">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 font-mono text-sm" style="background-color: ${game.themeColor}25; border: 1px solid ${game.themeColor}50; color: ${game.themeColor};">
                        ${escapeHtml(game.title.slice(0, 2))}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <h3 class="text-sm font-bold text-white truncate group-hover:text-cyan-400">${escapeHtml(game.title)}</h3>
                          ${game.badge ? `<span class="text-[10px] font-bold text-amber-400 font-mono">[${game.badge}]</span>` : ''}
                        </div>
                        <div class="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span>${game.category}</span>
                          <span>•</span>
                          <span class="text-amber-400">★ ${Number(game.rating).toFixed(1)}</span>
                          <span>•</span>
                          <span>${game.plays} plays</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 ml-4">
                      <button onclick="novaAction.toggleFavorite('${game.id}', event)" class="p-2 rounded-lg text-slate-400 hover:text-amber-400">
                        ${isFav ? ICONS.starFilled : ICONS.star}
                      </button>
                      <button onclick="novaAction.selectGame('${game.id}')" class="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                        ${ICONS.play}
                        <span>PLAY</span>
                      </button>
                    </div>
                  </div>
                `;
              }

              return `
                <div onclick="novaAction.selectGame('${game.id}')" class="group relative flex flex-col justify-between rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700/80 p-4 transition-all hover:shadow-xl hover:shadow-cyan-500/5 cursor-pointer">
                  <div>
                    <div class="flex items-start justify-between gap-3 mb-3">
                      <div class="flex items-center gap-2.5">
                        <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner" style="background-color: ${game.themeColor}1a; border: 1px solid ${game.themeColor}40; color: ${game.themeColor};">
                          ${ICONS.zap}
                        </div>
                        <div>
                          <span class="text-xs text-slate-400 font-medium">${game.category}</span>
                          <div class="text-[11px] text-slate-500">${game.plays} plays</div>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5">
                        ${game.badge ? `
                          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider" style="background-color: ${game.themeColor}15; color: ${game.themeColor}; border: 1px solid ${game.themeColor}30;">
                            ${game.badge}
                          </span>
                        ` : ''}
                        <button onclick="novaAction.toggleFavorite('${game.id}', event)" class="p-1.5 rounded-md text-slate-400 hover:text-amber-400">
                          ${isFav ? ICONS.starFilled : ICONS.star}
                        </button>
                      </div>
                    </div>
                    <h3 class="font-extrabold text-base text-white group-hover:text-cyan-400 transition-colors mb-1.5 line-clamp-1">${escapeHtml(game.title)}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">${escapeHtml(game.description)}</p>
                    <div class="flex flex-wrap gap-1.5 mb-4">
                      ${(game.tags || []).slice(0, 3).map(t => `
                        <span class="text-[11px] font-mono text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded">#${escapeHtml(t)}</span>
                      `).join('')}
                    </div>
                  </div>
                  <div class="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div class="flex items-center gap-1 text-xs">
                      <span class="text-amber-400 font-bold">★ ${Number(game.rating).toFixed(1)}</span>
                      <span class="text-slate-500">/ 5.0</span>
                    </div>
                    <button class="px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-cyan-500/20 group-hover:scale-105">
                      ${ICONS.play}
                      <span>PLAY NOW</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center my-8">
            <h3 class="text-base font-bold text-white mb-1">No unblocked games found</h3>
            <p class="text-xs text-slate-400 max-w-sm mb-5">Try searching with different keywords or add your own custom game.</p>
            <button onclick="novaAction.clearSearch(); novaAction.setCategory('All');" class="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              Clear Filters
            </button>
          </div>
        `}
      </main>

      <!-- Footer -->
      <footer class="w-full border-t border-slate-800/80 bg-slate-950/70 mt-12 py-6 text-xs text-slate-400">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-slate-200">NOVA ARCADE</span>
            <span>•</span>
            <span>Unblocked Games JSON Store</span>
          </div>
          <div class="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Shortcuts:</span>
            <span><kbd>/</kbd> Search</span>
            <span><kbd>~</kbd> Panic Cloak</span>
            <span><kbd>Esc</kbd> Exit Player</span>
          </div>
          <button onclick="novaAction.openJsonViewer()" class="text-cyan-400 hover:underline">
            Inspect games.json
          </button>
        </div>
      </footer>

      <!-- Game Player Modal -->
      ${renderGamePlayer()}

      <!-- Tab Cloak Modal -->
      ${renderCloakModal()}

      <!-- Add Custom Game Modal -->
      ${renderAddGameModal()}

      <!-- Inspect JSON Modal -->
      ${renderJsonModal()}
    </div>
  `;
}

// Sub-renderers
function renderGamePlayer() {
  const game = state.selectedGame;
  if (!game) return '';
  const isFav = state.favorites.includes(game.id);

  return `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-start py-4 sm:py-8 px-2 sm:px-4">
      <div class="w-full max-w-5xl flex flex-col gap-4">
        <!-- Top Controls Bar -->
        <div class="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
          <div class="flex items-center gap-3">
            <button onclick="novaAction.closeGame()" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white" title="Close (Esc)">
              ${ICONS.close}
            </button>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base sm:text-lg font-bold text-white">${escapeHtml(game.title)}</h2>
                <span class="text-xs text-slate-400 font-mono">[${game.category}]</span>
              </div>
              <p class="text-xs text-slate-400 hidden sm:block">Loaded via JSON Iframe • Safe Sandbox Active</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="novaAction.reloadGame()" class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white" title="Restart game">
              ${ICONS.reload}
            </button>
            <button onclick="novaAction.toggleFavorite('${game.id}')" class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400">
              ${isFav ? ICONS.starFilled : ICONS.star}
            </button>
            <button onclick="novaAction.openAboutBlank()" class="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium" title="about:blank cloak tab">
              ${ICONS.popout}
              <span>Cloak Popout</span>
            </button>
            <button onclick="novaAction.toggleFullscreen()" class="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold" title="Fullscreen">
              ${ICONS.fullscreen}
            </button>
          </div>
        </div>

        <!-- Stage Viewport Container -->
        <div id="game-stage-wrapper" class="relative w-full rounded-2xl bg-black border-2 border-slate-800 shadow-2xl overflow-hidden aspect-video min-h-[420px] max-h-[75vh] flex items-center justify-center">
          <iframe
            key="${state.iframeKey}"
            title="${escapeHtml(game.title)}"
            ${game.iframe.type === 'srcdoc' ? `srcdoc="${escapeHtml(game.iframe.content)}"` : `src="${escapeHtml(game.iframe.content)}"`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals"
            allow="fullscreen; autoplay; gamepad"
            style="width: 100%; height: 100%; border: none;"
          ></iframe>
        </div>

        <!-- Game Controls & Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-1 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-3 text-cyan-400 font-bold text-sm">
              ${ICONS.keyboard}
              <span>CONTROLS</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              ${escapeHtml(game.controls)}
            </p>
          </div>
          <div class="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div class="text-cyan-400 font-bold text-sm mb-2">OBJECTIVE & HOW TO PLAY</div>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">${escapeHtml(game.description)}</p>
              ${game.instructions ? `
                <ul class="space-y-1 text-xs text-slate-400">
                  ${game.instructions.map(i => `<li class="flex items-start gap-2"><span class="text-cyan-400 font-bold">›</span><span>${escapeHtml(i)}</span></li>`).join('')}
                </ul>
              ` : ''}
            </div>
            <div class="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>Rating: <strong class="text-amber-400">★ ${game.rating}</strong> • Plays: <strong>${game.plays}</strong></span>
              <button onclick="navigator.clipboard.writeText(window.location.href); alert('Page link copied!');" class="text-slate-400 hover:text-cyan-400">Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCloakModal() {
  if (!state.isCloakModalOpen) return '';
  return `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2 text-cyan-400 font-bold">
            ${ICONS.shield}
            <h3 class="text-white text-lg font-bold">Tab Cloaking & Stealth</h3>
          </div>
          <button onclick="novaAction.closeCloakModal()" class="p-1 rounded-lg text-slate-400 hover:text-white">${ICONS.close}</button>
        </div>
        <p class="text-xs text-slate-400 mt-3 leading-relaxed">
          Disguises your browser tab title and favicon to appear as common school utilities.
        </p>
        <div class="mt-4 space-y-2 max-h-72 overflow-y-auto">
          ${CLOAK_PRESETS.map(p => `
            <div onclick="novaAction.chooseCloak('${p.id}')" class="p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              state.currentCloak === p.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60'
            }">
              <div>
                <div class="font-bold text-sm text-white">${p.name}</div>
                <div class="text-[11px] text-slate-400 font-mono mt-0.5">Tab: "${p.title}"</div>
              </div>
              <div>${state.currentCloak === p.id ? '<span class="text-xs font-mono text-cyan-400 font-bold">ACTIVE</span>' : ''}</div>
            </div>
          `).join('')}
        </div>
        <div class="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button onclick="novaAction.closeCloakModal()" class="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white">Done</button>
        </div>
      </div>
    </div>
  `;
}

function renderAddGameModal() {
  if (!state.isAddGameOpen) return '';
  return `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2 text-cyan-400 font-bold">
            ${ICONS.plus}
            <h3 class="text-white text-lg font-bold">Add Custom Iframe Game</h3>
          </div>
          <button onclick="novaAction.closeAddGame()" class="p-1 rounded-lg text-slate-400 hover:text-white">${ICONS.close}</button>
        </div>
        <form onsubmit="novaAction.submitCustomGame(event)" class="mt-4 space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Game Title</label>
            <input name="title" required placeholder="e.g. Space Runner" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Category</label>
              <select name="category" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500">
                <option value="Arcade">Arcade</option>
                <option value="Action">Action</option>
                <option value="Retro">Retro</option>
                <option value="Puzzle">Puzzle</option>
                <option value="Sports">Sports</option>
                <option value="Strategy">Strategy</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Embed Type</label>
              <select name="embedType" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500">
                <option value="src">URL (HTTPS)</option>
                <option value="srcdoc">Raw HTML Code</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Iframe Content (URL or HTML)</label>
            <textarea name="content" required rows="3" placeholder="https://example.com/game.html or HTML code" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
            <input name="description" placeholder="Short description..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Controls</label>
            <input name="controls" placeholder="Arrow keys to steer" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          </div>
          <div class="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button type="button" onclick="novaAction.closeAddGame()" class="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950">Add To Library</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderJsonModal() {
  if (!state.isJsonViewerOpen) return '';
  const jsonString = JSON.stringify(state.games, null, 2);

  return `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-2.5 text-cyan-400">
            ${ICONS.fileCode}
            <div>
              <h3 class="font-extrabold text-lg text-white">games.json Data Store</h3>
              <p class="text-xs text-slate-400">Loaded into memory for instant zero-latency iframe execution across school browsers.</p>
            </div>
          </div>
          <button onclick="novaAction.closeJsonViewer()" class="p-1 rounded-lg text-slate-400 hover:text-white">${ICONS.close}</button>
        </div>
        <div class="flex items-center justify-end gap-2 py-3 shrink-0">
          <button id="copy-json-btn" onclick="novaAction.copyJson()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200">
            ${ICONS.copy}
            <span>Copy JSON</span>
          </button>
          <button onclick="novaAction.downloadJson()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950">
            ${ICONS.download}
            <span>Download games.json</span>
          </button>
        </div>
        <div class="flex-1 overflow-auto rounded-xl bg-slate-950 border border-slate-800/80 p-4 font-mono text-[11px] text-slate-300 leading-relaxed">
          <pre>${escapeHtml(jsonString)}</pre>
        </div>
        <div class="pt-3 mt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between shrink-0">
          <span>Total Games: ${state.games.length} | Format: JSON Iframe Store</span>
          <button onclick="novaAction.closeJsonViewer()" class="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white">Close</button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initial Boot
applyCloak(state.currentCloak);
loadGames();
render();
