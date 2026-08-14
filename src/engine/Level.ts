import { Car } from './Car';
import { Parking } from './Parking';
import type { Direction, LevelData, MoveRecord, Orientation, Tile } from './types';
import { LevelError } from './types';

export class Level {
  private redCar: Car | null = null;
  private board: Parking;
  private initialBoard: Parking;
  private vehicles = new Map<string, Car>();
  private idCars: string[] = [];
  private name!: string;
  private score = 0;
  private undoMov: MoveRecord[] = [];
  private stackRedo: MoveRecord[] = [];

  constructor(data: LevelData) {
    this.board = this.fillBoard(data);
    this.initialBoard = this.board.duplicate();
    this.loadCars();
    this.score = 0;
  }

  private fillBoard(data: LevelData): Parking {
    this.name = data.name;
    const nRows = data.rows;
    const nColumns = data.columns;
    const { board } = data;

    if (board.length !== nRows) {
      throw new LevelError('You have to put first the number of rows and then the number of columns');
    }

    const boardTiles = board.map((line) => line.split(''));
    let redSize = 0;
    let exit = 0;
    let walls = 0;
    const totalWalls = nColumns + (nRows - 2) * 2 + nColumns - 1;

    for (let i = 0; i < nRows; i++) {
      const line = board[i];
      if (line.length !== nColumns) {
        throw new LevelError(`The level must have ${nColumns} columns each line`);
      }
      for (let j = 0; j < nColumns; j++) {
        const c = line.charAt(j);
        if (c === '*') redSize++;
        else if (c === '@') exit++;
        else if (c === '+') walls++;
        boardTiles[i][j] = c;
      }
    }

    if (exit !== 1) {
      throw new LevelError('The level must have one exit');
    }
    if (walls !== totalWalls) {
      throw new LevelError(
        `A level must be surrounded by walls: This level must have ${totalWalls} walls`,
      );
    }
    if (redSize !== 2) {
      throw new LevelError('The level must have one red car');
    }

    return new Parking(boardTiles);
  }

  private loadCars(): void {
    const b = this.board.getTiles();
    for (let i = 1; i < this.board.getNRows() - 1; i++) {
      for (let j = 1; j < this.board.getNColumns() - 1; j++) {
        const letter = b[i][j];
        if (!this.idCars.includes(letter) && letter !== ' ' && !this.loadCar(b, letter, i, j)) {
          throw new LevelError('Vehicles must have the form 1xN or Nx1 where N ≥ 2');
        }
      }
    }
  }

  private loadCar(b: Tile[][], letter: string, x: number, y: number): boolean {
    let len = 1;
    const horizontal = b[x][y + 1] === letter;
    if (horizontal) {
      for (let j = y + 1; j < b[0].length; j++) {
        if (b[x][j] === letter) {
          len++;
        }
      }
    } else {
      for (let i = x + 1; i < b.length; i++) {
        if (b[i][y] === letter) {
          len++;
        }
      }
    }
    return this.createCar(len, x, y, letter, horizontal);
  }

  private createCar(length: number, x: number, y: number, id: string, horizontal: boolean): boolean {
    if (length >= 2) {
      const vehicle = new Car(x, y, id, length, horizontal);
      this.vehicles.set(id, vehicle);
      this.idCars.push(id);
      if (vehicle.isRedCar()) {
        this.redCar = vehicle;
      }
      return true;
    }
    return false;
  }

  // Performs a move, clamping the requested distance to the maximum the
  // vehicle can actually travel (so a drag that overshoots lands on the
  // last free cell instead of being fully rejected). Returns the number of
  // cells moved (0 if blocked).
  attemptMove(vehicle: Car, direction: Direction, requested: number): number {
    if (requested <= 0) return 0;
    const distance = this.maxMoveDistance(vehicle, direction, requested);
    if (distance <= 0) return 0;
    this.moveCar(vehicle, direction, distance, false, false);
    return distance;
  }

  // Largest distance (<= requested) the vehicle can move in `direction`
  // without hitting another vehicle or a wall. Pure: no board mutation.
  maxMoveDistance(vehicle: Car, direction: Direction, requested: number): number {
    for (let d = requested; d >= 1; d--) {
      if (this.clearFor(vehicle, direction, d)) return d;
    }
    return 0;
  }

  private clearFor(vehicle: Car, direction: Direction, distance: number): boolean {
    const tiles = this.board.getTiles();
    const orientation = vehicle.getOrientation();
    const isRed = vehicle.isRedCar();
    const passable = (t: Tile) => t === ' ' || (t === '@' && isRed);

    if (orientation === 'H') {
      const row = vehicle.getCurrentPositionX();
      const col = vehicle.getCurrentPositionY();
      if (direction === 'L') {
        if (col - distance <= 0) return false;
        for (let i = col - 1; i >= col - distance; i--) {
          if (!passable(tiles[row][i])) return false;
        }
        return true;
      }
      const size = vehicle.getLength();
      if (col + size + distance - 1 >= tiles[0].length) return false;
      for (let i = col + size; i <= col + size + distance - 1; i++) {
        if (!passable(tiles[row][i])) return false;
      }
      return true;
    }

    const row = vehicle.getCurrentPositionX();
    const col = vehicle.getCurrentPositionY();
    if (direction === 'U') {
      if (row - distance <= 0) return false;
      for (let i = row - 1; i >= row - distance; i--) {
        if (!passable(tiles[i][col])) return false;
      }
      return true;
    }
    const size = vehicle.getLength();
    if (row + size + distance - 1 >= tiles.length) return false;
    for (let i = row + size; i <= row + size + distance - 1; i++) {
      if (!passable(tiles[i][col])) return false;
    }
    return true;
  }

  moveCar(vehicle: Car, direction: Direction, distance: number, undo: boolean, redo: boolean): boolean {
    if (redo) {
      direction = this.invert(direction);
    }

    if (distance === 0) {
      return false;
    }

    if (this.verifyMovement(vehicle, direction, distance)) {
      if (!undo) {
        this.undoMov.push({ direction: this.invert(direction), distance, id: vehicle.getId() });
      }
      this.board.updateParking(vehicle, direction, distance);
      if (!undo && !redo) {
        this.score++;
      }
      return true;
    }
    return false;
  }

  verifyMovement(vehicle: Car, direction: Direction, distance: number): boolean {
    const tiles = this.board.getTiles();
    const orientation: Orientation = vehicle.getOrientation();

    if (orientation === 'H') {
      if (direction === 'L') return this.verifyMovementLeft(tiles, vehicle, distance);
      if (direction === 'R') return this.verifyMovementRight(tiles, vehicle, distance);
    } else if (direction === 'U') {
      return this.verifyMovementUp(tiles, vehicle, distance);
    } else if (direction === 'D') {
      return this.verifyMovementDown(tiles, vehicle, distance);
    }
    return false;
  }

  private verifyMovementLeft(tiles: Tile[][], vehicle: Car, distance: number): boolean {
    const row = vehicle.getCurrentPositionX();
    const column = vehicle.getCurrentPositionY();
    const isRedCar = vehicle.isRedCar();

    if (column - distance <= 0) return false;
    for (let i = column - 1; i >= column - distance; i--) {
      if (!this.isEmptyTile(tiles[row][i])) {
        vehicle.setOnGoal(this.isGoalTile(tiles[row][i], isRedCar));
        return vehicle.isOnGoal();
      }
    }
    return true;
  }

  private verifyMovementRight(tiles: Tile[][], vehicle: Car, distance: number): boolean {
    const nColumns = tiles[0].length;
    const row = vehicle.getCurrentPositionX();
    const column = vehicle.getCurrentPositionY();
    const vehicleSize = vehicle.getLength();
    const isRedCar = vehicle.isRedCar();

    if (column + vehicleSize + distance - 1 >= nColumns) return false;
    for (let i = column + vehicleSize; i <= column + vehicleSize + distance - 1; i++) {
      if (!this.isEmptyTile(tiles[row][i])) {
        vehicle.setOnGoal(this.isGoalTile(tiles[row][i], isRedCar));
        return vehicle.isOnGoal();
      }
    }
    return true;
  }

  private verifyMovementUp(tiles: Tile[][], vehicle: Car, distance: number): boolean {
    const row = vehicle.getCurrentPositionX();
    const column = vehicle.getCurrentPositionY();
    const isRedCar = vehicle.isRedCar();

    if (row - distance <= 0) return false;
    for (let i = row - 1; i >= row - distance; i--) {
      if (!this.isEmptyTile(tiles[i][column])) {
        vehicle.setOnGoal(this.isGoalTile(tiles[i][column], isRedCar));
        return vehicle.isOnGoal();
      }
    }
    return true;
  }

  private verifyMovementDown(tiles: Tile[][], vehicle: Car, distance: number): boolean {
    const nRows = tiles.length;
    const row = vehicle.getCurrentPositionX();
    const column = vehicle.getCurrentPositionY();
    const vehicleSize = vehicle.getLength();
    const isRedCar = vehicle.isRedCar();

    if (row + vehicleSize + distance - 1 >= nRows) return false;
    for (let i = row + vehicleSize; i <= row + vehicleSize + distance - 1; i++) {
      if (!this.isEmptyTile(tiles[i][column])) {
        vehicle.setOnGoal(this.isGoalTile(tiles[i][column], isRedCar));
        return vehicle.isOnGoal();
      }
    }
    return true;
  }

  private isEmptyTile(tile: Tile): boolean {
    return tile === ' ';
  }

  private isGoalTile(tile: Tile, isRedCar: boolean): boolean {
    return tile === '@' && isRedCar;
  }

  checkStatus(): boolean {
    return this.redCar !== null && this.redCar.isOnGoal();
  }

  reset(): void {
    for (const c of this.idCars) {
      this.vehicles.get(c)!.reset();
    }
    this.redCar?.setOnGoal(false);
    this.undoMov = [];
    this.stackRedo = [];
    this.score = 0;
    this.board = this.initialBoard.duplicate();
  }

  getUndoRedoCarId(isUndo: boolean): string {
    let pair: MoveRecord;
    if (isUndo) {
      pair = this.undoMov[this.undoMov.length - 1];
      this.undoMov.splice(this.undoMov.length - 1, 1);
    } else {
      pair = this.stackRedo.pop()!;
    }
    return pair.id;
  }

  undo(): boolean {
    if (this.undoMov.length === 0) {
      return false;
    }
    const pair = this.undoMov[this.undoMov.length - 1];
    this.moveCar(this.vehicles.get(pair.id)!, pair.direction, pair.distance, true, false);
    this.stackRedo.push(pair);
    return true;
  }

  redo(): boolean {
    if (this.stackRedo.length === 0) {
      return false;
    }
    const pair = this.stackRedo[this.stackRedo.length - 1];
    this.moveCar(this.vehicles.get(pair.id)!, pair.direction, pair.distance, false, true);
    return true;
  }

  canUndo(): boolean {
    return this.undoMov.length > 0;
  }

  canRedo(): boolean {
    return this.stackRedo.length > 0;
  }

  private invert(dir: Direction): Direction {
    switch (dir) {
      case 'D':
        return 'U';
      case 'R':
        return 'L';
      case 'U':
        return 'D';
      case 'L':
        return 'R';
      default:
        return dir;
    }
  }

  getRedCarCoords(): { x: number; y: number } {
    return this.redCar!.getCurrentPos();
  }

  getRedCar(): Car {
    return this.redCar!;
  }

  getBoard(): Parking {
    return this.board;
  }

  getVehiclesMap(): Map<string, Car> {
    return this.vehicles;
  }

  getUndoMov(): MoveRecord[] {
    return this.undoMov;
  }

  getName(): string {
    return this.name;
  }

  getScore(): number {
    return this.score;
  }

  toString(): string {
    return '\n' + this.board.toString();
  }
}