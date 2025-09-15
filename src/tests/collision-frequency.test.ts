import { describe, it, expect } from 'vitest';

describe('Collision Detection Frequency Issue', () => {
  it('should demonstrate how faster speeds create better hit rates', () => {
    const HIT_RADIUS = 12;
    const FRAME_RATE = 60; // FPS
    const dt = 1 / FRAME_RATE; // seconds per frame
    
    const simulateHit = (speedMult: number) => {
      // Enemy moving right at constant speed
      let enemyX = 100;
      const enemySpeed = 80 * speedMult;
      
      // Projectile aimed at enemy's initial position, moving towards it
      let projectileX = 50;
      let projectileY = 100;
      const projectileSpeed = 200 * speedMult;
      const targetX = 100;
      const targetY = 100;
      
      let frames = 0;
      let hit = false;
      
      // Simulate frame by frame
      while (frames < 100 && !hit && projectileX < targetX + 50) {
        frames++;
        
        // Update enemy position
        enemyX += enemySpeed * dt;
        
        // Update projectile position
        const dx = targetX - projectileX;
        const dy = targetY - projectileY;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
          const step = projectileSpeed * dt;
          projectileX += (dx / dist) * step;
          projectileY += (dy / dist) * step;
        }
        
        // Check collision
        const collisionDist = Math.hypot(enemyX - projectileX, projectileY - 100);
        if (collisionDist < HIT_RADIUS) {
          hit = true;
        }
      }
      
      return { speedMult, frames, hit, finalEnemyX: enemyX, finalProjectileX: projectileX };
    };
    
    const results = [1, 2, 4].map(simulateHit);
    
    console.log('Collision Simulation Results:');
    results.forEach(r => {
      console.log(`Speed ${r.speedMult}x: ${r.hit ? 'HIT' : 'MISS'} after ${r.frames} frames`);
      console.log(`  Enemy final X: ${r.finalEnemyX.toFixed(1)}, Projectile final X: ${r.finalProjectileX.toFixed(1)}`);
    });
    
    // This test will likely show that higher speeds have better hit rates
    // due to the discrete collision detection
  });
  
  it('should show that hit radius becomes more effective at higher speeds', () => {
    const HIT_RADIUS = 12;
    
    // At different speeds, calculate how much each entity moves per frame
    [1, 2, 4].forEach(speedMult => {
      const enemyMovePerFrame = (80 * speedMult) / 60; // pixels per frame
      const projectileMovePerFrame = (200 * speedMult) / 60; // pixels per frame
      
      // The "effective hit window" - how much area the collision can happen in
      const effectiveHitArea = HIT_RADIUS + enemyMovePerFrame + projectileMovePerFrame;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Enemy moves ${enemyMovePerFrame.toFixed(1)}px/frame`);
      console.log(`  Projectile moves ${projectileMovePerFrame.toFixed(1)}px/frame`);
      console.log(`  Effective hit area: ${effectiveHitArea.toFixed(1)}px`);
      console.log(`  Hit area ratio vs 1x: ${(effectiveHitArea / (HIT_RADIUS + (80/60) + (200/60))).toFixed(2)}x`);
    });
  });
});