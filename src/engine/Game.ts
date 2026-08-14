import { Car } from './Car';
import { Level } from './Level';
import { LEVELS } from './levels';
import type { Direction } from './types';

export class Game {
  level!: Level;
  levelNumber = 1;
  finished = false;
  score = 0;

  constructor() {
    this.newGame();
  }

  moveCar(car: Car, dir: Direction, distance: number): boolean {
    if (this.finished || !this.level.moveCar(car, dir, distance, false, false)) {
      return false;
    }
    if (this.level.checkStatus()) {
      this.levelNumber++;
      this.score += this.level.getScore();
      this.levelLoad();
    }
    return true;
  }

  newGame(): void {
    this.levelNumber = 1;
    this.score = 0;
    this.finished = false;
    this.level = new Level(LEVELS[this.levelNumber - 1]);
  }

  private levelLoad(): void {
    const idx = this.levelNumber - 1;
    if (idx >= LEVELS.length) {
      this.finished = true;
      this.score = this.score - this.level.getScore();
      return;
    }
    this.level = new Level(LEVELS[idx]);
  }

  undo(): boolean {
    if (this.isFinished()) {
      return false;
    }
    return this.level.undo();
  }

  redo(): boolean {
    if (this.isFinished()) {
      return false;
    }
    return this.level.redo();
  }

  reset(): void {
    this.level.reset();
    if (this.finished) {
      this.levelNumber--;
      this.finished = false;
    }
  }

  isFinished(): boolean {
    return this.finished;
  }

  getTotalScore(): number {
    return this.score + this.level.getScore();
  }

  getScore(): number {
    return this.score;
  }

  getLevelScore(): number {
    return this.level.getScore();
  }

  getLevelName(): string {
    return this.level.getName();
  }

  getLevelNumber(): number {
    return this.levelNumber;
  }

  getLevel(): Level {
    return this.level;
  }

  getUndoRedoCarId(isUndo: boolean): string {
    return this.level.getUndoRedoCarId(isUndo);
  }

  toString(): string {
    return `Level ${this.levelNumber}\n${this.level.toString()}`;
  }
}