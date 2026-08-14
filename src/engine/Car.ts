import type { Direction, Orientation, Pos } from './types';

export class Car {
  readonly id: string;
  readonly length: number;
  readonly orientation: Orientation;
  readonly redCar: boolean;
  readonly initialStateX: number;
  readonly initialStateY: number;

  private positionX: number;
  private positionY: number;
  private onGoal = false;

  constructor(
    initialStateX: number,
    initialStateY: number,
    id: string,
    length: number,
    horizontal: boolean,
  ) {
    this.id = id;
    this.length = length;
    this.orientation = horizontal ? 'H' : 'V';
    this.redCar = id === '*';
    this.initialStateX = initialStateX;
    this.initialStateY = initialStateY;
    this.positionX = initialStateX;
    this.positionY = initialStateY;
  }

  move(direction: Direction, distance: number): Pos {
    if (this.orientation === 'H') {
      if (direction === 'L') {
        this.positionY -= distance;
      } else if (direction === 'R') {
        this.positionY += distance;
      }
    } else if (direction === 'U') {
      this.positionX -= distance;
    } else if (direction === 'D') {
      this.positionX += distance;
    }
    return this.getCurrentPos();
  }

  isOnGoal(): boolean {
    return this.onGoal && this.redCar;
  }

  setOnGoal(isOnGoal: boolean): void {
    this.onGoal = isOnGoal;
  }

  getId(): string {
    return this.id;
  }

  getLength(): number {
    return this.length;
  }

  getOrientation(): Orientation {
    return this.orientation;
  }

  isRedCar(): boolean {
    return this.redCar;
  }

  getCurrentPos(): Pos {
    return { x: this.positionX, y: this.positionY };
  }

  getCurrentPositionX(): number {
    return this.positionX;
  }

  getCurrentPositionY(): number {
    return this.positionY;
  }

  reset(): void {
    this.positionX = this.initialStateX;
    this.positionY = this.initialStateY;
  }
}