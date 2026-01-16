
export enum GameState {
  START = 'START',
  INSTRUCTIONS = 'INSTRUCTIONS',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Target {
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  color: string;
}

export interface AIAnalysis {
  rank: string;
  commentary: string;
  advice: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
