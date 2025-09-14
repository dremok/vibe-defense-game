import { describe, it, expect, beforeEach } from 'vitest';

// Mock wave system for testing
describe('Wave System', () => {
  type GameState = 'ready' | 'playing' | 'waveStart' | 'waveComplete' | 'gameOver';
  type EnemyType = 'normal' | 'fast';
  
  interface Wave {
    enemyCount: number;
    spawnInterval: number;
    enemyType: EnemyType;
  }
  
  const waves: Wave[] = [
    { enemyCount: 5, spawnInterval: 2.0, enemyType: 'normal' },
    { enemyCount: 8, spawnInterval: 1.5, enemyType: 'normal' },
    { enemyCount: 6, spawnInterval: 1.2, enemyType: 'fast' },
  ];
  
  let gameState: GameState;
  let currentWave: number;
  let waveActive: boolean;
  let enemiesSpawned: number;
  let spawnTimer: number;
  let splashTimer: number;
  const SPLASH_DURATION = 2;
  
  beforeEach(() => {
    gameState = 'ready';
    currentWave = 0;
    waveActive = false;
    enemiesSpawned = 0;
    spawnTimer = 0;
    splashTimer = 0;
  });
  
  function startNextWave() {
    if (currentWave < waves.length && !waveActive) {
      currentWave++;
      gameState = 'waveStart';
      splashTimer = SPLASH_DURATION;
    }
  }
  
  function updateWaveSystem(dt: number) {
    if (gameState === 'waveStart') {
      splashTimer -= dt;
      if (splashTimer <= 0) {
        gameState = 'playing';
        waveActive = true;
        enemiesSpawned = 0;
        spawnTimer = 0;
      }
      return;
    }
    
    if (waveActive && currentWave > 0 && currentWave <= waves.length) {
      const wave = waves[currentWave - 1];
      spawnTimer -= dt;
      
      if (spawnTimer <= 0 && enemiesSpawned < wave.enemyCount) {
        enemiesSpawned++;
        spawnTimer = wave.spawnInterval;
      }
    }
  }
  
  it('should start in ready state', () => {
    expect(gameState).toBe('ready');
    expect(currentWave).toBe(0);
    expect(waveActive).toBe(false);
  });
  
  it('should transition to waveStart when starting first wave', () => {
    startNextWave();
    
    expect(currentWave).toBe(1);
    expect(gameState).toBe('waveStart');
    expect(splashTimer).toBe(SPLASH_DURATION);
    expect(waveActive).toBe(false);
  });
  
  it('should transition to playing after splash duration', () => {
    startNextWave();
    updateWaveSystem(SPLASH_DURATION);
    
    expect(gameState).toBe('playing');
    expect(waveActive).toBe(true);
    expect(enemiesSpawned).toBe(0);
    expect(spawnTimer).toBe(0);
  });
  
  it('should spawn enemies according to wave definition', () => {
    startNextWave();
    updateWaveSystem(SPLASH_DURATION); // Finish splash
    
    const wave = waves[0]; // First wave
    expect(waveActive).toBe(true);
    
    // First enemy should spawn immediately (spawnTimer = 0)
    updateWaveSystem(0.1);
    expect(enemiesSpawned).toBe(1);
    expect(spawnTimer).toBe(wave.spawnInterval);
    
    // Second enemy after interval
    updateWaveSystem(wave.spawnInterval);
    expect(enemiesSpawned).toBe(2);
  });
  
  it('should respect wave enemy count limit', () => {
    startNextWave();
    updateWaveSystem(SPLASH_DURATION); // Finish splash
    
    const wave = waves[0]; // First wave: 5 enemies
    
    // Simulate spawning all enemies
    for (let i = 0; i < wave.enemyCount + 2; i++) {
      updateWaveSystem(wave.spawnInterval);
    }
    
    expect(enemiesSpawned).toBe(wave.enemyCount);
  });
  
  it('should use correct enemy type for each wave', () => {
    expect(waves[0].enemyType).toBe('normal');
    expect(waves[1].enemyType).toBe('normal');
    expect(waves[2].enemyType).toBe('fast');
  });
  
  it('should not allow starting wave when already active', () => {
    startNextWave();
    updateWaveSystem(SPLASH_DURATION);
    
    const previousWave = currentWave;
    startNextWave(); // Should not work
    
    expect(currentWave).toBe(previousWave);
    expect(waveActive).toBe(true);
  });
});