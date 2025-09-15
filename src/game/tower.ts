import { gridToWorld } from '../utils.js';
import type { Enemy } from './enemy.js';
import { Projectile } from './projectile.js';
import type { TowerType, TowerStats } from './types.js';
import { calculateInterceptPoint } from './targeting.js';

export const TOWER_STATS: Record<TowerType, TowerStats> = {
  basic: {
    range: 80,
    damage: 2,
    rate: 1.5, // shots per second
    cost: 100
  },
  sniper: {
    range: 120,
    damage: 3,
    rate: 0.8, // slower but more powerful
    cost: 150
  }
};

export class Tower {
  gx: number;
  gy: number;
  x: number;
  y: number;
  type: TowerType;
  range: number;
  damage: number;
  rate: number;
  cost: number;
  lastShotTime = 0; // Track in simulation time, not real time
  
  constructor(gx: number, gy: number, type: TowerType = 'basic') {
    this.gx = gx;
    this.gy = gy;
    this.type = type;
    
    const stats = TOWER_STATS[type];
    this.range = stats.range;
    this.damage = stats.damage;
    this.rate = stats.rate;
    this.cost = stats.cost;
    
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
  
  update(dt: number, enemies: Enemy[], simulationTime: number, onShoot: (projectile: Projectile) => void) {
    const target = this.findTarget(enemies);
    const shootInterval = 1 / this.rate; // seconds between shots in simulation time
    if (target && simulationTime - this.lastShotTime > shootInterval) {
      let targetX = target.x;
      let targetY = target.y;
      
      // Use predictive targeting for sniper towers
      if (this.type === 'sniper') {
        const intercept = calculateInterceptPoint(
          { x: this.x, y: this.y },
          target,
          200, // projectile speed
          1 // base speed, no multiplier
        );
        targetX = intercept.x;
        targetY = intercept.y;
      }
      
      const projectile = new Projectile(this.x, this.y, targetX, targetY, this.damage);
      onShoot(projectile);
      this.lastShotTime = simulationTime;
    }
  }
  
  draw(g: CanvasRenderingContext2D) {
    const size = 12;
    
    if (this.type === 'sniper') {
      // Sniper tower: dark green hexagon
      g.fillStyle = '#2d5016';
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = this.x + (size * 0.8) * Math.cos(angle);
        const y = this.y + (size * 0.8) * Math.sin(angle);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.fill();
      
      // Scope symbol (small circle in center)
      g.fillStyle = '#44ff44';
      g.beginPath();
      g.arc(this.x, this.y, 3, 0, Math.PI * 2);
      g.fill();
      
      // Range circle
      g.strokeStyle = 'rgba(68,255,68,0.3)';
    } else {
      // Basic tower: blue square
      g.fillStyle = '#4a5d7a';
      g.fillRect(this.x - size/2, this.y - size/2, size, size);
      
      // Range circle
      g.strokeStyle = 'rgba(100,150,255,0.3)';
    }
    
    g.lineWidth = 1;
    g.beginPath();
    g.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    g.stroke();
  }
}