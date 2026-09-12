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
    <header className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 transition-all">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] select-none">
              <span className="relative z-10 translate-x-0.5">✊</span>
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-wide text-zinc-100 flex items-center gap-2">
                VISION CLASH
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-zinc-800/50 text-zinc-400 border border-white/5">
                  TF.JS
                </span>
              </h1>
            </div>
          </div>

          {/* Mobile status indicator */}
          <div className="md:hidden">
            <button
              onClick={onOpenSettings}
              className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full flex items-center gap-2 border transition-colors ${
                modelMeta.isLoaded
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : isSimulated
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {modelMeta.isLoaded ? 'AI READY' : isSimulated ? 'MANUAL' : 'ERROR'}
            </button>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Desktop Model Status badge button */}
          <button
            id="btn-model-status"
            onClick={onOpenSettings}
            className={`hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border transition-all ${
              modelMeta.isLoaded
                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                : isSimulated
                ? 'bg-amber-500/5 text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
                : 'bg-rose-500/5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                modelMeta.isLoaded ? 'bg-emerald-400' : isSimulated ? 'bg-amber-400' : 'bg-rose-400'
              } animate-pulse`}
            />
            <span>
              {modelMeta.isLoading
                ? 'LOADING...'
                : modelMeta.isLoaded
                ? 'MODEL SECURED'
                : isSimulated
                ? 'SIMULATION'
                : 'NO MODEL'}
            </span>
            <Settings2 className="w-3.5 h-3.5 opacity-50 ml-1" />
          </button>

          {/* Tutorial Button */}
          <button
            id="btn-tutorial"
            onClick={onOpenTutorial}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">TRAIN MODEL</span>
          </button>

          {/* GitHub Pages Deploy Guide Button */}
          <button
            id="btn-github-guide"
            onClick={onOpenDeployGuide}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 transition-all cursor-pointer"
          >
            <Github className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden lg:inline">DEPLOY</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleMute}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isMuted
                ? 'bg-zinc-900 text-zinc-500 border-white/5 hover:text-zinc-300'
                : 'bg-white text-black border-white hover:bg-zinc-200'
            }`}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
