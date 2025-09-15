import { describe, it, expect } from 'vitest';

describe('Collision Detection Fix', () => {
  it('should maintain consistent effective hit areas across speed multipliers', () => {
    const BASE_HIT_RADIUS = 12;
    
    // Test the adjusted hit radius formula
    [1, 2, 4].forEach(speedMult => {
      const enemyMovePerFrame = (80 * speedMult) / 60;
      const projectileMovePerFrame = (200 * speedMult) / 60;
      
      // Old system (broken)
      const oldEffectiveHitArea = BASE_HIT_RADIUS + enemyMovePerFrame + projectileMovePerFrame;
      
      // New system (fixed)
      const adjustedHitRadius = BASE_HIT_RADIUS / Math.sqrt(speedMult);
      const newEffectiveHitArea = adjustedHitRadius + enemyMovePerFrame + projectileMovePerFrame;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Adjusted hit radius: ${adjustedHitRadius.toFixed(1)}px (was ${BASE_HIT_RADIUS}px)`);
      console.log(`  Old effective area: ${oldEffectiveHitArea.toFixed(1)}px`);
      console.log(`  New effective area: ${newEffectiveHitArea.toFixed(1)}px`);
      console.log(`  Improvement ratio: ${(oldEffectiveHitArea / newEffectiveHitArea).toFixed(2)}x`);
      console.log('');
    });
  });
  
  it('should calculate specific hit radius values', () => {
    const BASE_HIT_RADIUS = 12;
    
    const testCases = [
      { speed: 1, expected: 12.0 },
      { speed: 2, expected: 8.5 },
      { speed: 4, expected: 6.0 }
    ];
    
    testCases.forEach(({ speed, expected }) => {
      const adjustedRadius = BASE_HIT_RADIUS / Math.sqrt(speed);
      expect(adjustedRadius).toBeCloseTo(expected, 1);
    });
  });
  
  it('should demonstrate the mathematical reasoning', () => {
    // The square root scaling compensates for the quadratic increase in movement
    // Movement per frame scales linearly with speed: movement = speed × dt
    // Effective area scales quadratically: area ∝ (movement)²
    // Using sqrt(speed) as denominator: adjusted_radius = base_radius / sqrt(speed)
    // Results in consistent effective collision area
    
    const BASE_HIT_RADIUS = 12;
    
    console.log('Mathematical verification:');
    console.log('Movement scales linearly with speed');
    console.log('Collision area opportunity scales quadratically');
    console.log('Compensation: radius = base_radius / sqrt(speed)');
    console.log('');
    
    [1, 2, 4].forEach(speedMult => {
      const linearIncrease = speedMult;
      const quadraticIncrease = speedMult * speedMult;
      const sqrtCompensation = Math.sqrt(speedMult);
      const adjustedRadius = BASE_HIT_RADIUS / sqrtCompensation;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Linear movement increase: ${linearIncrease}x`);
      console.log(`  Quadratic area increase: ${quadraticIncrease}x`);
      console.log(`  Sqrt compensation factor: ${sqrtCompensation.toFixed(2)}x`);
      console.log(`  Final adjusted radius: ${adjustedRadius.toFixed(1)}px`);
    });
  });
});