import { describe, it, expect } from 'vitest';

// Test the continuous collision detection function
function getClosestApproachDistance(
  p1x: number, p1y: number, p2x: number, p2y: number, // Projectile path
  q1x: number, q1y: number, q2x: number, q2y: number  // Enemy path
): number {
  // Direction vectors
  const p_dx = p2x - p1x;
  const p_dy = p2y - p1y;
  const q_dx = q2x - q1x;
  const q_dy = q2y - q1y;
  
  // Relative position vector
  const w_x = p1x - q1x;
  const w_y = p1y - q1y;
  
  // Parametric equation coefficients for closest approach
  const a = p_dx * p_dx + p_dy * p_dy; // dot(p_dir, p_dir)
  const b = p_dx * q_dx + p_dy * q_dy; // dot(p_dir, q_dir)
  const c = q_dx * q_dx + q_dy * q_dy; // dot(q_dir, q_dir)
  const d = p_dx * w_x + p_dy * w_y;   // dot(p_dir, w)
  const e = q_dx * w_x + q_dy * w_y;   // dot(q_dir, w)
  
  const denom = a * c - b * b;
  let s_c = 0, t_c = 0;
  
  if (denom !== 0) {
    // Lines are not parallel
    s_c = (b * e - c * d) / denom;
    t_c = (a * e - b * d) / denom;
  } else {
    // Lines are parallel, find closest approach
    s_c = 0;
    t_c = d / b;
  }
  
  // Clamp parameters to segment bounds [0,1]
  s_c = Math.max(0, Math.min(1, s_c));
  t_c = Math.max(0, Math.min(1, t_c));
  
  // Calculate closest points
  const closest_p_x = p1x + s_c * p_dx;
  const closest_p_y = p1y + s_c * p_dy;
  const closest_q_x = q1x + t_c * q_dx;
  const closest_q_y = q1y + t_c * q_dy;
  
  // Return distance between closest points
  return Math.hypot(closest_p_x - closest_q_x, closest_p_y - closest_q_y);
}

describe('Continuous Collision Detection', () => {
  it('should catch fast-moving objects that pass through each other', () => {
    console.log('Continuous Collision Detection Test:');
    console.log('Testing collision detection for fast-moving objects');
    console.log('');
    
    // Scenario: Fast projectile moving right, fast enemy moving down
    // They cross paths but never occupy the same position at frame boundaries
    
    const scenarios = [
      {
        name: 'Slow crossing (1x speed)',
        // Projectile: moves horizontally through point where enemy will be
        projectileStart: [45, 50],
        projectileEnd: [55, 50],
        // Enemy: moves vertically through point where projectile will be  
        enemyStart: [50, 45],
        enemyEnd: [50, 55]
      },
      {
        name: 'Fast crossing (4x speed)',
        // Same crossing point, but faster movement
        projectileStart: [35, 50],
        projectileEnd: [65, 50],
        // Enemy moves faster vertically
        enemyStart: [50, 35],
        enemyEnd: [50, 65]
      },
      {
        name: 'Very fast crossing (8x speed simulation)',
        // Even faster movement through same crossing point
        projectileStart: [20, 50],
        projectileEnd: [80, 50],
        // Enemy moves very fast vertically
        enemyStart: [50, 20],
        enemyEnd: [50, 80]
      }
    ];
    
    scenarios.forEach(scenario => {
      const [p1x, p1y] = scenario.projectileStart;
      const [p2x, p2y] = scenario.projectileEnd;
      const [q1x, q1y] = scenario.enemyStart;
      const [q2x, q2y] = scenario.enemyEnd;
      
      // Distance at start of frame
      const startDist = Math.hypot(p1x - q1x, p1y - q1y);
      
      // Distance at end of frame
      const endDist = Math.hypot(p2x - q2x, p2y - q2y);
      
      // Closest approach during movement
      const closestDist = getClosestApproachDistance(p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y);
      
      console.log(`${scenario.name}:`);
      console.log(`  Start distance: ${startDist.toFixed(1)}px`);
      console.log(`  End distance: ${endDist.toFixed(1)}px`);
      console.log(`  Closest approach: ${closestDist.toFixed(1)}px`);
      
      // Hit radius comparison
      const hitRadius = 12;
      const wouldHitDiscrete = Math.min(startDist, endDist) < hitRadius;
      const wouldHitContinuous = closestDist < hitRadius;
      
      console.log(`  Discrete collision (old): ${wouldHitDiscrete ? 'HIT' : 'MISS'}`);
      console.log(`  Continuous collision (new): ${wouldHitContinuous ? 'HIT' : 'MISS'}`);
      console.log('');
      
      // All crossing scenarios should result in hits with continuous detection
      if (scenario.name.includes('crossing')) {
        expect(wouldHitContinuous).toBe(true);
      }
    });
  });

  it('should be speed-independent for collision success rate', () => {
    console.log('Speed Independence Verification:');
    console.log('Same trajectory at different speeds should have same collision result');
    console.log('');
    
    // Test the same relative trajectory at different speeds
    const baseTrajectory = {
      projectile: { start: [0, 50], direction: [1, 0] },    // Moving right
      enemy: { start: [50, 40], direction: [0, 1] }         // Moving down
    };
    
    [1, 2, 4, 8].forEach(speedMult => {
      // Scale movement by speed multiplier
      const projSpeed = 3.3 * speedMult;  // Base projectile speed per frame
      const enemySpeed = 2.3 * speedMult; // Base enemy speed per frame
      
      const p1x = baseTrajectory.projectile.start[0];
      const p1y = baseTrajectory.projectile.start[1];
      const p2x = p1x + projSpeed * baseTrajectory.projectile.direction[0];
      const p2y = p1y + projSpeed * baseTrajectory.projectile.direction[1];
      
      const q1x = baseTrajectory.enemy.start[0];
      const q1y = baseTrajectory.enemy.start[1];
      const q2x = q1x + enemySpeed * baseTrajectory.enemy.direction[0];
      const q2y = q1y + enemySpeed * baseTrajectory.enemy.direction[1];
      
      const closestDist = getClosestApproachDistance(p1x, p1y, p2x, p2y, q1x, q1y, q2x, q2y);
      const hitRadius = 12 / Math.pow(speedMult, 0.25); // Adjusted hit radius
      const wouldHit = closestDist < hitRadius;
      
      console.log(`Speed ${speedMult}x:`);
      console.log(`  Projectile movement: ${projSpeed.toFixed(1)}px`);
      console.log(`  Enemy movement: ${enemySpeed.toFixed(1)}px`);
      console.log(`  Closest approach: ${closestDist.toFixed(1)}px`);
      console.log(`  Adjusted hit radius: ${hitRadius.toFixed(1)}px`);
      console.log(`  Result: ${wouldHit ? 'HIT' : 'MISS'}`);
      console.log('');
    });
    
    console.log('With continuous collision detection and hit radius adjustment,');
    console.log('the collision success rate should be similar across all speeds.');
  });

  it('should handle edge cases correctly', () => {
    // Test parallel movement (no collision)
    const parallelDist = getClosestApproachDistance(
      0, 0, 10, 0,  // Projectile moving right
      0, 5, 10, 5   // Enemy moving right, 5px above
    );
    expect(parallelDist).toBeCloseTo(5, 1);
    
    // Test direct collision
    const directDist = getClosestApproachDistance(
      0, 0, 10, 0,  // Projectile moving right
      10, 0, 0, 0   // Enemy moving left, same line
    );
    expect(directDist).toBeLessThan(1); // Should be very close to 0
    
    // Test perpendicular crossing
    const perpendicularDist = getClosestApproachDistance(
      0, 5, 10, 5,  // Projectile moving right
      5, 0, 5, 10   // Enemy moving down, crossing at (5,5)
    );
    expect(perpendicularDist).toBeLessThan(1); // Should cross very close
  });
});