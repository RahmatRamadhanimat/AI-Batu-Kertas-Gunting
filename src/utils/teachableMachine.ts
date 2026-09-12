import { Move, PredictionItem } from '../types';

declare global {
  interface Window {
    tmImage?: {
      load: (modelURL: string, metadataURL: string) => Promise<TmModel>;
      Webcam: new (
        width: number,
        height: number,
        flip?: boolean
      ) => TmWebcam;
    };
    tf?: unknown;
  }
}

export interface TmPrediction {
  className: string;
  probability: number;
}

export interface TmModel {
  getTotalClasses: () => number;
  getClassLabels: () => string[];
  predict: (
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
  ) => Promise<TmPrediction[]>;
}

export interface TmWebcam {
  canvas: HTMLCanvasElement;
  setup: (config?: MediaTrackConstraints) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  update: () => void;
}

// Default verified example Teachable Machine model URL for Rock-Paper-Scissors
// User can easily replace this with their own Teachable Machine link!
export const DEFAULT_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/mtEKos-_I/';

/**
 * Normalizes labels from different user models (Indonesian & English variants)
 */
export function mapClassToMove(className: string): Move {
  const normalized = className.trim().toLowerCase();

  // Rock patterns
  if (
    normalized.includes('batu') ||
    normalized.includes('rock') ||
    normalized.includes('tinju') ||
    normalized.includes('fist')
  ) {
    return 'rock';
  }

  // Paper patterns
  if (
    normalized.includes('kertas') ||
    normalized.includes('paper') ||
    normalized.includes('telapak') ||
    normalized.includes('palm') ||
    normalized.includes('open')
  ) {
    return 'paper';
  }

  // Scissors patterns
  if (
    normalized.includes('gunting') ||
    normalized.includes('scissor') ||
    normalized.includes('peace') ||
    normalized.includes('dua')
  ) {
    return 'scissors';
  }

  // Neutral / Background
  if (
    normalized.includes('netral') ||
    normalized.includes('neutral') ||
    normalized.includes('background') ||
    normalized.includes('kosong') ||
    normalized.includes('none') ||
    normalized.includes('idle')
  ) {
    return 'none';
  }

  return 'none';
}

export function formatMoveIndonesian(move: Move): string {
  switch (move) {
    case 'rock':
      return 'Batu ✊';
    case 'scissors':
      return 'Gunting ✌️';
    case 'paper':
      return 'Kertas ✋';
    case 'none':
      return 'Netral / Tidak Terdeteksi';
  }
}

export function getMoveEmoji(move: Move): string {
  switch (move) {
    case 'rock':
      return '✊';
    case 'scissors':
      return '✌️';
    case 'paper':
      return '✋';
    case 'none':
      return '❓';
  }
}

export function determineWinner(player: Move, computer: Move): 'win' | 'lose' | 'draw' {
  if (player === computer) return 'draw';
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'scissors' && computer === 'paper') ||
    (player === 'paper' && computer === 'rock')
  ) {
    return 'win';
  }
  return 'lose';
}

export function getRandomComputerMove(): Move {
  const moves: Move[] = ['rock', 'paper', 'scissors'];
  const randomIndex = Math.floor(Math.random() * moves.length);
  return moves[randomIndex];
}

/**
 * Ensures standard trailing slash for Teachable Machine URLs
 */
export function formatModelUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return '';
  if (url.endsWith('model.json')) {
    url = url.substring(0, url.lastIndexOf('/') + 1);
  } else if (!url.endsWith('/')) {
    url += '/';
  }
  return url;
}

/**
 * Loads a Teachable Machine model from given URL
 */
export async function loadTeachableModel(baseUrl: string): Promise<{
  model: TmModel;
  labels: string[];
}> {
  const formattedUrl = formatModelUrl(baseUrl);
  const modelURL = formattedUrl + 'model.json';
  const metadataURL = formattedUrl + 'metadata.json';

  // Check if tmImage is loaded from CDN
  if (typeof window === 'undefined' || !window.tmImage) {
    throw new Error(
      'Library Teachable Machine (@teachablemachine/image) belum siap. Pastikan koneksi internet aktif untuk memuat library CDN.'
    );
  }

  try {
    const model = await window.tmImage.load(modelURL, metadataURL);
    let labels: string[] = [];
    try {
      labels = model.getClassLabels();
    } catch {
      labels = ['Batu', 'Gunting', 'Kertas', 'Netral'];
    }
    return { model, labels };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Gagal memuat model dari ${baseUrl}. Pastikan URL model Teachable Machine valid dan telah di-export secara publik. Detail: ${errorMsg}`
    );
  }
}

/**
 * Formats predictions with mapped moves and sorted by probability
 */
export function processPredictions(predictions: TmPrediction[]): {
  topMove: Move;
  topConfidence: number;
  items: PredictionItem[];
} {
  const items: PredictionItem[] = predictions.map((p) => ({
    className: p.className,
    probability: p.probability,
    mappedMove: mapClassToMove(p.className),
  }));

  // Sort descending by probability
  items.sort((a, b) => b.probability - a.probability);

  const top = items[0];
  const topConfidence = top ? top.probability : 0;
  const topMove = top ? top.mappedMove : 'none';

  return {
    topMove,
    topConfidence,
    items,
  };
}
