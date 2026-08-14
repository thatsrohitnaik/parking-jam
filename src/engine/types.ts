export type Direction = 'L' | 'R' | 'U' | 'D';
export type Orientation = 'H' | 'V';
export type Tile = string;
export type BoardTiles = Tile[][];

// Board tiles are indexed like the Java original: x = row, y = column.
export interface Pos {
  x: number;
  y: number;
}

// Record of a performed movement. `direction` is the INVERTED direction,
// i.e. the direction an undo must apply to revert the original move.
export interface MoveRecord {
  direction: Direction;
  distance: number;
  id: string;
}

export interface LevelData {
  name: string;
  rows: number;
  columns: number;
  board: string[];
}

export class LevelError extends Error {}