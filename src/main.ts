import { CELL, worldToGrid, gridToWorld } from './utils.js';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const fpsEl = document.getElementById('fps')!;
const healthEl = document.getElementById('health')!;
const goldEl = document.getElementById('gold')!;
const waveEl = document.getElementById('wave')!;
const btnStart = document.getElementById('btnStart')!;
const btnPause = document.getElementById('btnPause')!;
const btnSpeed = document.getElementById('btnSpeed')!;
const btnWave = document.getElementById('btnWave')!;

// ------ Game constants ------
const W = canvas.width;
const H = canvas.height;
let speedMult = 1;

// ------ Game state ------
type GameState = 'ready' | 'playing' | 'waveStart' | 'waveComplete' | 'gameOver';
let gameState: GameState = 'ready'; // Start ready to begin first wave
let splashTimer = 0;
const SPLASH_DURATION = 2; // seconds to show splash

// ------ Mouse tracking ------
let mouseX = 0, mouseY = 0;

// ------ Path definition ------
const pathCells = [
  [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
  [8,2],[8,3],[8,4],[8,5],[8,6],
  [7,6],[6,6],[5,6],[4,6],[3,6],[2,6],
  [2,7],[2,8],[2,9],[2,10],[2,11],
  [3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11]
];
const waypoints = pathCells.map(([gx, gy]) => gridToWorld(gx, gy));

// ------ Enemy class ------
type EnemyType = 'normal' | 'fast';

class Enemy {
  x: number; 
  y: number; 
  i = 0;
  hp: number;
  speed: number;
  alive = true;
  type: EnemyType;
  
  constructor(type: EnemyType = 'normal') {
    this.x = waypoints[0].x;
    this.y = waypoints[0].y;
    this.type = type;
    
    // Set stats based on type
    if (type === 'fast') {
      this.hp = 5;   // Half health
      this.speed = 140; // Much faster
    } else {
      this.hp = 10;  // Normal health
      this.speed = 80; // Normal speed
    }
  }
  
  update(dt: number) {
    if (!this.alive) return;
    const target = waypoints[this.i + 1];
    if (!target) {
      this.alive = false; // reached end
      baseHealth = Math.max(0, baseHealth - 1); // damage base
      return;
    }
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt * speedMult;
    if (dist <= step) {
      this.x = target.x;
      this.y = target.y;
      this.i++;
    } else {
      this.x += (dx/dist) * step;
      this.y += (dy/dist) * step;
    }
  }
  
  draw(g: CanvasRenderingContext2D) {
    if (!this.alive) return;
    
    if (this.type === 'fast') {
      // Fast enemy: red triangle
      g.fillStyle = '#ff4444';
      g.beginPath();
      g.moveTo(this.x, this.y - 8);
      g.lineTo(this.x - 7, this.y + 6);
      g.lineTo(this.x + 7, this.y + 6);
      g.closePath();
      g.fill();
    } else {
      // Normal enemy: yellow circle
      g.fillStyle = '#ffcc33';
      g.beginPath();
      g.arc(this.x, this.y, 8, 0, Math.PI * 2);
      g.fill();
    }
  }
}

// ------ Tower class ------
class Tower {
  gx: number;
  gy: number;
  x: number;
  y: number;
  range = 80;
  damage = 2;
  rate = 1.5; // shots per second
  cost = 100;
  lastShot = 0;
  
  constructor(gx: number, gy: number) {
    this.gx = gx;
    this.gy = gy;
    const worldPos = gridToWorld(gx, gy);
    this.x = worldPos.x;
    this.y = worldPos.y;
  }
  
  findTarget(enemies: Enemy[]): Enemy | null {
    let closest: Enemy | null = null;
    let closestDist = Infinity;
    
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist <= this.range && dist < closestDist) {
        closest = enemy;
        closestDist = dist;
      }
    }
    
    return closest;
  }
  
  update(dt: number, enemies: Enemy[]) {
    const target = this.findTarget(enemies);
    const shootInterval = (1000 / this.rate) / speedMult; // Affected by speed multiplier
    if (target && performance.now() - this.lastShot > shootInterval) {
      const projectile = new Projectile(this.x, this.y, target.x, target.y, this.damage);
      projectiles.push(projectile);
      this.lastShot = performance.now();
    }
  }
  
  draw(g: CanvasRenderingContext2D) {
    // Tower body (square)
    g.fillStyle = '#4a5d7a';
    const size = 12;
    g.fillRect(this.x - size/2, this.y - size/2, size, size);
    
    // Range circle (debug)
    g.strokeStyle = 'rgba(100,150,255,0.3)';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    g.stroke();
  }
}

// ------ Projectile class ------
class Projectile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed = 200;
  damage: number;
  alive = true;
  
  constructor(startX: number, startY: number, targetX: number, targetY: number, damage: number) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
  }
  
  update(dt: number) {
    if (!this.alive) return;
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt * speedMult;
    
    if (dist <= step) {
      // Hit target
      this.x = this.targetX;
      this.y = this.targetY;
      this.alive = false;
    } else {
      this.x += (dx/dist) * step;
      this.y += (dy/dist) * step;
    }
  }
  
  draw(g: CanvasRenderingContext2D) {
    if (!this.alive) return;
    g.fillStyle = '#ffaa00';
    g.beginPath();
    g.arc(this.x, this.y, 3, 0, Math.PI * 2);
    g.fill();
  }
}

// ------ Base system ------
let baseHealth = 20;
const MAX_HEALTH = 20;

// ------ Gold system ------
let gold = 500; // Starting gold

// ------ Wave system ------
interface Wave {
  enemyCount: number;
  spawnInterval: number; // seconds between spawns
  enemyType: EnemyType;
}

const waves: Wave[] = [
  { enemyCount: 5, spawnInterval: 2.0, enemyType: 'normal' },
  { enemyCount: 8, spawnInterval: 1.5, enemyType: 'normal' },
  { enemyCount: 6, spawnInterval: 1.2, enemyType: 'fast' },    // First fast wave
  { enemyCount: 10, spawnInterval: 1.0, enemyType: 'normal' },
  { enemyCount: 8, spawnInterval: 0.8, enemyType: 'fast' },    // More fast enemies
  { enemyCount: 15, spawnInterval: 0.6, enemyType: 'normal' },
];

let currentWave = 0;
let enemiesSpawned = 0;
let spawnTimer = 0;
let waveActive = false;

// ------ Enemy management ------
const enemies: Enemy[] = [];

function spawnEnemy() {
  const wave = waves[currentWave - 1]; // currentWave is 1-indexed after startNextWave
  if (wave) {
    enemies.push(new Enemy(wave.enemyType));
    enemiesSpawned++;
  }
}

function startNextWave() {
  if (currentWave < waves.length && !waveActive) {
    currentWave++;
    gameState = 'waveStart';
    splashTimer = SPLASH_DURATION;
    paused = false; // Auto-unpause when starting a wave
    // Don't start spawning yet - wait for splash to finish
  }
}

// ------ Tower management ------
const towers: Tower[] = [];

// ------ Projectile management ------
const projectiles: Projectile[] = [];

function canPlaceTower(gx: number, gy: number): boolean {
  // Check if position is on path
  if (pathCells.some(([px, py]) => px === gx && py === gy)) {
    return false;
  }
  // Check if tower already exists at position
  if (towers.some(t => t.gx === gx && t.gy === gy)) {
    return false;
  }
  return true;
}

function placeTower(gx: number, gy: number): boolean {
  const towerCost = 100; // Tower cost
  if (canPlaceTower(gx, gy) && gold >= towerCost) {
    towers.push(new Tower(gx, gy));
    gold -= towerCost;
    return true;
  }
  return false;
}

// ------ Loop (fixed update) ------
let acc = 0; 
const step = 1/60; 
let last = performance.now();
let frames = 0, fps = 0, fpsAccum = 0; 
let paused = true;

function loop(now: number) {
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000; 
  if (dt > 0.25) dt = 0.25; 
  last = now;
  
  if (!paused) acc += dt;
  while (acc >= step) { 
    update(step); 
    acc -= step; 
  }
  render();
  
  // FPS calculation
  fpsAccum += dt; 
  frames++;
  if (fpsAccum >= 0.5) { 
    fps = Math.round(frames / fpsAccum); 
    fpsEl.textContent = String(fps); 
    frames = 0; 
    fpsAccum = 0; 
  }
  
  // Update health display
  healthEl.textContent = String(baseHealth);
  
  // Update gold display
  goldEl.textContent = String(gold);
  
  // Update wave display
  waveEl.textContent = String(currentWave);
}

function update(dt: number) {
  // Handle splash screens and game state transitions
  if (gameState === 'waveStart') {
    splashTimer -= dt;
    if (splashTimer <= 0) {
      // Start the actual wave
      gameState = 'playing';
      waveActive = true;
      enemiesSpawned = 0;
      spawnTimer = 0;
    }
    return; // Don't update game during splash
  }
  
  if (gameState === 'waveComplete') {
    splashTimer -= dt;
    if (splashTimer <= 0) {
      gameState = 'playing';
    }
    return; // Don't update game during splash
  }
  
  // Wave-based enemy spawning (affected by speed multiplier)
  if (waveActive && currentWave > 0 && currentWave <= waves.length) {
    const wave = waves[currentWave - 1]; // currentWave is 1-indexed
    spawnTimer -= dt * speedMult;
    
    if (spawnTimer <= 0 && enemiesSpawned < wave.enemyCount) {
      spawnEnemy();
      spawnTimer = wave.spawnInterval;
    }
    
    // Check if wave is complete (all enemies spawned and defeated)
    if (enemiesSpawned >= wave.enemyCount && enemies.filter(e => e.alive).length === 0) {
      waveActive = false;
      gameState = 'waveComplete';
      splashTimer = SPLASH_DURATION;
    }
  }
  
  // Update enemies
  enemies.forEach(e => e.update(dt));
  
  // Update towers
  towers.forEach(t => t.update(dt, enemies));
  
  // Update projectiles
  projectiles.forEach(p => p.update(dt));
  
  // Check projectile collisions
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    if (!projectile.alive) {
      projectiles.splice(i, 1);
      continue;
    }
    
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - projectile.x;
      const dy = enemy.y - projectile.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < 12) { // Hit radius
        enemy.hp -= projectile.damage;
        if (enemy.hp <= 0) {
          enemy.alive = false;
          gold += 25; // Gold reward for killing enemy
        }
        projectile.alive = false;
        projectiles.splice(i, 1);
        break;
      }
    }
  }
}

function renderSplash() {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, W, H);
  
  // Set text style
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (gameState === 'waveStart') {
    const wave = waves[currentWave - 1];
    const enemyTypeText = wave.enemyType === 'fast' ? 'Fast Enemies' : 'Normal Enemies';
    
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(`WAVE ${currentWave}`, W/2, H/2 - 40);
    
    ctx.font = '24px sans-serif';
    ctx.fillText(`${wave.enemyCount} ${enemyTypeText}`, W/2, H/2 + 20);
    
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Get Ready!', W/2, H/2 + 60);
  }
  
  if (gameState === 'waveComplete') {
    if (currentWave < waves.length) {
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('WAVE COMPLETE!', W/2, H/2 - 20);
      
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#44ff44';
      ctx.fillText('Click "Start Wave" for next wave', W/2, H/2 + 30);
    } else {
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('ALL WAVES COMPLETE!', W/2, H/2 - 20);
      
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#44ff44';
      ctx.fillText('You Won!', W/2, H/2 + 30);
    }
  }
}

function render() {
  // Clear background
  ctx.fillStyle = '#0f1733'; 
  ctx.fillRect(0, 0, W, H);
  
  // Draw grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += CELL) { 
    ctx.beginPath(); 
    ctx.moveTo(x, 0); 
    ctx.lineTo(x, H); 
    ctx.stroke(); 
  }
  for (let y = 0; y < H; y += CELL) { 
    ctx.beginPath(); 
    ctx.moveTo(0, y); 
    ctx.lineTo(W, y); 
    ctx.stroke(); 
  }
  
  // Draw path
  ctx.fillStyle = '#2b334d';
  pathCells.forEach(([gx, gy]) => {
    ctx.fillRect(gx * CELL + 1, gy * CELL + 1, CELL - 2, CELL - 2);
  });
  
  // Hover highlight
  const hoverGrid = worldToGrid(mouseX, mouseY);
  if (hoverGrid.gx >= 0 && hoverGrid.gx * CELL < W && hoverGrid.gy >= 0 && hoverGrid.gy * CELL < H) {
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(hoverGrid.gx * CELL, hoverGrid.gy * CELL, CELL, CELL);
  }
  
  // Draw towers
  towers.forEach(t => t.draw(ctx));
  
  // Draw projectiles
  projectiles.forEach(p => p.draw(ctx));
  
  // Draw enemies
  enemies.forEach(e => e.draw(ctx));
  
  // Draw splash screens on top
  if (gameState === 'waveStart' || gameState === 'waveComplete') {
    renderSplash();
  }
}

// ------ Controls ------
btnStart.addEventListener('click', () => { paused = false; });
btnPause.addEventListener('click', () => { paused = true; });
btnSpeed.addEventListener('click', () => {
  const cycle = { 'x1': 1, 'x2': 2, 'x4': 4 } as const;
  const next = btnSpeed.textContent === 'x1' ? 'x2' : btnSpeed.textContent === 'x2' ? 'x4' : 'x1';
  btnSpeed.textContent = next;
  speedMult = next === 'x1' ? 1 : next === 'x2' ? 2 : 4;
});
btnWave.addEventListener('click', () => {
  if (!waveActive && currentWave < waves.length && (gameState === 'playing' || gameState === 'ready')) {
    startNextWave();
  }
});

// ------ Mouse events ------
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const gridPos = worldToGrid(clickX, clickY);
  placeTower(gridPos.gx, gridPos.gy);
});

// Start the game loop
requestAnimationFrame(loop);