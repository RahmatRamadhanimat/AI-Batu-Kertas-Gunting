import React from 'react';
import { Play, RotateCcw, Trophy, Flame, Zap, Shield, Sparkles, Bot, User } from 'lucide-react';
import { GamePhase, GameResult, MatchMode, Move, ScoreState } from '../types';
import { formatMoveIndonesian, getMoveEmoji } from '../utils/teachableMachine';

interface ArenaBoardProps {
  phase: GamePhase;
  countdown: number;
  playerMove: Move;
  computerMove: Move;
  result: GameResult | null;
  score: ScoreState;
  matchMode: MatchMode;
  onSetMatchMode: (mode: MatchMode) => void;
  onStartRound: () => void;
  onResetGame: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
  lastConfidence: number;
}

export const ArenaBoard: React.FC<ArenaBoardProps> = ({
  phase,
  countdown,
  playerMove,
  computerMove,
  result,
  score,
  matchMode,
  onSetMatchMode,
  onStartRound,
  onResetGame,
  autoPlay,
  onToggleAutoPlay,
  lastConfidence,
}) => {
  const targetWins = matchMode === 'best_of_3' ? 2 : matchMode === 'best_of_5' ? 3 : null;
  const isMatchFinished =
    targetWins !== null && (score.player >= targetWins || score.computer >= targetWins);

  const getCardBorder = (moveResult: 'win' | 'lose' | 'draw' | null) => {
    if (!moveResult) return 'border-white/5';
    if (moveResult === 'win') return 'border-white/30 bg-white/5';
    if (moveResult === 'lose') return 'border-rose-500/20 bg-rose-500/5 opacity-50';
    return 'border-white/10 opacity-70';
  };

  return (
    <div className="flex flex-col gap-8 flex-1 h-full">
      {/* Top Header / Mode Selection */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5">
          {['endless', 'best_of_3', 'best_of_5'].map((mode) => (
            <button
              key={mode}
              onClick={() => onSetMatchMode(mode as MatchMode)}
              className={`text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full transition-all cursor-pointer ${
                matchMode === mode
                  ? 'bg-white text-black'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">STREAK</span>
            <span className="text-sm font-bold text-white">{score.streak}</span>
          </div>
          <button
            onClick={onResetGame}
            className="w-8 h-8 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Reset Match"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Scoreboard Display */}
      <div className="flex items-center justify-center gap-8 md:gap-24 my-4">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">YOU</span>
          <span className="text-7xl md:text-9xl font-display font-black text-white leading-none tracking-tighter">
            {score.player}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <span className="text-xs font-display font-black text-zinc-700 tracking-widest mb-1">VS</span>
          {targetWins && (
            <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-600">
              FIRST TO {targetWins}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-2">AI</span>
          <span className="text-7xl md:text-9xl font-display font-black text-zinc-700 leading-none tracking-tighter">
            {score.computer}
          </span>
        </div>
      </div>

      {/* Duel Arena */}
      <div className="flex-1 relative flex flex-col items-center justify-center py-8">
        <div className="flex items-center justify-center gap-6 md:gap-16 w-full max-w-3xl mx-auto">
          
          {/* Player Card */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-32 h-32 md:w-56 md:h-56 rounded-[2rem] md:rounded-[3rem] glass-panel border flex items-center justify-center transition-all duration-500 ${getCardBorder(
                phase === 'result' ? (result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'draw') : null
              )}`}
            >
              <div className={`text-6xl md:text-8xl filter grayscale transition-transform duration-500 ${phase === 'result' && result === 'win' ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}`}>
                {getMoveEmoji(playerMove)}
              </div>
            </div>
          </div>

          {/* Center Action State */}
          <div className="w-16 md:w-32 flex flex-col items-center justify-center text-center">
            {phase === 'countdown' ? (
              <span className="text-6xl md:text-8xl font-display font-black text-white animate-pulse">
                {countdown}
              </span>
            ) : phase === 'evaluating' ? (
              <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : phase === 'result' ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-300">
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${
                  result === 'win' ? 'text-white' : result === 'lose' ? 'text-rose-500' : 'text-zinc-500'
                }`}>
                  {result === 'win' ? 'VICTORY' : result === 'lose' ? 'DEFEAT' : 'DRAW'}
                </span>
              </div>
            ) : (
              <span className="text-xs text-zinc-700 font-bold uppercase tracking-widest">READY</span>
            )}
          </div>

          {/* Computer Card */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-32 h-32 md:w-56 md:h-56 rounded-[2rem] md:rounded-[3rem] glass-panel border flex items-center justify-center transition-all duration-500 ${getCardBorder(
                phase === 'result' ? (result === 'lose' ? 'win' : result === 'win' ? 'lose' : 'draw') : null
              )}`}
            >
              <div className={`text-6xl md:text-8xl filter grayscale transition-transform duration-500 ${phase === 'result' && result === 'lose' ? 'scale-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]' : ''}`}>
                {phase === 'countdown' ? '🎲' : phase === 'idle' && computerMove === 'none' ? '🤖' : getMoveEmoji(computerMove)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-12 flex flex-col items-center gap-6 w-full">
          {isMatchFinished ? (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-display font-black text-white mb-6 uppercase tracking-wider">
                {score.player >= (targetWins || 0) ? 'MATCH WON' : 'MATCH LOST'}
              </h3>
              <button
                onClick={onResetGame}
                className="px-8 py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold uppercase tracking-widest rounded-full transition-transform active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </div>
          ) : (
            <button
              onClick={onStartRound}
              disabled={phase === 'countdown' || phase === 'evaluating'}
              className="group relative px-8 py-4 bg-white hover:bg-zinc-200 text-black text-sm font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Play className="w-4 h-4 fill-black" />
                {phase === 'countdown'
                  ? 'PREPARING...'
                  : phase === 'result'
                  ? 'NEXT ROUND'
                  : 'START ROUND'}
              </span>
            </button>
          )}

          {/* Auto Play Toggle */}
          <button
            onClick={onToggleAutoPlay}
            className={`text-[9px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border transition-colors flex items-center gap-2 cursor-pointer ${
              autoPlay
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-transparent text-zinc-600 border-white/5 hover:text-zinc-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoPlay ? 'bg-white animate-pulse' : 'bg-zinc-700'}`} />
            AUTO CONTINUOUS
          </button>
        </div>
      </div>
    </div>
  );
};
