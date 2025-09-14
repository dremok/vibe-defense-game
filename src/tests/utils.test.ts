import { describe, it, expect } from 'vitest';
import { CELL, worldToGrid, gridToWorld } from '../utils.js';

describe('Grid Utilities', () => {
  it('should convert world coordinates to grid coordinates', () => {
    expect(worldToGrid(0, 0)).toEqual({ gx: 0, gy: 0 });
    expect(worldToGrid(32, 32)).toEqual({ gx: 1, gy: 1 });
    expect(worldToGrid(50, 70)).toEqual({ gx: 1, gy: 2 });
    expect(worldToGrid(31, 31)).toEqual({ gx: 0, gy: 0 });
  });

  it('should convert grid coordinates to world coordinates (cell centers)', () => {
    expect(gridToWorld(0, 0)).toEqual({ x: 16, y: 16 });
    expect(gridToWorld(1, 1)).toEqual({ x: 48, y: 48 });
    expect(gridToWorld(2, 3)).toEqual({ x: 80, y: 112 });
  });

  it('should have consistent round-trip conversion for grid centers', () => {
    const worldPos = gridToWorld(5, 10);
    const gridPos = worldToGrid(worldPos.x, worldPos.y);
    expect(gridPos).toEqual({ gx: 5, gy: 10 });
  });

  it('should use correct CELL constant', () => {
    expect(CELL).toBe(32);
  });
});