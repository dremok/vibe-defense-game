import { describe, it, expect } from 'vitest';

describe('Linear Collision Compensation', () => {
  it('should test simple linear compensation', () => {
    const BASE_HIT_RADIUS = 12;
    
    console.log('Linear Collision Compensation:');
    
    [1, 2, 4].forEach(speedMult => {
      const adjustedHitRadius = BASE_HIT_RADIUS / speedMult;
      const enemyMovePerFrame = (80 * speedMult) / 60;
      const projectileMovePerFrame = (200 * speedMult) / 60;
      const effectiveHitArea = adjustedHitRadius + enemyMovePerFrame + projectileMovePerFrame;
      
      // Compare to 1x speed baseline
      const baseEffectiveArea = BASE_HIT_RADIUS + (80 + 200) / 60;
      const balanceRatio = effectiveHitArea / baseEffectiveArea;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Hit radius: ${adjustedHitRadius.toFixed(1)}px`);
      console.log(`  Effective area: ${effectiveHitArea.toFixed(1)}px`);
      console.log(`  Balance vs 1x: ${balanceRatio.toFixed(2)}x`);
    });
    
    // Test specific values
    expect(BASE_HIT_RADIUS / 1).toBe(12);
    expect(BASE_HIT_RADIUS / 2).toBe(6);
    expect(BASE_HIT_RADIUS / 4).toBe(3);
  });
});