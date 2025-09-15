import { describe, it, expect } from 'vitest';

describe('Balanced Collision Detection', () => {
  it('should provide nearly identical effective hit areas across speed multipliers', () => {
    const BASE_HIT_RADIUS = 12;
    const BASE_ENEMY_SPEED = 80;
    const BASE_PROJECTILE_SPEED = 200;
    
    console.log('New Balanced Collision System:');
    
    [1, 2, 4].forEach(speedMult => {
      const enemyMovePerFrame = (BASE_ENEMY_SPEED * speedMult) / 60;
      const projectileMovePerFrame = (BASE_PROJECTILE_SPEED * speedMult) / 60;
      
      // New balanced formula
      const baseMovementPerFrame = (BASE_ENEMY_SPEED + BASE_PROJECTILE_SPEED) / 60;
      const currentMovementPerFrame = (BASE_ENEMY_SPEED + BASE_PROJECTILE_SPEED) * speedMult / 60;
      const movementRatio = currentMovementPerFrame / baseMovementPerFrame;
      const adjustedHitRadius = BASE_HIT_RADIUS / Math.pow(movementRatio, 0.3);
      
      const effectiveHitArea = adjustedHitRadius + enemyMovePerFrame + projectileMovePerFrame;
      
      // Calculate what 1x speed effective area is for comparison
      const baseEffectiveArea = BASE_HIT_RADIUS + (BASE_ENEMY_SPEED + BASE_PROJECTILE_SPEED) / 60;
      const balanceRatio = effectiveHitArea / baseEffectiveArea;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Adjusted hit radius: ${adjustedHitRadius.toFixed(1)}px (was ${BASE_HIT_RADIUS}px)`);
      console.log(`  Effective hit area: ${effectiveHitArea.toFixed(1)}px`);
      console.log(`  Balance ratio vs 1x: ${balanceRatio.toFixed(2)}x`);
      
      // The goal is to keep balance ratio as close to 1.0 as possible
      if (speedMult === 1) {
        expect(balanceRatio).toBeCloseTo(1.0, 1);
      } else {
        // Allow small variance (within 15%) for higher speeds
        expect(balanceRatio).toBeGreaterThan(0.85);
        expect(balanceRatio).toBeLessThan(1.15);
      }
    });
  });
  
  it('should show the effect of different compensation powers', () => {
    const BASE_HIT_RADIUS = 12;
    const speedMult = 4; // Test at 4x speed
    
    console.log('\nCompensation Power Analysis at 4x speed:');
    
    const powers = [0.2, 0.3, 0.4, 0.5]; // Different compensation strengths
    
    powers.forEach(power => {
      const baseMovementPerFrame = (80 + 200) / 60;
      const currentMovementPerFrame = (80 + 200) * speedMult / 60;
      const movementRatio = currentMovementPerFrame / baseMovementPerFrame;
      const adjustedHitRadius = BASE_HIT_RADIUS / Math.pow(movementRatio, power);
      
      const enemyMove = (80 * speedMult) / 60;
      const projectileMove = (200 * speedMult) / 60;
      const effectiveArea = adjustedHitRadius + enemyMove + projectileMove;
      const baseArea = BASE_HIT_RADIUS + (80 + 200) / 60;
      const ratio = effectiveArea / baseArea;
      
      console.log(`Power ${power}: radius=${adjustedHitRadius.toFixed(1)}px, ratio=${ratio.toFixed(2)}x`);
    });
  });
});