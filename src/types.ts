export type Move = 'rock' | 'paper' | 'scissors' | 'none';

export type GameResult = 'win' | 'lose' | 'draw';

export type GamePhase = 'idle' | 'countdown' | 'evaluating' | 'result';

export type MatchMode = 'endless' | 'best_of_3' | 'best_of_5';

export interface PredictionItem {
  className: string;
  probability: number;
  mappedMove: Move;
}

export interface RoundHistory {
  id: string;
  roundNumber: number;
  playerMove: Move;
  computerMove: Move;
  result: GameResult;
  confidence: number;
  timestamp: string;
}

export interface ScoreState {
  player: number;
  computer: number;
  draws: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export interface ModelMetadata {
  modelName?: string;
  labels: string[];
  url: string;
  isLoaded: boolean;
  isLoading: boolean;
  error?: string | null;
  totalClasses?: number;
}
