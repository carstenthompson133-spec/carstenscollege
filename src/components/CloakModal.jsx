import React from 'react';
import { Shield, Check, X, AlertTriangle } from 'lucide-react';

export const CLOAK_PRESETS = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    title: 'Classes - Google Classroom',
    iconUrl: 'https://ssl.gstatic.com/classroom/favicon.png',
    description: 'Disguises your tab as your Google Classroom homepage with official icon and title.',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    title: 'Untitled document - Google Docs',
    iconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico',
    description: 'Looks like you are drafting an assignment document in Google Docs.',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
    description: 'Displays standard Google Drive cloud storage tab title and icon.',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Article',
    title: 'Photosynthesis - Wikipedia',
    iconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
    description: 'Appears as an academic research article on biology and plant science.',
  },
  {
    id: 'calculator',
    name: 'Desmos Calculator',
    title: 'Desmos | Graphing Calculator',
    iconUrl: 'https://www.desmos.com/favicon.ico',
    description: 'Disguises browser tab as an online math and graphing utility.',
  },
  {
    id: 'default',
    name: 'Default (Nova Games)',
    title: 'Nova Unblocked Games',
    iconUrl: '/favicon.ico',
    description: 'Normal unblocked games portal appearance.',
  },
];

export const CloakModal = ({
  isOpen,
  onClose,
  currentCloak,
  onSelectCloak,
  onTriggerPanic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-extrabold text-lg text-white">Tab Cloaking & Stealth</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Tab Cloaking changes this page&apos;s title and favicon so it looks like schoolwork on your browser tabs bar or history.
        </p>

        {/* Panic Screen Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-300">Instant Panic Button</div>
              <div className="text-[11px] text-slate-400">
                Immediately covers the screen with mock Google Classroom screen.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onTriggerPanic();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 shrink-0 transition-colors"
          >
            TEST PANIC
          </button>
        </div>

        {/* Presets List */}
        <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
          {CLOAK_PRESETS.map((preset) => {
            const isSelected = currentCloak === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectCloak(preset.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{preset.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    Tab: &quot;{preset.title}&quot;
                  </div>
                </div>

                <div className="shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-700" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
