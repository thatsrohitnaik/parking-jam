import { Game } from '../engine/Game';
import { LEVELS } from '../engine/levels';
import type { Direction } from '../engine/types';

// Minimal solver-verified solutions for the five easy levels.
const SOLUTIONS: Record<number, Array<[string, Direction, number]>> = {
  1: [['*', 'D', 4]],
  2: [
    ['a', 'L', 2],
    ['*', 'D', 4],
  ],
  3: [
    ['a', 'L', 1],
    ['c', 'L', 1],
    ['*', 'D', 4],
  ],
  4: [
    ['a', 'L', 2],
    ['b', 'L', 2],
    ['c', 'L', 2],
    ['*', 'D', 4],
  ],
  5: [
    ['a', 'L', 1],
    ['b', 'R', 2],
    ['c', 'L', 1],
    ['*', 'D', 4],
  ],
};

const TOTAL_REQUIRED_MOVES = Object.values(SOLUTIONS).reduce((sum, moves) => sum + moves.length, 0);

function solveLevel(game: Game, levelIndex: number): void {
  const level = game.getLevel();
  const moves = SOLUTIONS[levelIndex];
  for (const [id, dir, distance] of moves) {
    expect(game.moveCar(level.getVehiclesMap().get(id)!, dir, distance)).toBe(true);
  }
}

describe('Game', () => {
  it('starts a new game at level 1', () => {
    const g = new Game();
    expect(g.getLevelNumber()).toBe(1);
    expect(g.getLevelName()).toBe('Level 1');
    expect(g.isFinished()).toBe(false);
    expect(g.getTotalScore()).toBe(0);
  });

  it('moves the red car onto the goal within a level', () => {
    const g = new Game();
    const level = g.getLevel();
    expect(level.moveCar(level.getRedCar(), 'D', 4, false, false)).toBe(true);
    expect(level.getRedCar().isOnGoal()).toBe(true);
  });

  it('advances to level 2 when level 1 is completed', () => {
    const g = new Game();
    solveLevel(g, 1);
    expect(g.getLevelNumber()).toBe(2);
    expect(g.getLevelName()).toBe('Level 2');
    expect(g.getTotalScore()).toBe(1);
    expect(g.getLevelScore()).toBe(0);
  });

  it('tracks level and total score across levels', () => {
    const g = new Game();
    solveLevel(g, 1);
    solveLevel(g, 2);
    expect(g.getLevelNumber()).toBe(3);
    expect(g.getTotalScore()).toBe(1 + 2);
    expect(g.getLevelScore()).toBe(0);
  });

  it('undoes the red car move restoring the board', () => {
    const g = new Game();
    const level = g.getLevel();
    const parking = level.getBoard().lines();
    level.moveCar(level.getRedCar(), 'D', 4, false, false);
    expect(g.undo()).toBe(true);
    expect(level.getBoard().lines()).toEqual(parking);
  });

  it('undoes then redoes restoring the board', () => {
    const g = new Game();
    const level = g.getLevel();
    level.moveCar(level.getRedCar(), 'D', 4, false, false);
    const parking = level.getBoard().lines();
    g.undo();
    g.redo();
    expect(level.getBoard().lines()).toEqual(parking);
  });

  it('resets the level to its initial board', () => {
    const g = new Game();
    const level = g.getLevel();
    const initial = level.getBoard().lines();
    level.moveCar(level.getRedCar(), 'D', 2, false, false);
    level.moveCar(level.getRedCar(), 'U', 1, false, false);
    g.reset();
    expect(level.getBoard().lines()).toEqual(initial);
  });

  it('completes all five levels and finishes the game', () => {
    const g = new Game();
    for (let i = 1; i <= LEVELS.length; i++) {
      expect(g.getLevelNumber()).toBe(i);
      solveLevel(g, i);
    }
    expect(g.isFinished()).toBe(true);
    expect(g.getTotalScore()).toBe(TOTAL_REQUIRED_MOVES);
  });

  it('newGame restarts at level 1 with a fresh score', () => {
    const g = new Game();
    solveLevel(g, 1);
    g.newGame();
    expect(g.getLevelNumber()).toBe(1);
    expect(g.getScore()).toBe(0);
    expect(g.isFinished()).toBe(false);
    expect(LEVELS[g.getLevelNumber() - 1].name).toBe('Level 1');
  });
});