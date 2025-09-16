import type { Enemy } from './enemy.js';
import type { Position } from './types.js';
import { waypoints } from './map.js';

/**
 * Calculate the velocity of an enemy based on its current position and target waypoint
 */
export function calculateEnemyVelocity(enemy: Enemy): Position {
  if (!enemy.alive) return { x: 0, y: 0 };
  
  const target = waypoints[enemy.i + 1];
  if (!target) return { x: 0, y: 0 };
  
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);
  
  if (dist === 0) return { x: 0, y: 0 };
  
  const velocity = {
    x: (dx / dist) * enemy.speed,
    y: (dy / dist) * enemy.speed
  };
  
  return velocity;
}

/**
 * Predict where an enemy will be after a given time, accounting for path waypoints
 */
export function predictEnemyPosition(enemy: Enemy, timeSeconds: number, speedMult: number): Position {
  if (!enemy.alive) return { x: enemy.x, y: enemy.y };
  
  // Start with current position
  let currentX = enemy.x;
  let currentY = enemy.y;
  let currentWaypointIndex = enemy.i;
  let remainingTime = timeSeconds;
  
  while (remainingTime > 0 && currentWaypointIndex + 1 < waypoints.length) {
    const target = waypoints[currentWaypointIndex + 1];
    const dx = target.x - currentX;
    const dy = target.y - currentY;
    const distanceToTarget = Math.hypot(dx, dy);
    
    const effectiveSpeed = enemy.speed * speedMult;
    const timeToReachTarget = distanceToTarget / effectiveSpeed;
    
    if (timeToReachTarget <= remainingTime) {
      // Enemy will reach this waypoint within the time limit
      currentX = target.x;
      currentY = target.y;
      currentWaypointIndex++;
      remainingTime -= timeToReachTarget;
    } else {
      // Enemy will be somewhere between current position and target
      const travelDistance = effectiveSpeed * remainingTime;
      const progress = travelDistance / distanceToTarget;
      currentX += dx * progress;
      currentY += dy * progress;
      remainingTime = 0;
    }
  }
  
  return { x: currentX, y: currentY };
}

/**
 * Calculate optimal intercept point for a projectile to hit a moving enemy
 */
export function calculateInterceptPoint(
  shooterPos: Position,
  enemy: Enemy,
  projectileSpeed: number,
  speedMult: number
): Position {
  if (!enemy.alive) {
    return { x: enemy.x, y: enemy.y };
  }
  
  // Get enemy velocity
  const velocity = calculateEnemyVelocity(enemy);
  if (velocity.x === 0 && velocity.y === 0) {
    return { x: enemy.x, y: enemy.y };
  }
  
  const effectiveVelocity = {
    x: velocity.x * speedMult,
    y: velocity.y * speedMult
  };
  
  // Solve the intercept problem: find time t where projectile and enemy meet
  // Enemy position at time t: enemy.pos + velocity * t
  // Projectile distance at time t: projectileSpeed * speedMult * t
  // Constraint: distance from shooter to enemy position at time t equals projectile distance
  
  // let bestTime = 0;
  let bestPosition = { x: enemy.x, y: enemy.y };
  let minError = Infinity;
  
  // Try different intercept times (up to 3 seconds)
  for (let time = 0; time <= 3; time += 0.05) {
    const predictedPos = predictEnemyPosition(enemy, time, speedMult);
    const distanceToTarget = Math.hypot(
      predictedPos.x - shooterPos.x,
      predictedPos.y - shooterPos.y
    );
    const projectileTime = distanceToTarget / (projectileSpeed * speedMult);
    const error = Math.abs(projectileTime - time);
    
    if (error < minError) {
      minError = error;
      // bestTime = time;
      bestPosition = predictedPos;
    }
  }
  
  // If prediction accuracy is poor, fall back to simple leading
  if (minError > 0.3) {
    // Simple leading: add velocity * estimated time
    const initialDistance = Math.hypot(enemy.x - shooterPos.x, enemy.y - shooterPos.y);
    const estimatedTime = initialDistance / (projectileSpeed * speedMult);
    
    return {
      x: enemy.x + effectiveVelocity.x * estimatedTime,
      y: enemy.y + effectiveVelocity.y * estimatedTime
    };
  }
  
  return bestPosition;
}