import { CELL, worldToGrid } from './utils.js';
import { Enemy } from './game/enemy.js';
import { Tower, TOWER_STATS } from './game/tower.js';
import { Projectile } from './game/projectile.js';
import { WaveManager } from './game/waves.js';
import { pathCells, waypoints } from './game/map.js';
import type { GameState, TowerType } from './game/types.js';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const healthEl = document.getElementById('health')!;
const goldEl = document.getElementById('gold')!;
const waveEl = document.getElementById('wave')!;
const btnPause = document.getElementById('btnPause')!;
const btnSpeed = document.getElementById('btnSpeed')!;
const btnWave = document.getElementById('btnWave')!;
const btnTowerBasic = document.getElementById('btn-tower-basic')!;
const btnTowerSniper = document.getElementById('btn-tower-sniper')!;

// ------ Game constants ------
const W = canvas.width;
const H = canvas.height;
let speedMult = 1;

// ------ Game state ------
let gameState: GameState = 'ready'; // Start ready to begin first wave
let splashTimer = 0;
const SPLASH_DURATION = 2; // seconds to show splash

// ------ Mouse tracking ------
let mouseX = 0, mouseY = 0;

// ------ Base system ------
let baseHealth = 20;
const MAX_HEALTH = 20;

// ------ Gold system ------
let gold = 500; // Starting gold

// ------ Tower selection ------
let selectedTowerType: TowerType = 'basic';

// ------ Wave system ------
const waveManager = new WaveManager();

// ------ Enemy management ------
const enemies: Enemy[] = [];

function damageBase() {
  baseHealth = Math.max(0, baseHealth - 1);
  if (baseHealth <= 0) {
    gameState = 'gameOver';
    paused = true;
  }
}

function startNextWave() {
  if (waveManager.startNextWave()) {
    gameState = 'waveStart';
    splashTimer = SPLASH_DURATION;
    paused = false; // Auto-unpause when starting a wave
    btnPause.textContent = paused ? 'Play' : 'Pause'; // Update button text
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
  const towerCost = TOWER_STATS[selectedTowerType].cost;
  if (canPlaceTower(gx, gy) && gold >= towerCost) {
    towers.push(new Tower(gx, gy, selectedTowerType));
    gold -= towerCost;
    return true;
  }
  return false;
}

// ------ Loop (fixed update) ------
let acc = 0; 
const step = 1/60; 
let last = performance.now();
let paused = true;

// ------ Simulation time tracking ------
let simulationTime = 0;

function loop(now: number) {
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000; 
  if (dt > 0.25) dt = 0.25; 
  last = now;
  
  if (!paused) acc += dt;
  while (acc >= step) { 
    // Run multiple simulation steps based on speed multiplier
    for (let i = 0; i < speedMult; i++) {
      update(step);
      simulationTime += step; // Track cumulative simulation time
    }
    acc -= step; 
  }
  render();
  
  // Update health display
  healthEl.textContent = String(baseHealth);
  
  // Update gold display
  goldEl.textContent = String(gold);
  
  // Update wave display
  waveEl.textContent = String(waveManager.currentWave);
  
  // Show/hide and disable buttons based on game state
  if (gameState === 'gameOver' || gameState === 'victory') {
    // Disable all buttons in game over or victory state
    btnPause.style.display = 'none';
    btnSpeed.style.display = 'none';
    btnWave.style.display = 'none';
  } else {
    btnSpeed.style.display = 'inline-block';
    btnWave.style.display = 'inline-block';
    btnPause.style.display = (gameState === 'playing' && waveManager.waveActive) ? 'inline-block' : 'none';
  }
  
  // Update tower selection UI
  updateTowerSelection();
}

function update(dt: number) {
  // Handle splash screens and game state transitions
  if (gameState === 'waveStart') {
    splashTimer -= dt;
    if (splashTimer <= 0) {
      // Start the actual wave
      gameState = 'playing';
      waveManager.beginWaveSpawning();
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
  
  // Don't update game when game is over or victory achieved
  if (gameState === 'gameOver' || gameState === 'victory') {
    return;
  }
  
  // Update wave system
  if (waveManager.update(dt, enemies)) {
    if (waveManager.isLastWave()) {
      gameState = 'victory';
      paused = true;
    } else {
      gameState = 'waveComplete';
      splashTimer = SPLASH_DURATION;
    }
  }
  
  // Update enemies
  enemies.forEach(e => e.update(dt, damageBase));
  
  // Update towers
  towers.forEach(t => t.update(dt, enemies, simulationTime, (projectile) => {
    projectiles.push(projectile);
  }));
  
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
      
      const hitRadius = 12;
      
      if (dist < hitRadius) {
        enemy.hp -= projectile.damage;
        if (enemy.hp <= 0) {
          enemy.alive = false;
          gold += 25;
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
    const wave = waveManager.getCurrentWave();
    if (wave) {
      const enemyTypeText = wave.enemyType === 'fast' ? 'Fast Enemies' : 'Normal Enemies';
      
      ctx.font = 'bold 64px sans-serif';
      ctx.fillText(`WAVE ${waveManager.currentWave}`, W/2, H/2 - 50);
      
      ctx.font = '32px sans-serif';
      ctx.fillText(`${wave.enemyCount} ${enemyTypeText}`, W/2, H/2 + 10);
      
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#cccccc';
      ctx.fillText('Get Ready!', W/2, H/2 + 60);
    }
  }
  
  if (gameState === 'waveComplete') {
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('WAVE COMPLETE!', W/2, H/2 - 30);
    
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#44ff44';
    ctx.fillText('Click "Start Wave" for next wave', W/2, H/2 + 30);
  }
  
  if (gameState === 'gameOver') {
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#ff4444';
    ctx.fillText('GAME OVER', W/2, H/2 - 50);
    
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Your base was destroyed!', W/2, H/2 + 10);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Refresh the page to play again', W/2, H/2 + 60);
  }
  
  if (gameState === 'victory') {
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#44ff44';
    ctx.fillText('VICTORY!', W/2, H/2 - 50);
    
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('All waves completed!', W/2, H/2 + 10);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Refresh the page to play again', W/2, H/2 + 60);
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
  
  // Hover highlight and tower placement preview
  const hoverGrid = worldToGrid(mouseX, mouseY);
  if (hoverGrid.gx >= 0 && hoverGrid.gx * CELL < W && hoverGrid.gy >= 0 && hoverGrid.gy * CELL < H) {
    const canPlace = canPlaceTower(hoverGrid.gx, hoverGrid.gy);
    const canAfford = gold >= TOWER_STATS[selectedTowerType].cost;
    
    if (canPlace && canAfford) {
      // Valid placement - green highlight with tower preview
      ctx.fillStyle = 'rgba(0,255,0,0.3)';
      ctx.fillRect(hoverGrid.gx * CELL, hoverGrid.gy * CELL, CELL, CELL);
      
      // Draw tower preview
      const worldPos = { x: hoverGrid.gx * CELL + CELL/2, y: hoverGrid.gy * CELL + CELL/2 };
      drawTowerPreview(ctx, worldPos.x, worldPos.y, selectedTowerType);
    } else if (canPlace && !canAfford) {
      // Valid location but can't afford - yellow highlight  
      ctx.fillStyle = 'rgba(255,255,0,0.3)';
      ctx.fillRect(hoverGrid.gx * CELL, hoverGrid.gy * CELL, CELL, CELL);
    } else {
      // Invalid placement - red highlight
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      ctx.fillRect(hoverGrid.gx * CELL, hoverGrid.gy * CELL, CELL, CELL);
    }
  }
  
  // Draw towers
  towers.forEach(t => t.draw(ctx));
  
  // Draw projectiles
  projectiles.forEach(p => p.draw(ctx));
  
  // Draw enemies
  enemies.forEach(e => e.draw(ctx));
  
  // Draw splash screens on top
  if (gameState === 'waveStart' || gameState === 'waveComplete' || gameState === 'gameOver' || gameState === 'victory') {
    renderSplash();
  }
}

// ------ Controls ------
btnPause.addEventListener('click', () => { 
  paused = !paused; 
  btnPause.textContent = paused ? 'Play' : 'Pause';
});
btnSpeed.addEventListener('click', () => {
  const cycle = { 'x1': 1, 'x2': 2, 'x4': 4 } as const;
  const next = btnSpeed.textContent === 'x1' ? 'x2' : btnSpeed.textContent === 'x2' ? 'x4' : 'x1';
  btnSpeed.textContent = next;
  speedMult = next === 'x1' ? 1 : next === 'x2' ? 2 : 4;
});
btnWave.addEventListener('click', () => {
  if (gameState !== 'gameOver' && gameState !== 'victory' && !waveManager.waveActive && waveManager.currentWave < 6 && (gameState === 'playing' || gameState === 'ready')) {
    startNextWave();
  }
});

// Tower selection buttons
btnTowerBasic.addEventListener('click', () => {
  if (gameState !== 'gameOver' && gameState !== 'victory') {
    selectedTowerType = 'basic';
    updateTowerSelection();
  }
});
btnTowerSniper.addEventListener('click', () => {
  if (gameState !== 'gameOver' && gameState !== 'victory') {
    selectedTowerType = 'sniper';
    updateTowerSelection();
  }
});

function updateTowerSelection() {
  // Update visual selection
  btnTowerBasic.classList.toggle('selected', selectedTowerType === 'basic');
  btnTowerSniper.classList.toggle('selected', selectedTowerType === 'sniper');
  
  // Update button affordability based on current gold
  const basicCost = TOWER_STATS.basic.cost;
  const sniperCost = TOWER_STATS.sniper.cost;
  
  btnTowerBasic.style.opacity = gold >= basicCost ? '1' : '0.5';
  btnTowerSniper.style.opacity = gold >= sniperCost ? '1' : '0.5';
}


function drawTowerPreview(g: CanvasRenderingContext2D, x: number, y: number, type: TowerType) {
  const size = 12;
  g.save();
  g.globalAlpha = 0.7; // Semi-transparent preview
  
  if (type === 'sniper') {
    // Sniper tower: dark green hexagon
    g.fillStyle = '#2d5016';
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + (size * 0.8) * Math.cos(angle);
      const py = y + (size * 0.8) * Math.sin(angle);
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    g.fill();
    
    // Scope symbol
    g.fillStyle = '#44ff44';
    g.beginPath();
    g.arc(x, y, 3, 0, Math.PI * 2);
    g.fill();
    
    // Range circle
    g.strokeStyle = 'rgba(68,255,68,0.2)';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(x, y, TOWER_STATS.sniper.range, 0, Math.PI * 2);
    g.stroke();
  } else {
    // Basic tower: blue square
    g.fillStyle = '#4a5d7a';
    g.fillRect(x - size/2, y - size/2, size, size);
    
    // Range circle
    g.strokeStyle = 'rgba(100,150,255,0.2)';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(x, y, TOWER_STATS.basic.range, 0, Math.PI * 2);
    g.stroke();
  }
  
  g.restore();
}

// ------ Mouse events ------
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('click', (e) => {
  if (gameState !== 'gameOver' && gameState !== 'victory') {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const gridPos = worldToGrid(clickX, clickY);
    placeTower(gridPos.gx, gridPos.gy);
  }
});

// Initialize button states
btnPause.textContent = paused ? 'Play' : 'Pause';

// Start the game loop
requestAnimationFrame(loop);