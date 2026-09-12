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
    <div className="min-h-screen bg-mesh font-sans selection:bg-white selection:text-black flex flex-col">
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
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-4 md:p-8 lg:p-12 flex flex-col">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 flex-1">
          {/* Left Column: Live Webcam Scanner & Probability Bars (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <span>SENSOR FEED</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
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

          {/* Right Column: Battle Arena & History (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-8">
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
      <footer className="mt-auto border-t border-white/5 bg-[#050505]/50 backdrop-blur-md px-6 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600">
        <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            VISION CLASH © {new Date().getFullYear()} — TENSORFLOW.JS EDGE INFERENCE
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              TRAIN AI
            </button>
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              DEPLOYMENT
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
