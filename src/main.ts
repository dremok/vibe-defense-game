const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const fpsEl = document.getElementById('fps')!;
const btnStart = document.getElementById('btnStart')!;
const btnPause = document.getElementById('btnPause')!;
const btnSpeed = document.getElementById('btnSpeed')!;

// ------ Game constants ------
const CELL = 32;
const W = canvas.width;
const H = canvas.height;
let speedMult = 1;

// ------ Grid utilities ------
const worldToGrid = (x: number, y: number) => ({ gx: Math.floor(x / CELL), gy: Math.floor(y / CELL) });
const gridToWorld = (gx: number, gy: number) => ({ x: gx * CELL + CELL/2, y: gy * CELL + CELL/2 });

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
class Enemy {
  x: number; 
  y: number; 
  i = 0;
  hp = 10;
  speed = 80;
  alive = true;
  
  constructor() {
    this.x = waypoints[0].x;
    this.y = waypoints[0].y;
  }
  
  update(dt: number) {
    if (!this.alive) return;
    const target = waypoints[this.i + 1];
    if (!target) {
      this.alive = false; // reached end
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
}

function update(dt: number) {
  // Game update logic will go here
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

// ------ Mouse events ------
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

// Start the game loop
requestAnimationFrame(loop);