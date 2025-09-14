# Tower Defense Vibe Game 🎮

## Current Status: Phase 1 Complete ✅

A **browser-based tower defense** game built with TypeScript and Vite. Interactive grid system with path visualization now complete and ready for enemy entities.

**🎯 Play the current version:** `http://localhost:5173/` (after running `yarn dev`)

---

## What's Working Now

* ✅ **Fixed timestep game loop** (60 FPS) with pause/resume
* ✅ **HTML5 Canvas rendering** with interactive grid system 
* ✅ **Mouse hover highlighting** - cells light up as you move your mouse
* ✅ **Visual path system** - S-shaped path clearly visible as darker tiles
* ✅ **Grid coordinate utilities** - world ↔ grid conversion functions
* ✅ **Speed controls** (x1, x2, x4 multipliers)
* ✅ **FPS monitoring** and display
* ✅ **Vite development server** with TypeScript and HMR
* ✅ **Production build system** ready for deployment

---

## Goals

* **Runs in the browser** (no installs for players).
* **Playable ASAP**: you get a moving dot on a path in minutes, then iterate.
* **Baby steps**: each step yields a runnable, testable game state.
* **Simple graphics**: procedural Canvas shapes or tiny SVGs that AI can generate.

---

## Tech Stack (kept minimal & friendly for AI pair-coding)

* **Language**: TypeScript
* **Dev server & build**: Vite (fast HMR)
* **Rendering**: HTML5 Canvas 2D
* **UI & Debug**: Native HTML + \[Tweakpane] for live tuning
* **Audio**: Howler.js
* **Pathfinding**: Start with waypoint list → upgrade to BFS → optional A\*
* **Data**: JSON config (optional zod schemas)
* **Save**: `localStorage`
* **Format/Test**: Prettier, ESLint, Vitest (unit tests)
* **Deployment**: Netlify/Vercel (drag-n-drop or Git push)

> Optional libs: `zod` (config safety), `playwright` (e2e later)

---

## 🚀 Development Setup

### Prerequisites
- Node.js (v16+)
- Yarn (recommended) or npm

### Quick Start

```bash
# Clone or navigate to project directory
cd vibe-defense-game

# Install dependencies (using Yarn - recommended)
yarn install

# OR with npm (if you encounter cache issues, use yarn instead)
npm install

# Start development server
yarn dev

# Open in browser
http://localhost:5173/
```

### Available Commands

```bash
yarn dev          # Start development server (http://localhost:5173/)
yarn build        # Build for production
yarn preview      # Preview production build
yarn test         # Run tests (when implemented)
```

**Note:** If you encounter npm permission issues, use `yarn` instead of `npm`.

---

## 📁 Current Project Structure

```
vibe-defense-game/
├── index.html              # Main HTML entry point
├── src/
│   └── main.ts            # Game logic and rendering
├── package.json           # Dependencies and scripts  
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
├── yarn.lock            # Dependency lock file
├── CLAUDE.md           # AI development guidance
└── README.md          # This file
```

---

## Minimal Playable MVP (v0) — Current Implementation

> This gives you: Canvas, fixed game loop, FPS counter, a road, and a single enemy moving along the path. You can play‑test immediately.

**`index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TD Vibe</title>
    <style>
      html, body { height: 100%; margin: 0; background:#0b1020; color:#e6ecff; font-family: ui-sans-serif, system-ui, -apple-system; }
      #hud { position: fixed; top: 8px; left: 8px; background: rgba(0,0,0,.35); padding: 6px 10px; border-radius: 8px; backdrop-filter: blur(4px); font-size: 14px; }
      canvas { display:block; margin:0 auto; image-rendering: pixelated; }
      button { margin-left: 8px; }
    </style>
  </head>
  <body>
    <div id="hud">FPS: <span id="fps">0</span>
      <button id="btnStart">Start</button>
      <button id="btnPause">Pause</button>
      <button id="btnSpeed">x1</button>
    </div>
    <canvas id="game" width="960" height="540"></canvas>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**`src/main.ts`**

```ts
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

// Simple S-curve path as waypoints (grid cells converted to px centers)
const pathCells = [
  [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
  [8,2],[8,3],[8,4],[8,5],[8,6],
  [7,6],[6,6],[5,6],[4,6],[3,6],[2,6],
  [2,7],[2,8],[2,9],[2,10],[2,11],
  [3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11]
];
const waypoints = pathCells.map(([gx, gy]) => ({ x: gx*CELL + CELL/2, y: gy*CELL + CELL/2 }));

// ------ Enemy ------
class Enemy {
  x: number; y: number; i = 0; speed = 80; hp = 10; alive = true;
  constructor() { this.x = waypoints[0].x; this.y = waypoints[0].y; }
  update(dt: number) {
    if (!this.alive) return;
    const target = waypoints[this.i+1];
    if (!target) { // reached end
      this.alive = false; // (damage base later)
      return;
    }
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt * speedMult;
    if (dist <= step) { this.x = target.x; this.y = target.y; this.i++; }
    else { this.x += (dx/dist) * step; this.y += (dy/dist) * step; }
  }
  draw(g: CanvasRenderingContext2D) {
    g.fillStyle = '#ffcc33';
    g.beginPath(); g.arc(this.x, this.y, 8, 0, Math.PI*2); g.fill();
  }
}

// ------ Spawner ------
let spawnTimer = 0;
const enemies: Enemy[] = [];
function spawnEnemy() { enemies.push(new Enemy()); }

// ------ Loop (fixed update) ------
let acc = 0; const step = 1/60; let last = performance.now();
let frames = 0, fps = 0, fpsAccum = 0; let paused = true;

function loop(now: number) {
  requestAnimationFrame(loop);
  let dt = (now - last) / 1000; if (dt > 0.25) dt = 0.25; last = now;
  if (!paused) acc += dt;
  while (acc >= step) { update(step); acc -= step; }
  render();
  // FPS simple
  fpsAccum += dt; frames++;
  if (fpsAccum >= 0.5) { fps = Math.round(frames / fpsAccum); fpsEl.textContent = String(fps); frames = 0; fpsAccum = 0; }
}
requestAnimationFrame(loop);

function update(dt: number) {
  spawnTimer -= dt;
  if (spawnTimer <= 0) { spawnEnemy(); spawnTimer = 2; }
  enemies.forEach(e => e.update(dt));
}

function render() {
  // background
  ctx.fillStyle = '#0f1733'; ctx.fillRect(0,0,W,H);

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  for (let x=0; x<W; x+=CELL) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=0; y<H; y+=CELL) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // road
  ctx.fillStyle = '#2b334d';
  pathCells.forEach(([gx,gy]) => {
    ctx.fillRect(gx*CELL+1, gy*CELL+1, CELL-2, CELL-2);
  });

  // enemies
  enemies.forEach(e => e.draw(ctx));
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
```

> With this base, you can **Start/Pause**, see a **grid & road**, and watch **enemies move** along the path at variable speed. From here, you’ll add towers and shooting in tiny increments.

---

## Recommended Project Structure (grow into this)

```
/src
  main.ts                # boot, loop, wire UI
  engine/
    loop.ts              # (optional) extract fixed timestep
    input.ts             # mouse/keys
    rng.ts               # seeded PRNG if needed
    debugHud.ts          # stats overlays
  game/
    types.ts             # shared interfaces
    grid.ts              # grid + math
    path.ts              # BFS/A* utilities
    map.ts               # map data & loaders
    entity.ts            # base types
    enemy.ts             # enemies
    tower.ts             # towers & targeting
    projectile.ts        # bullets/splash
    waves.ts             # wave definitions
    balance.ts           # tuning values
    save.ts              # localStorage
  ui/
    hud.ts               # text overlays, buttons
    pane.ts              # Tweakpane bindings
index.html
style.css
vite.config.ts
```

---

## Baby-Step Roadmap (playable after every step)

After each step: **play 30–60s**, commit (`v0.0.X`), note “what’s next” in `TODO.md`.

### Phase 0 — Boot & Loop

1. **Hello Canvas**: draw background & FPS.
2. **Fixed loop**: separate `update(dt)` and `render()`.
3. **Pause/Speed**: buttons for Start, Pause, x1/x2/x4.

### Phase 1 — Grid & Path

4. **Grid module**: 32px cells, world↔grid math, hover highlight.
5. **Road**: author a path (array of grid cells); render as darker tiles.
6. **Pathfollow v1**: enemies follow waypoint list (already done in v0). Later: BFS on road graph.

### Phase 2 — Enemies & Base

7. **Enemy variants**: slow tank (hp↑ speed↓), fast weakling (hp↓ speed↑). Simple color/shape swap.
8. **Base + HP**: reaching end damages base; HUD shows hearts; defeat when ≤ 0.

### Phase 3 — First Tower

9. **Placement**: click on grass tile to place tower (cost gold). Prevent road/overlap.
10. **Targeting & Projectile**: nearest enemy within radius; bullets travel; on hit → damage; kill → +gold.
11. **Balance panel**: expose tower range/rate/damage & enemy hp/speed via Tweakpane for live tuning.

### Phase 4 — Waves & Second Tower

12. **Waves**: define array of waves (type, count, spacing). Buttons: Start/Pause/Next Wave.
13. **Enemy 2**: triangle fast enemy.
14. **Tower 2 (Splash)**: slower rate, AoE on hit. Visual: expanding ring.

### Phase 5 — UX & QoL

15. **HUD polish**: gold, hearts, wave, speed; simple icons; hover tile outline.
16. **Save/Load**: persist run state to `localStorage` on pause/quit; load at boot.
17. **SFX**: howler.js hooks for shoot/hit/death/wave start.

### Phase 6 — Pathfinding & Map Safety

18. **BFS → A**\* (optional): allow networked roads. Keep authored path simple.
19. **No-block placement**: simulate tower as obstacle; if path breaks, reject with tooltip.
20. **Map loader**: map JSON; swap maps without code changes.

### Phase 7 — Game Feel & Perf

21. **One extra mechanic**: armor on tanks OR slow debuff bullet.
22. **Win/Lose screens**: overlays, restart, simple stats.
23. **Performance guardrails**: projectile pooling, offscreen cull, cap entities/frame. Target >55 FPS with 200+ enemies.

### Stretch Goals (later)

* Tower upgrades & branching paths
* Multiple maps + tiny in-game map editor (paint roads)
* Enemy abilities (shield/regeneration)
* Difficulty presets + daily seed
* Touch/mobile controls
* Achievements & stats

---

## Claude Code Prompt Snippets (use as you iterate)

* **Boot**: “Create `index.html` + `src/main.ts` for a canvas game with Vite. Show a colored background, grid, and FPS overlay using a fixed update loop.”
* **Placement**: “Add tower placement on empty grass tiles (cost 100 gold). Prevent placing on road or overlapping an existing tower.”
* **Targeting**: “Implement nearest-enemy targeting within range; bullets with travel time; on hit, deal damage and grant gold.”
* **Balance**: “Wire Tweakpane to tower range/rate/damage and enemy hp/speed so I can tune live.”
* **Waves**: “Create `waves.ts` with typed wave schema; add Start/Pause/Next Wave buttons.”
* **Path safety**: “Before placing a tower, temporarily block the tile and run BFS between start/end; if no path, reject with a tooltip.”
* **Refactor**: “Extract rendering into `render.ts`; keep logic/data separate for easy visual swaps.”

---

## Minimal Data Shapes (guidance)

```ts
// game/types.ts
export type Vec2 = { x: number; y: number };
export type EnemyType = 'slow' | 'fast';
export type TowerType = 'single' | 'splash';

export interface EnemyDef { hp: number; speed: number; reward: number; }
export interface TowerDef { cost: number; range: number; rate: number; damage: number; splash?: number; }

export interface Wave { type: EnemyType; count: number; spacing: number; }
```

---

## Balancing Tips

* Show a **DPS meter** when a tower is selected (rolling avg).
* Maintain a **wave budget** (sum of hp × speed × count) and scale tower stats to counter it.
* Add a **“god mode”**: spawn a dummy wave repeatedly to tune.

---

## Testing & Quality

* **Vitest**: math/path tests (e.g., path exists when removing a road tile?).
* **Playwright (optional)**: click Start, place a tower, ensure baseHP > 0 after 30s.
* **CI**: GitHub Action → `npm ci && npm run build && npm test`.

---

## Deployment

* `npm run build` → deploy `/dist` to Netlify/Vercel.
* Set up a **staging** branch for quick playtests.

---

## What to do next (copy to `TODO.md`)

* [ ] Implement Step 9: Tower placement on grass.
* [ ] Implement Step 10: Targeting & projectile damage.
* [ ] Add Tweakpane sliders for range, rate, damage, enemy hp/speed.
* [ ] Make a second enemy type (triangle fast).

---

### Notes on Graphics (AI-friendly)

* Use **solid shapes**: circles/triangles/squares, 1–2 accent colors.
* **Towers**: square base + short barrel line; splash tower gets a ring.
* **Bullets**: tiny circles; splash as expanding alpha ring.
* **Hit effect**: brief starburst lines or alpha pulse.
* All of these are easy to request/modify via AI-generated Canvas or inline SVG code snippets.
