import { describe, it, expect } from 'vitest';

describe('Gentle Collision Compensation', () => {
  it('should provide much more balanced hit radii', () => {
    const BASE_HIT_RADIUS = 12;
    
    console.log('Gentle Collision Compensation (power 0.25):');
    
    [1, 2, 4].forEach(speedMult => {
      const adjustedHitRadius = BASE_HIT_RADIUS / Math.pow(speedMult, 0.25);
      const enemyMovePerFrame = (80 * speedMult) / 60;
      const projectileMovePerFrame = (200 * speedMult) / 60;
      const effectiveHitArea = adjustedHitRadius + enemyMovePerFrame + projectileMovePerFrame;
      
      // Compare to 1x speed baseline
      const baseEffectiveArea = BASE_HIT_RADIUS + (80 + 200) / 60;
      const balanceRatio = effectiveHitArea / baseEffectiveArea;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Hit radius: ${adjustedHitRadius.toFixed(1)}px (was ${BASE_HIT_RADIUS}px)`);
      console.log(`  Effective area: ${effectiveHitArea.toFixed(1)}px`);
      console.log(`  Balance vs 1x: ${balanceRatio.toFixed(2)}x`);
      console.log('');
    });
    
    // This should give us much more reasonable values:
    // 1x: 12.0px (unchanged)
    // 2x: ~10.1px (gentle reduction)
    // 4x: ~8.5px (moderate reduction)
    
    expect(BASE_HIT_RADIUS / Math.pow(1, 0.25)).toBeCloseTo(12.0, 1);
    expect(BASE_HIT_RADIUS / Math.pow(2, 0.25)).toBeCloseTo(10.1, 1);
    expect(BASE_HIT_RADIUS / Math.pow(4, 0.25)).toBeCloseTo(8.5, 1);
  });
});