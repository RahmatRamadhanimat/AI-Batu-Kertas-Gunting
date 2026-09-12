import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Hand, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Move, PredictionItem } from '../types';
import { TmModel, processPredictions, formatMoveIndonesian } from '../utils/teachableMachine';

interface WebcamScannerProps {
  model: TmModel | null;
  isModelLoaded: boolean;
  onPredictionUpdate: (move: Move, confidence: number, allPredictions: PredictionItem[]) => void;
  activeMove: Move;
  activeConfidence: number;
  isManualMode: boolean;
  onToggleManualMode: () => void;
  onManualSelectMove: (move: Move) => void;
}

export const WebcamScanner: React.FC<WebcamScannerProps> = ({
  model,
  isModelLoaded,
  onPredictionUpdate,
  activeMove,
  activeConfidence,
  isManualMode,
  onToggleManualMode,
  onManualSelectMove,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFacingUser, setIsFacingUser] = useState<boolean>(true);
  const [predictions, setPredictions] = useState<PredictionItem[]>([
    { className: 'Batu', probability: 0, mappedMove: 'rock' },
    { className: 'Gunting', probability: 0, mappedMove: 'scissors' },
    { className: 'Kertas', probability: 0, mappedMove: 'paper' },
    { className: 'Netral', probability: 1, mappedMove: 'none' },
  ]);

  // Start webcam
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: isFacingUser ? 'user' : 'environment',
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Camera access error:', msg);
      setCameraError(
        'Kamera tidak dapat diakses atau izin ditolak. Anda tetap bisa bermain menggunakan tombol tes gestur manual di bawah!'
      );
      setIsCameraActive(false);
    }
  }, [isFacingUser]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [startCamera, stopCamera]);

  // Prediction loop using requestAnimationFrame
  useEffect(() => {
    let isActive = true;

    const predictLoop = async () => {
      if (!isActive) return;

      if (
        model &&
        videoRef.current &&
        videoRef.current.readyState >= 2 &&
        isCameraActive &&
        !isManualMode
      ) {
        try {
          const rawPredictions = await model.predict(videoRef.current);
          if (rawPredictions && rawPredictions.length > 0) {
            const processed = processPredictions(rawPredictions);
            setPredictions(processed.items);
            onPredictionUpdate(processed.topMove, processed.topConfidence, processed.items);
          }
        } catch {
          // Frame predict error silently caught to avoid crashing loop
        }
      }

      animationFrameRef.current = requestAnimationFrame(predictLoop);
    };

    animationFrameRef.current = requestAnimationFrame(predictLoop);

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [model, isCameraActive, isManualMode, onPredictionUpdate]);

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const flipCamera = () => {
    setIsFacingUser((prev) => !prev);
  };

  const getActiveGlow = () => {
    if (isManualMode) return 'shadow-none border-white/10';
    switch (activeMove) {
      case 'rock':
        return 'border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)]';
      case 'scissors':
        return 'border-sky-500/50 shadow-[0_0_40px_rgba(14,165,233,0.15)]';
      case 'paper':
        return 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)]';
      default:
        return 'border-white/10 shadow-none';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Viewport Frame */}
      <div
        className={`relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden bg-black transition-all duration-500 border ${getActiveGlow()}`}
      >
        {/* Video stream element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isFacingUser ? '-scale-x-100' : ''
          } ${isCameraActive && !cameraError ? 'opacity-100 grayscale-[0.2] contrast-125' : 'opacity-0'}`}
        />

        {/* Fallback Screen when Camera is off or error */}
        {(!isCameraActive || cameraError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black z-10">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-4">
              <CameraOff className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">
              {cameraError ? 'SENSOR UNAVAILABLE' : 'SENSOR OFFLINE'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
              {cameraError ||
                'Enable camera for neural detection, or use the manual override controls below.'}
            </p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-widest rounded-full transition-transform active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              REINITIALIZE
            </button>
          </div>
        )}

        {/* Minimalist Reticle */}
        <div className="absolute inset-6 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white" />
        </div>

        {/* Floating Top Badge */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
            <span
              className={`w-2 h-2 rounded-full ${
                activeMove !== 'none' ? 'bg-white animate-pulse' : 'bg-zinc-600'
              }`}
            />
            <span className="text-[10px] font-bold text-white tracking-widest uppercase">
              {activeMove !== 'none' ? activeMove : 'AWAITING INPUT'}
            </span>
            {activeMove !== 'none' && (
              <span className="text-[10px] font-mono font-bold text-zinc-400 ml-2">
                {(activeConfidence * 100).toFixed(1)}%
              </span>
            )}
          </div>

          <div className="px-3 py-2 rounded-full text-[9px] font-bold tracking-widest uppercase glass-panel text-zinc-400">
            {isManualMode ? 'MANUAL OVR' : isModelLoaded ? 'AI ACTIVE' : 'NO MODEL'}
          </div>
        </div>

        {/* Floating Camera Controls Bottom-Right */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={toggleCamera}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-white transition-all cursor-pointer"
          >
            {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4 text-rose-400" />}
          </button>
          <button
            onClick={flipCamera}
            disabled={!isCameraActive}
            className="w-10 h-10 flex items-center justify-center rounded-full glass-panel hover:bg-white/10 text-white transition-all cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Controls & Predictions - Flat UI Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
        
        {/* Manual Override Keys */}
        <div className="glass-panel rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase flex items-center gap-2">
              <Hand className="w-3 h-3" />
              Manual Override
            </span>
            <button
              onClick={onToggleManualMode}
              className={`text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full transition-all cursor-pointer ${
                isManualMode
                  ? 'bg-white text-black'
                  : 'text-zinc-500 hover:text-white border border-white/5'
              }`}
            >
              {isManualMode ? 'ACTIVE' : 'ENABLE'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'rock', icon: '✊', label: 'ROCK' },
              { id: 'scissors', icon: '✌️', label: 'SCISSORS' },
              { id: 'paper', icon: '✋', label: 'PAPER' },
              { id: 'none', icon: '🚫', label: 'IDLE' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => onManualSelectMove(btn.id as Move)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all cursor-pointer border ${
                  activeMove === btn.id && isManualMode
                    ? 'bg-white text-black border-transparent'
                    : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-2xl filter grayscale opacity-80">{btn.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry (Probabilities) */}
        <div className="glass-panel rounded-3xl p-5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center justify-between">
            <span>Neural Telemetry</span>
            <span className="font-mono opacity-50">TF.JS</span>
          </div>

          <div className="space-y-4">
            {predictions.map((pred) => {
              const percent = Math.round(pred.probability * 100);
              const isActive = pred.mappedMove === activeMove && percent > 20;

              return (
                <div key={pred.className} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span className={isActive ? 'text-white' : 'text-zinc-500'}>
                      {pred.className}
                    </span>
                    <span className={`font-mono ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        isActive ? 'bg-white' : 'bg-zinc-700'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
