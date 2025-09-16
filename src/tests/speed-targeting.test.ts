import { describe, it, expect } from 'vitest';
import { calculateInterceptPoint, predictEnemyPosition } from '../game/targeting.js';
import { Enemy } from '../game/enemy.js';
import { waypoints } from '../game/map.js';

describe('Speed Multiplier Targeting Analysis', () => {
  it('should analyze targeting accuracy degradation at higher speeds', () => {
    const fastEnemy = new Enemy('fast');
    fastEnemy.x = waypoints[0].x;
    fastEnemy.y = waypoints[0].y;
    fastEnemy.i = 0;
    
    const towerPos = { x: 200, y: 200 };
    const projectileSpeed = 200;
    
    console.log('Predictive Targeting Analysis:');
    
    [1, 2, 4].forEach(speedMult => {
      // Calculate intercept point
      const intercept = calculateInterceptPoint(towerPos, fastEnemy, projectileSpeed, speedMult);
      
      // Calculate how long projectile takes to reach intercept
      const interceptDistance = Math.hypot(intercept.x - towerPos.x, intercept.y - towerPos.y);
      const projectileTime = interceptDistance / (projectileSpeed * speedMult);
      
      // Predict where enemy will actually be when projectile arrives
      const actualEnemyPos = predictEnemyPosition(fastEnemy, projectileTime, speedMult);
      
      // Calculate targeting error
      const targetingError = Math.hypot(
        actualEnemyPos.x - intercept.x,
        actualEnemyPos.y - intercept.y
      );
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Intercept point: (${intercept.x.toFixed(1)}, ${intercept.y.toFixed(1)})`);
      console.log(`  Projectile travel time: ${projectileTime.toFixed(3)}s`);
      console.log(`  Actual enemy position: (${actualEnemyPos.x.toFixed(1)}, ${actualEnemyPos.y.toFixed(1)})`);
      console.log(`  Targeting error: ${targetingError.toFixed(1)}px`);
      console.log(`  Error vs base radius (12px): ${(targetingError / 12).toFixed(2)}x`);
      console.log('');
      
      // At 1x speed, error should be minimal
      if (speedMult === 1) {
        expect(targetingError).toBeLessThan(5); // Should be very accurate at 1x
      }
    });
  });

  it('should demonstrate the core targeting problem at higher speeds', () => {
    const fastEnemy = new Enemy('fast'); // 140 speed
    fastEnemy.x = waypoints[0].x;
    fastEnemy.y = waypoints[0].y;
    fastEnemy.i = 0;
    
    // const towerPos = { x: waypoints[0].x + 100, y: waypoints[0].y }; // 100px away
    const projectileSpeed = 200;
    
    console.log('Core Targeting Problem Analysis:');
    console.log(`Fast enemy speed: ${fastEnemy.speed}px/s`);
    console.log(`Projectile speed: ${projectileSpeed}px/s`);
    console.log(`Distance to target: 100px`);
    console.log('');
    
    [1, 2, 4].forEach(speedMult => {
      // Time for projectile to travel 100px
      const baseProjectileTime = 100 / (projectileSpeed * speedMult);
      
      // How far enemy moves in that time
      const enemyMovement = fastEnemy.speed * speedMult * baseProjectileTime;
      
      // Relative speed advantage
      const effectiveEnemySpeed = fastEnemy.speed * speedMult;
      const effectiveProjectileSpeed = projectileSpeed * speedMult;
      const speedRatio = effectiveEnemySpeed / effectiveProjectileSpeed;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Effective enemy speed: ${effectiveEnemySpeed}px/s`);
      console.log(`  Effective projectile speed: ${effectiveProjectileSpeed}px/s`);
      console.log(`  Projectile travel time: ${baseProjectileTime.toFixed(3)}s`);
      console.log(`  Enemy movement during travel: ${enemyMovement.toFixed(1)}px`);
      console.log(`  Speed ratio (enemy/projectile): ${speedRatio.toFixed(3)}`);
      console.log('');
      
      // The problem: at higher speeds, the time scales proportionally affect the prediction
      const difficultyMultiplier = enemyMovement / 12; // vs hit radius
      console.log(`  Difficulty vs hit radius: ${difficultyMultiplier.toFixed(2)}x`);
      
      if (speedMult === 4) {
        // At 4x, the enemy moves too far during projectile travel
        expect(enemyMovement).toBeGreaterThan(25); // Moves more than 2x hit radius
      }
    });
  });

  it('should show the mathematical relationship', () => {
    console.log('Mathematical Analysis:');
    console.log('At higher speeds, both enemy and projectile scale by speedMult');
    console.log('But the RELATIVE motion scaling creates prediction errors');
    console.log('');
    
    const baseDistance = 100;
    const enemySpeed = 140;
    const projectileSpeed = 200;
    
    [1, 2, 4].forEach(speedMult => {
      // At any speed, time to cover distance is: distance / (projectileSpeed * speedMult)
      const time = baseDistance / (projectileSpeed * speedMult);
      
      // Enemy displacement is: enemySpeed * speedMult * time
      const displacement = enemySpeed * speedMult * time;
      
      // Simplifying: displacement = enemySpeed * baseDistance / projectileSpeed
      // This is INDEPENDENT of speedMult! So why does targeting fail?
      
      const theoreticalDisplacement = enemySpeed * baseDistance / projectileSpeed;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Time: ${time.toFixed(3)}s`);
      console.log(`  Displacement: ${displacement.toFixed(1)}px`);
      console.log(`  Theoretical (speed-independent): ${theoreticalDisplacement.toFixed(1)}px`);
      console.log(`  Difference: ${Math.abs(displacement - theoreticalDisplacement).toFixed(3)}px`);
      
      expect(Math.abs(displacement - theoreticalDisplacement)).toBeLessThan(0.1);
    });
    
    console.log('');
    console.log('The math shows displacement should be speed-independent!');
    console.log('The problem must be in the algorithm implementation...');
  });
});