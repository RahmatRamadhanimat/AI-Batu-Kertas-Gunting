import React from 'react';
import { Sparkles, Volume2, VolumeX, Settings2, Github, BookOpen, Camera } from 'lucide-react';
import { ModelMetadata } from '../types';

interface NavbarProps {
  modelMeta: ModelMetadata;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenDeployGuide: () => void;
  onOpenTutorial: () => void;
  isSimulated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  modelMeta,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenDeployGuide,
  onOpenTutorial,
  isSimulated,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Branding & Model status */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-xl font-black text-white select-none">
              ✊✌️✋
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                Batu Gunting Kertas AI
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  TensorFlow.js
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Powered by Google Teachable Machine & Camera Detection
              </p>
            </div>
          </div>

          {/* Mobile status indicator */}
          <div className="sm:hidden">
            <button
              onClick={onOpenSettings}
              className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
                modelMeta.isLoaded
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : isSimulated
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {modelMeta.isLoaded ? 'AI Ready' : isSimulated ? 'Mode Manual' : 'Model Error'}
            </button>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Desktop Model Status badge button */}
          <button
            id="btn-model-status"
            onClick={onOpenSettings}
            className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              modelMeta.isLoaded
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                : isSimulated
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:bg-amber-900/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40'
            }`}
            title="Klik untuk ganti model Teachable Machine"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                modelMeta.isLoaded
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isSimulated
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              } animate-pulse`}
            />
            <span>
              {modelMeta.isLoading
                ? 'Memuat Model...'
                : modelMeta.isLoaded
                ? 'Model AI Aktif'
                : isSimulated
                ? 'Mode Simulasi'
                : 'Muat Model'}
            </span>
            <Settings2 className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {/* Tutorial Button */}
          <button
            id="btn-tutorial"
            onClick={onOpenTutorial}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            title="Cara membuat & melatih model di Teachable Machine"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Tutorial Latih Model</span>
            <span className="md:hidden">Tutorial</span>
          </button>

          {/* GitHub Pages Deploy Guide Button */}
          <button
            id="btn-github-guide"
            onClick={onOpenDeployGuide}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
            title="Panduan Deploy ke GitHub Pages"
          >
            <Github className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Deploy GitHub Pages</span>
            <span className="md:hidden">Deploy</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isMuted
                ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title={isMuted ? 'Suara Dinonaktifkan (Klik untuk aktifkan)' : 'Suara Aktif (Klik untuk bisukan)'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
