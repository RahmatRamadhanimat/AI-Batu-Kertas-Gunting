import React from 'react';
import { History, CheckCircle2, XCircle, MinusCircle, Trash2 } from 'lucide-react';
import { RoundHistory, ScoreState } from '../types';
import { formatMoveIndonesian, getMoveEmoji } from '../utils/teachableMachine';

interface MatchHistoryProps {
  history: RoundHistory[];
  score: ScoreState;
  onClearHistory: () => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  history,
  score,
  onClearHistory,
}) => {
  const winRate =
    score.total > 0 ? Math.round((score.player / score.total) * 100) : 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Riwayat Pertandingan
          </h3>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-all cursor-pointer"
            title="Hapus riwayat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">Win Rate</div>
          <div className="text-lg font-black text-emerald-400">{winRate}%</div>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">Menang</div>
          <div className="text-lg font-black text-sky-400">{score.player}</div>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">Kalah</div>
          <div className="text-lg font-black text-rose-400">{score.computer}</div>
        </div>
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Belum ada ronde yang dimainkan. Mulai ronde pertamamu di atas!
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {history.map((item) => {
            let resultBadge = (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <MinusCircle className="w-3 h-3" /> Seri
              </span>
            );

            if (item.result === 'win') {
              resultBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Menang
                </span>
              );
            } else if (item.result === 'lose') {
              resultBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Kalah
                </span>
              );
            }

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 font-bold">
                    #{item.roundNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-base" title="Pilihan Kamu">
                      {getMoveEmoji(item.playerMove)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">VS</span>
                    <span className="text-base" title="Pilihan Komputer">
                      {getMoveEmoji(item.computerMove)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {item.confidence > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      {Math.round(item.confidence * 100)}%
                    </span>
                  )}
                  {resultBadge}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
