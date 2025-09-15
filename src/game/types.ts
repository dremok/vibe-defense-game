export type EnemyType = 'normal' | 'fast';

export type TowerType = 'basic' | 'sniper';

export type GameState = 'ready' | 'playing' | 'waveStart' | 'waveComplete' | 'gameOver' | 'victory';

export interface Wave {
  enemyCount: number;
  spawnInterval: number; // seconds between spawns
  enemyType: EnemyType;
}

export interface Position {
  x: number;
  y: number;
}

export interface GridPosition {
  gx: number;
  gy: number;
}

export interface TowerStats {
  range: number;
  damage: number;
  rate: number; // shots per second
  cost: number;
}