import { Game } from '../engine/Game';
import { LEVELS } from '../engine/levels';
import { minMoves } from '../engine/solver';

function redExitDistance(game: Game): number {
  const level = game.getLevel();
  const board = level.getBoard().lines();
  let exitRow = -1;
  for (let r = 0; r < board.length; r++) {
    if (board[r].includes('@')) {
      exitRow = r;
      break;
    }
  }
  const red = level.getRedCar();
  const pos = red.getCurrentPos();
  return exitRow - (pos.x + red.getLength() - 1);
}

describe('Game', () => {
  it('starts a new game at level 1', () => {
    const g = new Game();
    expect(g.getLevelNumber()).toBe(1);
    expect(g.getLevelName()).toBe('Level 1');
    expect(g.isFinished()).toBe(false);
    expect(g.getTotalScore()).toBe(0);
  });

  it('provides 100 levels', () => {
    expect(LEVELS.length).toBe(100);
  });

  it('moves the red car onto the goal to advance the level', () => {
    const g = new Game();
    const dist = redExitDistance(g);
    const ok = g.moveCar(g.getLevel().getRedCar(), 'D', dist);
    expect(ok).toBeGreaterThan(0);
    expect(g.getLevelNumber()).toBe(2);
    expect(g.getLevelName()).toBe('Level 2');
    expect(g.getTotalScore()).toBe(1);
    expect(g.getLevelScore()).toBe(0);
  });

  it('undoes and redoes a move', () => {
    const g = new Game();
    const level = g.getLevel();
    const parking = level.getBoard().lines();
    level.moveCar(level.getRedCar(), 'D', 1, false, false);
    g.undo();
    expect(level.getBoard().lines()).toEqual(parking);
  });

  it('resets the current level', () => {
    const g = new Game();
    const level = g.getLevel();
    const initial = level.getBoard().lines();
    level.moveCar(level.getRedCar(), 'D', 1, false, false);
    g.reset();
    expect(level.getBoard().lines()).toEqual(initial);
  });

  it('all generated levels are solvable (sampled)', () => {
    for (const i of [0, 24, 49, 74, 99]) {
      expect(minMoves(LEVELS[i], 30000)).not.toBeNull();
    }
  });
});
