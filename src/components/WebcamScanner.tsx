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

  const getBorderColor = () => {
    switch (activeMove) {
      case 'rock':
        return 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
      case 'scissors':
        return 'border-sky-500 shadow-[0_0_25px_rgba(14,165,233,0.25)]';
      case 'paper':
        return 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.25)]';
      default:
        return 'border-slate-700 shadow-lg';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Viewport Frame */}
      <div
        className={`relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 border-2 transition-all duration-300 ${getBorderColor()}`}
      >
        {/* Video stream element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isFacingUser ? '-scale-x-100' : ''
          } ${isCameraActive && !cameraError ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Fallback Screen when Camera is off or error */}
        {(!isCameraActive || cameraError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 z-10">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <CameraOff className="w-8 h-8 text-amber-500/80" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {cameraError ? 'Akses Kamera Terkendala' : 'Kamera Nonaktif'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              {cameraError ||
                'Nyalakan kamera untuk deteksi gestur otomatis dengan Teachable Machine, atau pilih gestur manual di bawah.'}
            </p>
            <button
              id="btn-retry-camera"
              onClick={startCamera}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Nyalakan Kamera
            </button>
          </div>
        )}

        {/* Reticle Viewfinder Corners */}
        <div className="absolute inset-4 pointer-events-none border border-white/10 rounded-xl">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
        </div>

        {/* Floating Top Badge: Detected Gesture */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/80 shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                activeMove !== 'none' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span className="text-xs font-bold text-white tracking-wide">
              {activeMove !== 'none' ? formatMoveIndonesian(activeMove) : 'Tunjukkan Tangan'}
            </span>
            {activeMove !== 'none' && (
              <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                {Math.round(activeConfidence * 100)}%
              </span>
            )}
          </div>

          {/* Mode indicator */}
          <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md bg-slate-900/80 border border-slate-700 text-slate-300">
            {isManualMode ? 'Mode Manual' : isModelLoaded ? 'AI Scanner' : 'Model Kosong'}
          </div>
        </div>

        {/* Floating Camera Controls Bottom-Right */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
          <button
            id="btn-toggle-camera"
            onClick={toggleCamera}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md"
            title={isCameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          >
            {isCameraActive ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4 text-rose-400" />}
          </button>
          <button
            id="btn-flip-camera"
            onClick={flipCamera}
            disabled={!isCameraActive}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            title="Putar / Ganti Kamera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Gesture Simulator Buttons (Useful for quick testing, fallback, or when model training is pending) */}
      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-amber-400" />
            Pilihan Gestur Cepat (Tes / Override)
          </span>
          <button
            id="btn-toggle-manual"
            onClick={onToggleManualMode}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ${
              isManualMode
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200 underline'
            }`}
          >
            {isManualMode ? 'Mode Manual Aktif' : 'Gunakan Manual'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button
            id="btn-gesture-rock"
            onClick={() => onManualSelectMove('rock')}
            className={`py-2 px-1 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeMove === 'rock'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">✊</span>
            <span>Batu</span>
          </button>

          <button
            id="btn-gesture-scissors"
            onClick={() => onManualSelectMove('scissors')}
            className={`py-2 px-1 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeMove === 'scissors'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-md'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">✌️</span>
            <span>Gunting</span>
          </button>

          <button
            id="btn-gesture-paper"
            onClick={() => onManualSelectMove('paper')}
            className={`py-2 px-1 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeMove === 'paper'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-md'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">✋</span>
            <span>Kertas</span>
          </button>

          <button
            id="btn-gesture-none"
            onClick={() => onManualSelectMove('none')}
            className={`py-2 px-1 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeMove === 'none'
                ? 'bg-slate-700 text-slate-200 border-slate-500'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <span className="text-xl">🚫</span>
            <span>Netral</span>
          </button>
        </div>
      </div>

      {/* Real-time Probability Bars (Teachable Machine Predictions) */}
      <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <span>Tingkat Keyakinan AI (Probabilitas)</span>
          <span className="text-[10px] text-slate-500 font-mono">Teachable Machine</span>
        </div>

        <div className="space-y-2">
          {predictions.map((pred) => {
            const percent = Math.round(pred.probability * 100);
            const isHighest = pred.mappedMove === activeMove && percent > 25;

            let barColor = 'bg-slate-600';
            if (pred.mappedMove === 'rock') barColor = 'bg-amber-500';
            if (pred.mappedMove === 'scissors') barColor = 'bg-sky-500';
            if (pred.mappedMove === 'paper') barColor = 'bg-emerald-500';

            return (
              <div key={pred.className} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isHighest ? 'text-white' : 'text-slate-400'}`}>
                    {pred.className}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-300">
                    {percent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-150 ${barColor}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
