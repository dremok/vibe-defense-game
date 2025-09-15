import { describe, it, expect } from 'vitest';
import { Enemy } from '../game/enemy.js';
import { Projectile } from '../game/projectile.js';
import { waypoints } from '../game/map.js';

describe('Real-World Speed Collision Analysis', () => {
  it('should simulate actual projectile-enemy collisions at different speeds', () => {
    console.log('Real-World Collision Simulation:');
    console.log('Testing if projectile can actually hit fast enemy at different speeds');
    console.log('');
    
    [1, 2, 4].forEach(speedMult => {
      const fastEnemy = new Enemy('fast');
      fastEnemy.x = waypoints[0].x;
      fastEnemy.y = waypoints[0].y;
      fastEnemy.i = 0;
      
      // Create projectile aimed at current position (basic tower behavior)
      const basicProjectile = new Projectile(
        fastEnemy.x + 100, // Tower 100px to the right
        fastEnemy.y,
        fastEnemy.x, // Aimed at current position
        fastEnemy.y,
        2
      );
      
      // Create projectile with simple leading (naive prediction)
      const leadingProjectile = new Projectile(
        fastEnemy.x + 100,
        fastEnemy.y,
        fastEnemy.x + 50, // Lead by 50px
        fastEnemy.y,
        2
      );
      
      let basicHit = false;
      let leadingHit = false;
      let frame = 0;
      const maxFrames = 200;
      
      while (frame < maxFrames && (!basicHit || !leadingHit) && fastEnemy.alive) {
        const dt = 1/60; // 60 FPS
        
        // Update enemy
        fastEnemy.update(dt, speedMult, () => {});
        
        // Update projectiles
        basicProjectile.update(dt, speedMult);
        leadingProjectile.update(dt, speedMult);
        
        // Check collisions (using current game logic)
        const baseHitRadius = 12;
        const adjustedHitRadius = baseHitRadius / Math.pow(speedMult, 0.25);
        
        // Basic projectile collision
        if (basicProjectile.alive && fastEnemy.alive) {
          const basicDist = Math.hypot(
            fastEnemy.x - basicProjectile.x,
            fastEnemy.y - basicProjectile.y
          );
          if (basicDist < adjustedHitRadius) {
            basicHit = true;
          }
        }
        
        // Leading projectile collision
        if (leadingProjectile.alive && fastEnemy.alive) {
          const leadingDist = Math.hypot(
            fastEnemy.x - leadingProjectile.x,
            fastEnemy.y - leadingProjectile.y
          );
          if (leadingDist < adjustedHitRadius) {
            leadingHit = true;
          }
        }
        
        frame++;
      }
      
      console.log(`Speed ${speedMult}x (adjusted hit radius: ${(baseHitRadius / Math.pow(speedMult, 0.25)).toFixed(1)}px):`);
      console.log(`  Basic targeting (current position): ${basicHit ? 'HIT' : 'MISS'} after ${frame} frames`);
      console.log(`  Simple leading (50px ahead): ${leadingHit ? 'HIT' : 'MISS'} after ${frame} frames`);
      console.log(`  Enemy final position: (${fastEnemy.x.toFixed(1)}, ${fastEnemy.y.toFixed(1)})`);
      console.log(`  Basic projectile final: (${basicProjectile.x.toFixed(1)}, ${basicProjectile.y.toFixed(1)}), alive: ${basicProjectile.alive}`);
      console.log(`  Leading projectile final: (${leadingProjectile.x.toFixed(1)}, ${leadingProjectile.y.toFixed(1)}), alive: ${leadingProjectile.alive}`);
      console.log('');
    });
  });

  it('should test the collision frequency issue at different speeds', () => {
    console.log('Collision Frequency Analysis:');
    console.log('Testing collision detection opportunities per frame');
    console.log('');
    
    [1, 2, 4].forEach(speedMult => {
      const enemySpeedPerFrame = (140 * speedMult) / 60; // Fast enemy speed per frame
      const projectileSpeedPerFrame = (200 * speedMult) / 60; // Projectile speed per frame
      const combinedSpeedPerFrame = enemySpeedPerFrame + projectileSpeedPerFrame;
      
      const baseHitRadius = 12;
      const adjustedHitRadius = baseHitRadius / Math.pow(speedMult, 0.25);
      
      // If objects move faster than hit radius per frame, collision might be missed
      const framesInHitZone = adjustedHitRadius / combinedSpeedPerFrame;
      const missedCollisionRisk = combinedSpeedPerFrame > adjustedHitRadius;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Enemy speed per frame: ${enemySpeedPerFrame.toFixed(1)}px`);
      console.log(`  Projectile speed per frame: ${projectileSpeedPerFrame.toFixed(1)}px`);
      console.log(`  Combined speed per frame: ${combinedSpeedPerFrame.toFixed(1)}px`);
      console.log(`  Adjusted hit radius: ${adjustedHitRadius.toFixed(1)}px`);
      console.log(`  Frames in hit zone: ${framesInHitZone.toFixed(2)}`);
      console.log(`  Missed collision risk: ${missedCollisionRisk ? 'HIGH' : 'LOW'}`);
      console.log('');
      
      if (speedMult === 4) {
        // At 4x speed, objects might move faster than hit radius
        expect(combinedSpeedPerFrame).toBeGreaterThan(adjustedHitRadius / 2);
      }
    });
  });

  it('should analyze projectile lifetime and targeting window', () => {
    console.log('Projectile Lifetime Analysis:');
    console.log('How long do projectiles stay alive and in what area?');
    console.log('');
    
    [1, 2, 4].forEach(speedMult => {
      // Projectile aimed at position 100px away
      const projectile = new Projectile(0, 0, 100, 0, 2);
      let frame = 0;
      const dt = 1/60;
      
      while (projectile.alive && frame < 300) {
        projectile.update(dt, speedMult);
        frame++;
      }
      
      const lifetimeSeconds = frame * dt;
      const finalDistance = Math.hypot(projectile.x, projectile.y);
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Projectile lifetime: ${lifetimeSeconds.toFixed(3)}s`);
      console.log(`  Frames alive: ${frame}`);
      console.log(`  Final position: (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)})`);
      console.log(`  Final distance from origin: ${finalDistance.toFixed(1)}px`);
      console.log('');
      
      // Projectile should reach target and die
      expect(finalDistance).toBeCloseTo(100, 0);
    });
  });
});