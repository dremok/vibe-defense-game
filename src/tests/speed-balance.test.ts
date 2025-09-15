import { describe, it, expect } from 'vitest';

describe('Speed Multiplier Balance', () => {
  // Test that relative speeds maintain proper balance
  it('should maintain consistent projectile hit rates across speed multipliers', () => {
    const baseEnemySpeed = 80;
    const baseProjectileSpeed = 200;
    const baseTowerRate = 1.5; // shots per second
    
    // Calculate relative speeds at different multipliers
    const testMultipliers = [1, 2, 4];
    
    testMultipliers.forEach(speedMult => {
      const enemySpeed = baseEnemySpeed * speedMult;
      const projectileSpeed = baseProjectileSpeed * speedMult;
      const shootInterval = (1000 / baseTowerRate) / speedMult; // ms between shots
      
      // Calculate time for projectile to travel a typical distance
      const typicalDistance = 80; // tower range
      const projectileTravel = typicalDistance / projectileSpeed;
      
      // Calculate how far enemy moves during projectile travel
      const enemyMovementDuringTravel = enemySpeed * projectileTravel;
      
      console.log(`Speed ${speedMult}x:`, {
        enemySpeed,
        projectileSpeed,
        shootInterval: Math.round(shootInterval),
        projectileTravel: Math.round(projectileTravel * 1000), // ms
        enemyMovementDuringTravel: Math.round(enemyMovementDuringTravel)
      });
      
      // The ratio of projectile speed to enemy speed should be constant
      const speedRatio = projectileSpeed / enemySpeed;
      expect(speedRatio).toBeCloseTo(baseProjectileSpeed / baseEnemySpeed, 2);
    });
  });
  
  it('should demonstrate the current issue with target prediction', () => {
    // Simulate a scenario where an enemy is moving
    const enemyX = 100;
    const enemyY = 100;
    const enemySpeedX = 80; // moving right
    const towerX = 50;
    const towerY = 100;
    
    const testScenario = (speedMult: number) => {
      const adjustedEnemySpeed = enemySpeedX * speedMult;
      const projectileSpeed = 200 * speedMult;
      
      // Distance from tower to enemy
      const distance = Math.hypot(enemyX - towerX, enemyY - towerY);
      
      // Time for projectile to reach current enemy position
      const travelTime = distance / projectileSpeed;
      
      // Where enemy will be when projectile arrives
      const enemyFutureX = enemyX + (adjustedEnemySpeed * travelTime);
      
      // Miss distance (how far off the projectile will be)
      const missDistance = Math.abs(enemyFutureX - enemyX);
      
      return { travelTime, missDistance, speedMult };
    };
    
    const results = [1, 2, 4].map(testScenario);
    
    results.forEach(result => {
      console.log(`Speed ${result.speedMult}x: travel=${result.travelTime.toFixed(3)}s, miss=${result.missDistance.toFixed(1)}px`);
    });
    
    // At higher speeds, miss distance should stay proportional, but...
    // the issue is that collision detection happens in discrete steps
    // and faster projectiles have better "luck" hitting moving targets
  });
});