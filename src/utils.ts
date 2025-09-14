// Grid utilities
export const CELL = 32;

export const worldToGrid = (x: number, y: number) => ({ 
  gx: Math.floor(x / CELL), 
  gy: Math.floor(y / CELL) 
});

export const gridToWorld = (gx: number, gy: number) => ({ 
  x: gx * CELL + CELL/2, 
  y: gy * CELL + CELL/2 
});