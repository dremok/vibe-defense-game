import { gridToWorld } from '../utils.js';
import type { Position } from './types.js';

export const pathCells = [
  [1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
  [8,2],[8,3],[8,4],[8,5],[8,6],
  [7,6],[6,6],[5,6],[4,6],[3,6],[2,6],
  [2,7],[2,8],[2,9],[2,10],[2,11],
  [3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11]
];

export const waypoints: Position[] = pathCells.map(([gx, gy]) => gridToWorld(gx, gy));