import { waypoints } from './map.js';
import type { EnemyType } from './types.js';

export class Enemy {
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
  
  update(dt: number, onReachEnd: () => void) {
    if (!this.alive) return;
    const target = waypoints[this.i + 1];
    if (!target) {
      this.alive = false; // reached end
      onReachEnd(); // callback to damage base
      return;
    }
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const step = this.speed * dt;
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