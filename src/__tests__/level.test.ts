import { Car } from '../engine/Car';
import { Level } from '../engine/Level';
import { LEVELS } from '../engine/levels';
import { LevelError } from '../engine/types';

// A stable, hand-built board used only for unit-testing mechanics.
// Red car (vertical) at column 4, exit at the bottom of that column,
// one horizontal blocker 'a' directly below it.
const BOARD = [
  '++++++++',
  '+      +',
  '+   *  +',
  '+   *  +',
  '+   aa +',
  '+      +',
  '+      +',
  '++++@+++',
];

describe('Car', () => {
  it('creates cars with correct attributes', () => {
    const car = new Car(1, 2, 'a', 3, true);
    expect(car.getId()).toBe('a');
    expect(car.getLength()).toBe(3);
    expect(car.getOrientation()).toBe('H');
    expect(car.isRedCar()).toBe(false);
    expect(car.getCurrentPos()).toEqual({ x: 1, y: 2 });
  });

  it('recognizes the red car', () => {
    const red = new Car(2, 4, '*', 2, false);
    expect(red.isRedCar()).toBe(true);
    expect(red.getOrientation()).toBe('V');
  });

  it('moves and resets', () => {
    const car = new Car(3, 3, 'a', 2, true);
    car.move('R', 2);
    expect(car.getCurrentPos()).toEqual({ x: 3, y: 5 });
    car.move('L', 2);
    car.reset();
    expect(car.getCurrentPos()).toEqual({ x: 3, y: 3 });
  });

  it('only reports on goal for the red car', () => {
    const red = new Car(2, 4, '*', 2, false);
    red.setOnGoal(true);
    expect(red.isOnGoal()).toBe(true);

    const blue = new Car(1, 1, 'a', 2, true);
    blue.setOnGoal(true);
    expect(blue.isOnGoal()).toBe(false);
  });
});

describe('Level parsing', () => {
  it('loads a board matching its definition', () => {
    const level = new Level({ name: 'Test', rows: 8, columns: 8, board: BOARD });
    expect(level.getBoard().lines()).toEqual(BOARD);
    expect(level.getName()).toBe('Test');
  });

  it('rejects a column count mismatch', () => {
    const board = BOARD.slice();
    board[1] = '+     +';
    expect(
      () => new Level({ name: 'Bad', rows: 8, columns: 8, board }),
    ).toThrow(new LevelError('The level must have 8 columns each line'));
  });

  it('rejects missing surrounding walls', () => {
    const board = BOARD.slice();
    board[1] = '      +';
    expect(() => new Level({ name: 'Bad', rows: 8, columns: 8, board })).toThrow(LevelError);
  });

  it('rejects a wrong number of exits', () => {
    const board = BOARD.slice();
    board[7] = '+++@+++@';
    expect(
      () => new Level({ name: 'Bad', rows: 8, columns: 8, board }),
    ).toThrow(new LevelError('The level must have one exit'));
  });

  it('rejects a wrong number of red car cells', () => {
    const board = BOARD.slice();
    const b = board.map((l) => l.split(''));
    b[2] = ['+', ' ', ' ', ' ', '*', '*', ' ', '+'];
    expect(() =>
      new Level({ name: 'Bad', rows: 8, columns: 8, board: b.map((r) => r.join('')) }),
    ).toThrow(new LevelError('The level must have one red car'));
  });

  it('rejects a row-count mismatch', () => {
    expect(
      () => new Level({ name: 'Bad', rows: 7, columns: 8, board: BOARD }),
    ).toThrow(new LevelError('You have to put first the number of rows and then the number of columns'));
  });
});

describe('Level movement', () => {
  function fresh(): Level {
    return new Level({ name: 'Test', rows: 8, columns: 8, board: BOARD });
  }

  it('completes by moving the blocker then the red car', () => {
    const level = fresh();
    expect(level.moveCar(level.getVehiclesMap().get('a')!, 'L', 2, false, false)).toBe(true);
    expect(level.moveCar(level.getRedCar(), 'D', 4, false, false)).toBe(true);
    expect(level.checkStatus()).toBe(true);
  });

  it('rejects invalid red car moves', () => {
    const level = fresh();
    expect(level.moveCar(level.getRedCar(), 'L', 1, false, false)).toBe(false);
    expect(level.moveCar(level.getRedCar(), 'R', 1, false, false)).toBe(false);
    // 'a' blocks the path downward.
    expect(level.moveCar(level.getRedCar(), 'D', 1, false, false)).toBe(false);
  });

  it('rejects perpendicular and out-of-bounds blocker moves', () => {
    const level = fresh();
    expect(level.moveCar(level.getVehiclesMap().get('a')!, 'U', 1, false, false)).toBe(false);
    expect(level.moveCar(level.getVehiclesMap().get('a')!, 'R', 2, false, false)).toBe(false);
    expect(level.moveCar(level.getVehiclesMap().get('a')!, 'L', 4, false, false)).toBe(false);
  });

  it('allows valid blocker moves', () => {
    const level = fresh();
    expect(level.moveCar(level.getVehiclesMap().get('a')!, 'L', 2, false, false)).toBe(true);
    expect(level.moveCar(level.getVehiclesMap().get('a')!, 'R', 1, false, false)).toBe(true);
  });

  it('updates the board after a move', () => {
    const level = fresh();
    level.moveCar(level.getVehiclesMap().get('a')!, 'L', 2, false, false);
    const expected =
      '++++++++\n' +
      '+      +\n' +
      '+   *  +\n' +
      '+   *  +\n' +
      '+ aa   +\n' +
      '+      +\n' +
      '+      +\n' +
      '++++@+++\n';
    expect(level.getBoard().toString()).toBe(expected);
  });

  it('resets the level to its initial state', () => {
    const level = fresh();
    const initial = level.getBoard().lines().join('\n');
    level.moveCar(level.getVehiclesMap().get('a')!, 'L', 2, false, false);
    level.reset();
    expect(level.getBoard().lines().join('\n')).toBe(initial);
    expect(level.getScore()).toBe(0);
    expect(level.canUndo()).toBe(false);
  });

  it('supports undo and redo', () => {
    const level = fresh();
    level.moveCar(level.getVehiclesMap().get('a')!, 'L', 2, false, false);
    const moved = level.getBoard().toString();
    expect(level.undo()).toBe(true);
    expect(level.getBoard().lines().join('\n')).toBe(BOARD.join('\n'));
    expect(level.redo()).toBe(true);
    expect(level.getBoard().toString()).toBe(moved);
  });
});
