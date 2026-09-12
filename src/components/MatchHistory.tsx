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
    <div className="glass-panel rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          MATCH LOG
        </h3>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            CLEAR LOG
          </button>
        )}
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-600 font-bold uppercase tracking-widest">
          NO MATCHES RECORDED
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {history.map((item) => {
            const isWin = item.result === 'win';
            const isLose = item.result === 'lose';
            
            return (
              <div
                key={item.id}
                className={`min-w-[140px] p-4 rounded-2xl border flex flex-col items-center gap-3 shrink-0 ${
                  isWin ? 'bg-white/10 border-white/20' : isLose ? 'bg-rose-900/10 border-rose-500/20 opacity-50' : 'bg-white/5 border-white/5 opacity-70'
                }`}
              >
                <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                  ROUND {item.roundNumber}
                </div>
                
                <div className="flex items-center gap-2 text-2xl grayscale">
                  <span title="Kamu">{getMoveEmoji(item.playerMove)}</span>
                  <span className="text-[10px] font-bold text-zinc-600">VS</span>
                  <span title="AI">{getMoveEmoji(item.computerMove)}</span>
                </div>

                <div className={`text-[9px] font-bold uppercase tracking-widest ${
                  isWin ? 'text-white' : isLose ? 'text-rose-500' : 'text-zinc-400'
                }`}>
                  {isWin ? 'WIN' : isLose ? 'LOSE' : 'DRAW'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
