import { describe, it, expect, beforeEach } from 'vitest';
import { Enemy } from '../game/enemy.js';
import { calculateEnemyVelocity, predictEnemyPosition, calculateInterceptPoint } from '../game/targeting.js';
import { waypoints } from '../game/map.js';

describe('Targeting System', () => {
  let normalEnemy: Enemy;
  let fastEnemy: Enemy;
  
  beforeEach(() => {
    normalEnemy = new Enemy('normal');
    fastEnemy = new Enemy('fast');
  });

  describe('calculateEnemyVelocity', () => {
    it('should calculate correct velocity for enemy moving toward next waypoint', () => {
      // Place enemy at first waypoint
      normalEnemy.x = waypoints[0].x;
      normalEnemy.y = waypoints[0].y;
      normalEnemy.i = 0;
      
      const velocity = calculateEnemyVelocity(normalEnemy);
      
      // Should be moving toward waypoint[1]
      const dx = waypoints[1].x - waypoints[0].x;
      const dy = waypoints[1].y - waypoints[0].y;
      const dist = Math.hypot(dx, dy);
      
      const expectedVx = (dx / dist) * normalEnemy.speed;
      const expectedVy = (dy / dist) * normalEnemy.speed;
      
      expect(velocity.x).toBeCloseTo(expectedVx, 2);
      expect(velocity.y).toBeCloseTo(expectedVy, 2);
    });

    it('should return zero velocity for dead enemy', () => {
      normalEnemy.alive = false;
      const velocity = calculateEnemyVelocity(normalEnemy);
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });

    it('should return zero velocity for enemy at final waypoint', () => {
      normalEnemy.i = waypoints.length - 1;
      const velocity = calculateEnemyVelocity(normalEnemy);
      
      expect(velocity.x).toBe(0);
      expect(velocity.y).toBe(0);
    });
  });

  describe('predictEnemyPosition', () => {
    it('should predict enemy position for normal movement', () => {
      // Place enemy at start
      normalEnemy.x = waypoints[0].x;
      normalEnemy.y = waypoints[0].y;
      normalEnemy.i = 0;
      
      const futurePos = predictEnemyPosition(normalEnemy, 1.0, 1); // 1 second, 1x speed
      
      // Should be 80 pixels toward waypoint[1] (normal enemy speed)
      const dx = waypoints[1].x - waypoints[0].x;
      const dy = waypoints[1].y - waypoints[0].y;
      const dist = Math.hypot(dx, dy);
      
      const expectedX = waypoints[0].x + (dx / dist) * 80;
      const expectedY = waypoints[0].y + (dy / dist) * 80;
      
      expect(futurePos.x).toBeCloseTo(expectedX, 1);
      expect(futurePos.y).toBeCloseTo(expectedY, 1);
    });

    it('should handle speed multiplier correctly', () => {
      normalEnemy.x = waypoints[0].x;
      normalEnemy.y = waypoints[0].y;
      normalEnemy.i = 0;
      
      const futurePos1x = predictEnemyPosition(normalEnemy, 1.0, 1);
      const futurePos2x = predictEnemyPosition(normalEnemy, 0.5, 2); // Should be same distance
      
      expect(futurePos1x.x).toBeCloseTo(futurePos2x.x, 1);
      expect(futurePos1x.y).toBeCloseTo(futurePos2x.y, 1);
    });

    it('should handle waypoint transitions', () => {
      // Place enemy very close to waypoint[1]
      const target = waypoints[1];
      normalEnemy.x = target.x - 5; // 5 pixels before waypoint
      normalEnemy.y = target.y;
      normalEnemy.i = 0;
      
      // Predict far enough into future to pass waypoint (3 seconds should be enough)
      const futurePos = predictEnemyPosition(normalEnemy, 3.0, 1);
      
      // Should have moved significantly from the target waypoint
      const distanceFromTarget = Math.hypot(futurePos.x - target.x, futurePos.y - target.y);
      expect(distanceFromTarget).toBeGreaterThan(50); // Should be well past the waypoint
    });
  });

  describe('calculateInterceptPoint', () => {
    it('should return reasonable intercept point for stationary tower and moving enemy', () => {
      const towerPos = { x: 200, y: 200 };
      const projectileSpeed = 200;
      
      // Place enemy at start of path (it will be moving toward waypoint[1])
      normalEnemy.x = waypoints[0].x;
      normalEnemy.y = waypoints[0].y;
      normalEnemy.i = 0;
      
      const intercept = calculateInterceptPoint(towerPos, normalEnemy, projectileSpeed, 1);
      
      // Should be a valid position
      expect(typeof intercept.x).toBe('number');
      expect(typeof intercept.y).toBe('number');
      expect(isFinite(intercept.x)).toBe(true);
      expect(isFinite(intercept.y)).toBe(true);
      
      // Intercept should be different from current position (leading the target)
      const distanceFromCurrent = Math.hypot(intercept.x - normalEnemy.x, intercept.y - normalEnemy.y);
      expect(distanceFromCurrent).toBeGreaterThan(0);
    });

    it('should handle fast enemies differently than normal enemies', () => {
      const towerPos = { x: 200, y: 200 };
      const projectileSpeed = 200;
      
      // Place both enemies at same starting position
      normalEnemy.x = waypoints[0].x;
      normalEnemy.y = waypoints[0].y;
      normalEnemy.i = 0;
      
      fastEnemy.x = waypoints[0].x;
      fastEnemy.y = waypoints[0].y;
      fastEnemy.i = 0;
      
      const normalIntercept = calculateInterceptPoint(towerPos, normalEnemy, projectileSpeed, 1);
      const fastIntercept = calculateInterceptPoint(towerPos, fastEnemy, projectileSpeed, 1);
      
      // Fast enemy should need more leading (intercept should be further ahead along the path)
      const normalDistance = Math.hypot(normalIntercept.x - normalEnemy.x, normalIntercept.y - normalEnemy.y);
      const fastDistance = Math.hypot(fastIntercept.x - fastEnemy.x, fastIntercept.y - fastEnemy.y);
      
      expect(fastDistance).toBeGreaterThan(normalDistance);
    });

    it('should return valid intercept point even for challenging scenarios', () => {
      const towerPos = { x: 1000, y: 1000 }; // Very far away
      const projectileSpeed = 10; // Very slow projectile
      
      normalEnemy.x = waypoints[0].x;
      normalEnemy.y = waypoints[0].y;
      normalEnemy.i = 0;
      
      const intercept = calculateInterceptPoint(towerPos, normalEnemy, projectileSpeed, 1);
      
      // Should return a valid position (even if it's a simple leading calculation)
      expect(typeof intercept.x).toBe('number');
      expect(typeof intercept.y).toBe('number');
      expect(isFinite(intercept.x)).toBe(true);
      expect(isFinite(intercept.y)).toBe(true);
    });
  });
});