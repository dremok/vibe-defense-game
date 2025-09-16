import { describe, it, expect, beforeEach } from 'vitest';
import { Tower, TOWER_STATS } from '../game/tower.js';
import { Enemy } from '../game/enemy.js';
// import type { TowerType } from '../game/types.js';

describe('Tower System', () => {
  let basicTower: Tower;
  let sniperTower: Tower;
  let normalEnemy: Enemy;
  let fastEnemy: Enemy;
  
  beforeEach(() => {
    basicTower = new Tower(5, 5, 'basic');
    sniperTower = new Tower(5, 5, 'sniper');
    normalEnemy = new Enemy('normal');
    fastEnemy = new Enemy('fast');
  });

  describe('Tower Stats', () => {
    it('should have correct stats defined for all tower types', () => {
      expect(TOWER_STATS.basic).toEqual({
        range: 80,
        damage: 2,
        rate: 1.5,
        cost: 100
      });
      
      expect(TOWER_STATS.sniper).toEqual({
        range: 120,
        damage: 3,
        rate: 0.8,
        cost: 150
      });
    });

    it('should initialize tower with correct stats based on type', () => {
      expect(basicTower.type).toBe('basic');
      expect(basicTower.range).toBe(80);
      expect(basicTower.damage).toBe(2);
      expect(basicTower.rate).toBe(1.5);
      expect(basicTower.cost).toBe(100);
      
      expect(sniperTower.type).toBe('sniper');
      expect(sniperTower.range).toBe(120);
      expect(sniperTower.damage).toBe(3);
      expect(sniperTower.rate).toBe(0.8);
      expect(sniperTower.cost).toBe(150);
    });

    it('should default to basic tower when no type specified', () => {
      const defaultTower = new Tower(0, 0);
      expect(defaultTower.type).toBe('basic');
      expect(defaultTower.range).toBe(TOWER_STATS.basic.range);
    });
  });

  describe('Tower Targeting', () => {
    it('should find enemies within range', () => {
      // Place enemy within basic tower range (80)
      normalEnemy.x = basicTower.x + 50;
      normalEnemy.y = basicTower.y;
      
      const target = basicTower.findTarget([normalEnemy]);
      expect(target).toBe(normalEnemy);
    });

    it('should not target enemies outside range', () => {
      // Place enemy outside basic tower range
      normalEnemy.x = basicTower.x + 150;
      normalEnemy.y = basicTower.y;
      
      const target = basicTower.findTarget([normalEnemy]);
      expect(target).toBeNull();
    });

    it('should target closest enemy when multiple in range', () => {
      const enemy1 = new Enemy('normal');
      const enemy2 = new Enemy('normal');
      
      // Place enemy1 closer than enemy2
      enemy1.x = basicTower.x + 30;
      enemy1.y = basicTower.y;
      enemy2.x = basicTower.x + 60;
      enemy2.y = basicTower.y;
      
      const target = basicTower.findTarget([enemy1, enemy2]);
      expect(target).toBe(enemy1);
    });

    it('should not target dead enemies', () => {
      normalEnemy.x = basicTower.x + 50;
      normalEnemy.y = basicTower.y;
      normalEnemy.alive = false;
      
      const target = basicTower.findTarget([normalEnemy]);
      expect(target).toBeNull();
    });
  });

  describe('Tower Range Differences', () => {
    it('should have different effective ranges for different tower types', () => {
      // Place enemy within sniper range but outside basic range
      normalEnemy.x = basicTower.x + 100; // Distance: 100
      normalEnemy.y = basicTower.y;
      
      const basicTarget = basicTower.findTarget([normalEnemy]);
      const sniperTarget = sniperTower.findTarget([normalEnemy]);
      
      expect(basicTarget).toBeNull(); // Basic range: 80, enemy at 100
      expect(sniperTarget).toBe(normalEnemy); // Sniper range: 120, enemy at 100
    });
  });

  describe('Tower Shooting Mechanics', () => {
    it('should shoot at different rates based on tower type', () => {
      const projectiles: any[] = [];
      const mockOnShoot = (p: any) => projectiles.push(p);
      
      // Place enemy in range
      normalEnemy.x = basicTower.x + 50;
      normalEnemy.y = basicTower.y;
      
      // Set last shot time to a very old time to ensure towers can shoot
      const currentSimulationTime = 10; // 10 seconds simulation time
      basicTower.lastShotTime = 0; // Old shot time
      sniperTower.lastShotTime = 0;
      
      basicTower.update(0.1, [normalEnemy], currentSimulationTime, mockOnShoot);
      const basicProjectileCount = projectiles.length;
      
      projectiles.length = 0; // Clear array
      sniperTower.update(0.1, [normalEnemy], currentSimulationTime, mockOnShoot);
      const sniperProjectileCount = projectiles.length;
      
      // Both should shoot once if conditions are met
      expect(basicProjectileCount).toBe(1);
      expect(sniperProjectileCount).toBe(1);
    });

    it('should create projectiles with correct damage based on tower type', () => {
      const projectiles: any[] = [];
      const mockOnShoot = (p: any) => projectiles.push(p);
      
      normalEnemy.x = basicTower.x + 50;
      normalEnemy.y = basicTower.y;
      
      const currentSimulationTime = 10;
      basicTower.lastShotTime = 0;
      basicTower.update(0.1, [normalEnemy], currentSimulationTime, mockOnShoot);
      
      expect(projectiles.length).toBe(1);
      expect(projectiles[0].damage).toBe(2); // Basic tower damage
      
      projectiles.length = 0;
      sniperTower.lastShotTime = 0;
      sniperTower.update(0.1, [normalEnemy], currentSimulationTime, mockOnShoot);
      
      expect(projectiles.length).toBe(1);
      expect(projectiles[0].damage).toBe(3); // Sniper tower damage
    });
  });

  describe('Predictive Targeting', () => {
    it('should use different targeting for basic vs sniper towers', () => {
      const projectiles: any[] = [];
      const mockOnShoot = (p: any) => projectiles.push(p);
      
      // Place fast enemy (moves quickly)
      fastEnemy.x = basicTower.x + 50;
      fastEnemy.y = basicTower.y;
      fastEnemy.i = 0; // At waypoint 0, moving toward waypoint 1
      
      const currentSimulationTime = 10;
      basicTower.lastShotTime = 0;
      sniperTower.lastShotTime = 0;
      
      basicTower.update(0.1, [fastEnemy], currentSimulationTime, mockOnShoot);
      expect(projectiles.length).toBe(1);
      const basicProjectile = projectiles[0];
      
      projectiles.length = 0;
      sniperTower.update(0.1, [fastEnemy], currentSimulationTime, mockOnShoot);
      expect(projectiles.length).toBe(1);
      const sniperProjectile = projectiles[0];
      
      // Basic tower should aim at current position
      expect(basicProjectile.targetX).toBe(fastEnemy.x);
      expect(basicProjectile.targetY).toBe(fastEnemy.y);
      
      // Sniper tower should use predictive targeting (different target position)
      const sniperUsedPrediction = 
        sniperProjectile.targetX !== fastEnemy.x || 
        sniperProjectile.targetY !== fastEnemy.y;
      
      expect(sniperUsedPrediction).toBe(true);
    });
  });

  describe('Tower Drawing', () => {
    it('should not throw errors when drawing towers', () => {
      // Mock canvas context
      const mockCtx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        beginPath: () => {},
        closePath: () => {},
        fill: () => {},
        stroke: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        fillRect: () => {}
      } as any;
      
      expect(() => basicTower.draw(mockCtx)).not.toThrow();
      expect(() => sniperTower.draw(mockCtx)).not.toThrow();
    });
  });
});