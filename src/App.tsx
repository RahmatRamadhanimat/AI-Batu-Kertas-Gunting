import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { WebcamScanner } from './components/WebcamScanner';
import { ArenaBoard } from './components/ArenaBoard';
import { MatchHistory } from './components/MatchHistory';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { GithubDeployGuideModal } from './components/GithubDeployGuideModal';
import { TeachableTutorialModal } from './components/TeachableTutorialModal';
import { GamePhase, GameResult, MatchMode, Move, PredictionItem, RoundHistory, ScoreState, ModelMetadata } from './types';
import {
  DEFAULT_MODEL_URL,
  TmModel,
  loadTeachableModel,
  determineWinner,
  getRandomComputerMove,
} from './utils/teachableMachine';
import { soundFx } from './utils/soundEffects';

export default function App() {
  // Model state
  const [model, setModel] = useState<TmModel | null>(null);
  const [modelMeta, setModelMeta] = useState<ModelMetadata>({
    url: DEFAULT_MODEL_URL,
    labels: ['Batu', 'Gunting', 'Kertas', 'Netral'],
    isLoaded: false,
    isLoading: false,
    error: null,
  });

  // Sound state
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Manual gesture simulator toggle
  const [isManualMode, setIsManualMode] = useState<boolean>(false);

  // Live real-time detections
  const [liveMove, setLiveMove] = useState<Move>('none');
  const [liveConfidence, setLiveConfidence] = useState<number>(0);
  const liveMoveRef = useRef<Move>('none');
  const liveConfidenceRef = useRef<number>(0);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [lockedPlayerMove, setLockedPlayerMove] = useState<Move>('none');
  const [lockedComputerMove, setLockedComputerMove] = useState<Move>('none');
  const [roundResult, setRoundResult] = useState<GameResult | null>(null);
  const [lastConfidence, setLastConfidence] = useState<number>(0);

  const [matchMode, setMatchMode] = useState<MatchMode>('endless');
  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  const [score, setScore] = useState<ScoreState>({
    player: 0,
    computer: 0,
    draws: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  const [history, setHistory] = useState<RoundHistory[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

  // Auto next round timeout ref
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update live move ref for synchronous capture during countdown
  const handlePredictionUpdate = useCallback(
    (move: Move, confidence: number, _items: PredictionItem[]) => {
      setLiveMove(move);
      setLiveConfidence(confidence);
      liveMoveRef.current = move;
      liveConfidenceRef.current = confidence;
    },
    []
  );

  // Load Teachable Machine model
  const loadModelFromUrl = useCallback(async (url: string) => {
    setModelMeta((prev) => ({ ...prev, isLoading: true, error: null, url }));
    try {
      const { model: loadedModel, labels } = await loadTeachableModel(url);
      setModel(loadedModel);
      setModelMeta({
        url,
        labels,
        isLoaded: true,
        isLoading: false,
        error: null,
        totalClasses: labels.length,
      });
      setIsManualMode(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('Gagal memuat Teachable Machine model:', errorMsg);
      setModel(null);
      setModelMeta((prev) => ({
        ...prev,
        isLoaded: false,
        isLoading: false,
        error: errorMsg,
      }));
      // Enable manual mode as fallback so the game remains completely playable
      setIsManualMode(true);
      throw err;
    }
  }, []);

  // Initial attempt to load default model
  useEffect(() => {
    loadModelFromUrl(DEFAULT_MODEL_URL).catch(() => {
      // If default remote model cannot be fetched (e.g. offline/network), fallback gracefully
      setIsManualMode(true);
    });
  }, [loadModelFromUrl]);

  // Sound toggle
  const toggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  // Manual move selection
  const handleManualSelectMove = (move: Move) => {
    setLiveMove(move);
    setLiveConfidence(1);
    liveMoveRef.current = move;
    liveConfidenceRef.current = 1;
    soundFx.playClick();
  };

  // Start round countdown
  const startRound = useCallback(() => {
    if (phase === 'countdown' || phase === 'evaluating') return;

    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }

    setPhase('countdown');
    setCountdown(3);
    setRoundResult(null);
    setLockedComputerMove('none');
    soundFx.playCountdown(440);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundFx.playCountdown(440 + (3 - count) * 80);
      } else {
        clearInterval(interval);
        evaluateRound();
      }
    }, 1000);
  }, [phase]);

  // Evaluate the round once countdown finishes
  const evaluateRound = () => {
    setPhase('evaluating');
    soundFx.playShoot();

    setTimeout(() => {
      // Capture player move
      let pMove = liveMoveRef.current;
      const pConf = liveConfidenceRef.current;

      // If user showed nothing or 'none', fallback to a default gesture or let them know
      if (pMove === 'none') {
        // Pick rock as a fallback gesture if hand was missed
        pMove = 'rock';
      }

      // Generate computer choice
      const cMove = getRandomComputerMove();

      // Determine winner
      const outcome = determineWinner(pMove, cMove);

      setLockedPlayerMove(pMove);
      setLockedComputerMove(cMove);
      setRoundResult(outcome);
      setLastConfidence(pConf);
      setPhase('result');

      // Play corresponding sound
      if (outcome === 'win') {
        soundFx.playWin();
      } else if (outcome === 'lose') {
        soundFx.playLose();
      } else {
        soundFx.playDraw();
      }

      // Update score and history
      setScore((prev) => {
        const isWin = outcome === 'win';
        const isLoss = outcome === 'lose';
        const newStreak = isWin ? prev.streak + 1 : 0;
        const newBest = Math.max(prev.bestStreak, newStreak);

        return {
          player: prev.player + (isWin ? 1 : 0),
          computer: prev.computer + (isLoss ? 1 : 0),
          draws: prev.draws + (outcome === 'draw' ? 1 : 0),
          total: prev.total + 1,
          streak: newStreak,
          bestStreak: newBest,
        };
      });

      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          roundNumber: prev.length + 1,
          playerMove: pMove,
          computerMove: cMove,
          result: outcome,
          confidence: pConf,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 49), // Keep latest 50
      ]);

      // Check if autoPlay is active and game isn't finished
      if (autoPlay) {
        autoPlayTimerRef.current = setTimeout(() => {
          startRound();
        }, 3200);
      }
    }, 450);
  };

  const handleResetGame = () => {
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    setScore({
      player: 0,
      computer: 0,
      draws: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
    setPhase('idle');
    setRoundResult(null);
    setLockedPlayerMove('none');
    setLockedComputerMove('none');
    soundFx.playClick();
  };

  const handleClearHistory = () => {
    setHistory([]);
    soundFx.playClick();
  };

  const toggleAutoPlay = () => {
    setAutoPlay((prev) => {
      const next = !prev;
      soundFx.playClick();
      if (next && phase === 'result') {
        autoPlayTimerRef.current = setTimeout(startRound, 1500);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        modelMeta={modelMeta}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        isSimulated={isManualMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Webcam Scanner & Probability Bars (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>Deteksi Gestur Kamera</span>
                <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  Live Feed
                </span>
              </h2>
            </div>

            <WebcamScanner
              model={model}
              isModelLoaded={modelMeta.isLoaded}
              onPredictionUpdate={handlePredictionUpdate}
              activeMove={liveMove}
              activeConfidence={liveConfidence}
              isManualMode={isManualMode}
              onToggleManualMode={() => setIsManualMode((prev) => !prev)}
              onManualSelectMove={handleManualSelectMove}
            />
          </div>

          {/* Right Column: Battle Arena & History (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ArenaBoard
              phase={phase}
              countdown={countdown}
              playerMove={phase === 'result' ? lockedPlayerMove : liveMove}
              computerMove={lockedComputerMove}
              result={roundResult}
              score={score}
              matchMode={matchMode}
              onSetMatchMode={setMatchMode}
              onStartRound={startRound}
              onResetGame={handleResetGame}
              autoPlay={autoPlay}
              onToggleAutoPlay={toggleAutoPlay}
              lastConfidence={lastConfidence}
            />

            <MatchHistory
              history={history}
              score={score}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Batu Gunting Kertas AI © {new Date().getFullYear()} — Teachable Machine & TensorFlow.js
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Panduan Latih AI
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="hover:text-sky-400 transition-colors cursor-pointer"
            >
              Panduan GitHub Pages
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        modelMeta={modelMeta}
        onLoadModel={loadModelFromUrl}
        isSimulated={isManualMode}
        onToggleSimulated={() => setIsManualMode((prev) => !prev)}
      />

      <TeachableTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <GithubDeployGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}
