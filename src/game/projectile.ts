export class Projectile {
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
    const step = this.speed * dt;
    
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