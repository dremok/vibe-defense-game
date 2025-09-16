import type { Wave } from './types.js';
import { Enemy } from './enemy.js';

export const waves: Wave[] = [
  { enemyCount: 5, spawnInterval: 2.0, enemyType: 'normal' },
  { enemyCount: 8, spawnInterval: 1.5, enemyType: 'normal' },
  { enemyCount: 6, spawnInterval: 1.2, enemyType: 'fast' },    // First fast wave
  { enemyCount: 10, spawnInterval: 1.0, enemyType: 'normal' },
  { enemyCount: 8, spawnInterval: 0.8, enemyType: 'fast' },    // More fast enemies
  { enemyCount: 15, spawnInterval: 0.6, enemyType: 'normal' },
];

export class WaveManager {
  currentWave = 0;
  enemiesSpawned = 0;
  spawnTimer = 0;
  waveActive = false;
  
  spawnEnemy(enemies: Enemy[]): void {
    const wave = waves[this.currentWave - 1]; // currentWave is 1-indexed after startNextWave
    if (wave) {
      enemies.push(new Enemy(wave.enemyType));
      this.enemiesSpawned++;
    }
  }
  
  startNextWave(): boolean {
    if (this.currentWave < waves.length && !this.waveActive) {
      this.currentWave++;
      // Don't start spawning yet - wait for splash to finish
      return true;
    }
    return false;
  }
  
  beginWaveSpawning(): void {
    this.waveActive = true;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
  }
  
  update(dt: number, enemies: Enemy[]): boolean {
    if (!this.waveActive || this.currentWave === 0 || this.currentWave > waves.length) {
      return false;
    }
    
    const wave = waves[this.currentWave - 1]; // currentWave is 1-indexed
    this.spawnTimer -= dt;
    
    if (this.spawnTimer <= 0 && this.enemiesSpawned < wave.enemyCount) {
      this.spawnEnemy(enemies);
      this.spawnTimer = wave.spawnInterval;
    }
    
    // Check if wave is complete (all enemies spawned and defeated)
    if (this.enemiesSpawned >= wave.enemyCount && enemies.filter(e => e.alive).length === 0) {
      this.waveActive = false;
      return true; // Wave complete
    }
    
    return false; // Wave still active
  }
  
  getCurrentWave(): Wave | null {
    if (this.currentWave > 0 && this.currentWave <= waves.length) {
      return waves[this.currentWave - 1];
    }
    return null;
  }
  
  isLastWave(): boolean {
    return this.currentWave >= waves.length;
  }
}