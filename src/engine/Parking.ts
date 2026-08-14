import type { BoardTiles, Direction, Pos } from './types';
import type { Car } from './Car';

export class Parking {
  private tiles: BoardTiles;
  private readonly nRows: number;
  private readonly nColumns: number;
  private readonly exit: { x: number; y: number } | null;

  constructor(board: BoardTiles) {
    this.tiles = board;
    this.nRows = board.length;
    this.nColumns = board[0].length;
    this.exit = this.findExit();
  }

  // The exit tile ('@') is stored once at construction so that when a car
  // drives over it (signalling the goal) the tile can be restored on delete,
  // keeping undo/redo correct.
  private findExit(): { x: number; y: number } | null {
    for (let i = 0; i < this.nRows; i++) {
      for (let j = 0; j < this.nColumns; j++) {
        if (this.tiles[i][j] === '@') {
          return { x: i, y: j };
        }
      }
    }
    return null;
  }

  updateParking(vehicle: Car, direction: Direction, distance: number): Pos {
    this.deleteCar(vehicle);
    const newPosition = vehicle.move(direction, distance);
    this.insertCar(vehicle);
    return newPosition;
  }

  duplicate(): Parking {
    const cloned = this.tiles.map((row) => row.slice());
    return new Parking(cloned);
  }

  private insertCar(vehicle: Car): void {
    const posX = vehicle.getCurrentPositionX();
    const posY = vehicle.getCurrentPositionY();
    const length = vehicle.getLength();
    const id = vehicle.getId();
    if (vehicle.getOrientation() === 'H') {
      for (let j = posY; j < posY + length; j++) {
        this.tiles[posX][j] = id;
      }
    } else {
      for (let i = posX; i < posX + length; i++) {
        this.tiles[i][posY] = id;
      }
    }
  }

  private deleteCar(vehicle: Car): void {
    const posX = vehicle.getCurrentPositionX();
    const posY = vehicle.getCurrentPositionY();
    const length = vehicle.getLength();
    const clear = (i: number, j: number) => {
      const isExit = this.exit !== null && i === this.exit.x && j === this.exit.y;
      this.tiles[i][j] = isExit ? '@' : ' ';
    };
    if (vehicle.getOrientation() === 'H') {
      for (let j = posY; j < length + posY; j++) {
        clear(posX, j);
      }
    } else {
      for (let i = posX; i < posX + length; i++) {
        clear(i, posY);
      }
    }
  }

  getTiles(): BoardTiles {
    return this.tiles.map((row) => row.slice());
  }

  lines(): string[] {
    return this.tiles.map((row) => row.join(''));
  }

  getNRows(): number {
    return this.nRows;
  }

  getNColumns(): number {
    return this.nColumns;
  }

  toString(): string {
    return this.lines().join('\n') + '\n';
  }
}