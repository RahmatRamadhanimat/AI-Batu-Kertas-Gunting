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
  const getOutcomeText = () => {
    if (!result) return null;
    switch (result) {
      case 'win':
        return {
          title: 'KAMU MENANG!',
          subtitle: 'Kerja bagus! Gestur tanganmu berhasil mengalahkan AI.',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
          badge: 'bg-emerald-500 text-slate-950',
        };
      case 'lose':
        return {
          title: 'KOMPUTER MENANG!',
          subtitle: 'Jangan menyerah! Coba tebak langkah AI berikutnya.',
          color: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
          badge: 'bg-rose-500 text-white',
        };
      case 'draw':
        return {
          title: 'HASIL SERI!',
          subtitle: 'Kalian mengeluarkan pilihan yang sama persis.',
          color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
          badge: 'bg-amber-500 text-slate-950',
        };
    }
  };

  const getReasonExplanation = () => {
    if (playerMove === computerMove) return `${formatMoveIndonesian(playerMove)} sama dengan ${formatMoveIndonesian(computerMove)}`;
    if (playerMove === 'rock' && computerMove === 'scissors') return 'Batu menghancurkan Gunting ✊ > ✌️';
    if (playerMove === 'scissors' && computerMove === 'paper') return 'Gunting memotong Kertas ✌️ > ✋';
    if (playerMove === 'paper' && computerMove === 'rock') return 'Kertas membungkus Batu ✋ > ✊';
    if (computerMove === 'rock' && playerMove === 'scissors') return 'Batu lawan menghancurkan Guntingmu ✊ > ✌️';
    if (computerMove === 'scissors' && playerMove === 'paper') return 'Gunting lawan memotong Kertasmu ✌️ > ✋';
    if (computerMove === 'paper' && playerMove === 'rock') return 'Kertas lawan membungkus Batumu ✋ > ✊';
    return '';
  };

  const outcome = getOutcomeText();

  // Target wins for match mode
  const targetWins = matchMode === 'best_of_3' ? 2 : matchMode === 'best_of_5' ? 3 : null;
  const isMatchFinished =
    targetWins !== null && (score.player >= targetWins || score.computer >= targetWins);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header Scoreboard Bar */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Mode Selector & Reset */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSetMatchMode('endless')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                matchMode === 'endless'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bebas (Endless)
            </button>
            <button
              onClick={() => onSetMatchMode('best_of_3')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                matchMode === 'best_of_3'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Best of 3
            </button>
            <button
              onClick={() => onSetMatchMode('best_of_5')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                matchMode === 'best_of_5'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Best of 5
            </button>
          </div>

          {/* Quick Stats: Streaks & Rounds */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Streak: {score.streak}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                (Best: {score.bestStreak})
              </span>
            </div>

            <div className="text-slate-400 font-medium">
              Total Ronde: <span className="font-bold text-white">{score.total}</span>
            </div>

            <button
              onClick={onResetGame}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
              title="Reset Skor"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score comparison display */}
        <div className="grid grid-cols-3 items-center mt-4 pt-4 border-t border-slate-800/80">
          {/* Player Score */}
          <div className="text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-bold text-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Kamu (Player)
              </div>
              <div className="text-3xl sm:text-4xl font-black text-sky-400 font-display">
                {score.player}
              </div>
            </div>
          </div>

          {/* Center VS & Draws */}
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest font-black text-slate-500">VS</div>
            <div className="text-xs font-bold text-slate-400 mt-1">
              Seri: <span className="text-amber-400">{score.draws}</span>
            </div>
            {targetWins && (
              <div className="text-[10px] text-slate-500 mt-0.5">
                Target: {targetWins} Kemenangan
              </div>
            )}
          </div>

          {/* Computer Score */}
          <div className="text-center sm:text-right flex flex-col sm:flex-row-reverse items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                AI Komputer
              </div>
              <div className="text-3xl sm:text-4xl font-black text-rose-400 font-display">
                {score.computer}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Duel Stage */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden min-h-[320px] flex flex-col justify-between">
        {/* Decorative Grid and Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Top announcement bar during countdown */}
        {phase === 'countdown' && (
          <div className="text-center animate-bounce z-10">
            <span className="text-xs uppercase tracking-widest font-extrabold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ⚡ Tunjukkan gestur tangan ke kamera sekarang!
            </span>
          </div>
        )}

        {/* Duel Center Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center my-auto z-10">
          {/* Player Hand Card */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Gestur Kamu
            </div>

            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-slate-950/80 border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                phase === 'result' && result === 'win'
                  ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.35)] scale-105'
                  : 'border-slate-800'
              }`}
            >
              <div className="text-6xl sm:text-7xl select-none filter drop-shadow-md animate-in zoom-in duration-200">
                {getMoveEmoji(playerMove)}
              </div>
              <div className="mt-2 text-sm font-bold text-slate-200">
                {playerMove === 'none' ? 'Belum Terdeteksi' : formatMoveIndonesian(playerMove)}
              </div>
            </div>

            {lastConfidence > 0 && phase === 'result' && (
              <div className="mt-2 text-[11px] font-mono text-slate-400">
                Akurasi Model: <span className="text-amber-400 font-bold">{Math.round(lastConfidence * 100)}%</span>
              </div>
            )}
          </div>

          {/* Center Action & Countdown Display */}
          <div className="flex flex-col items-center justify-center text-center py-2">
            {phase === 'countdown' ? (
              <div className="flex flex-col items-center justify-center">
                <div className="text-7xl sm:text-8xl font-black text-amber-400 font-display animate-ping scale-110 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  {countdown}
                </div>
                <div className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-300">
                  Bersiap...
                </div>
              </div>
            ) : phase === 'evaluating' ? (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-3" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Menganalisis...
                </span>
              </div>
            ) : phase === 'result' && outcome ? (
              <div className="flex flex-col items-center max-w-xs animate-in zoom-in-95 duration-200">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2 ${outcome.badge}`}
                >
                  {result === 'win' ? 'VICTORY' : result === 'lose' ? 'DEFEATED' : 'DRAW'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {outcome.title}
                </h2>
                <p className="text-xs font-semibold text-amber-300 mt-1">
                  {getReasonExplanation()}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{outcome.subtitle}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Siap Bertanding?</h3>
                <p className="text-xs text-slate-400 mt-1 text-center">
                  Arahkan tanganmu ke kamera, lalu tekan tombol "Mulai Ronde"!
                </p>
              </div>
            )}
          </div>

          {/* Computer Hand Card */}
          <div className="flex flex-col items-center text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Pilihan AI Bot
            </div>

            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-slate-950/80 border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                phase === 'result' && result === 'lose'
                  ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)] scale-105'
                  : 'border-slate-800'
              }`}
            >
              {phase === 'countdown' ? (
                <div className="text-5xl animate-spin select-none">🎲</div>
              ) : phase === 'idle' && computerMove === 'none' ? (
                <div className="text-6xl text-slate-600 select-none">🤖</div>
              ) : (
                <>
                  <div className="text-6xl sm:text-7xl select-none filter drop-shadow-md">
                    {getMoveEmoji(computerMove)}
                  </div>
                  <div className="mt-2 text-sm font-bold text-slate-200">
                    {computerMove === 'none' ? 'Menunggu...' : formatMoveIndonesian(computerMove)}
                  </div>
                </>
              )}
            </div>

            <div className="mt-2 text-[11px] font-mono text-slate-400">
              AI Algoritma: <span className="text-rose-400 font-bold">Tensor Randomizer</span>
            </div>
          </div>
        </div>

        {/* Match Finished Notification */}
        {isMatchFinished && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-center z-10 animate-in fade-in duration-300">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1.5" />
            <h3 className="text-lg font-black text-white">
              {score.player >= (targetWins || 0)
                ? '🏆 SELAMAT! Kamu Memenangkan Pertandingan!'
                : '🤖 AI Komputer Memenangkan Seri Ini!'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Skor Akhir: Kamu {score.player} - {score.computer} Komputer
            </p>
            <button
              onClick={onResetGame}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg"
            >
              Mainkan Seri Baru
            </button>
          </div>
        )}

        {/* Bottom Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 z-10 pt-4 border-t border-slate-800/80">
          <button
            id="btn-start-round"
            onClick={onStartRound}
            disabled={phase === 'countdown' || phase === 'evaluating'}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>
              {phase === 'countdown'
                ? 'Hitung Mundur...'
                : phase === 'result'
                ? 'Ronde Berikutnya (Next Round)'
                : 'Mulai Ronde Sekarang!'}
            </span>
          </button>

          {/* Auto Next Round toggle */}
          <button
            id="btn-auto-play"
            onClick={onToggleAutoPlay}
            className={`w-full sm:w-auto px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              autoPlay
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoPlay ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            Auto Lanjut: {autoPlay ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};
