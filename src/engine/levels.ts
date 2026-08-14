import type { LevelData } from './types';

// Easy starter levels. All 8x8 with the classic rules: ' ' = road, '+' = wall,
// '@' = exit, '*' = red car cells, a-z = other vehicles.
// Each level is solver-verified as solvable with a low move count:
//   Level 1 (1 move) -> through Level 5 (7 moves).
export const LEVELS: LevelData[] = [
  {
    name: 'Level 1',
    rows: 8,
    columns: 8,
    board: [
      '++++++++',
      '+      +',
      '+   *  +',
      '+   *  +',
      '+      +',
      '+      +',
      '+      +',
      '++++@+++',
    ],
  },
  {
    name: 'Level 2',
    rows: 8,
    columns: 8,
    board: [
      '++++++++',
      '+      +',
      '+   *  +',
      '+   *  +',
      '+   aa +',
      '+      +',
      '+      +',
      '++++@+++',
    ],
  },
  {
    name: 'Level 3',
    rows: 8,
    columns: 8,
    board: [
      '++++++++',
      '+      +',
      '+   *  +',
      '+   *  +',
      '+  aa  +',
      '+      +',
      '+  cc  +',
      '++++@+++',
    ],
  },
  {
    name: 'Level 4',
    rows: 8,
    columns: 8,
    board: [
      '++++++++',
      '+      +',
      '+   *  +',
      '+   *  +',
      '+   aa +',
      '+   bb +',
      '+   cc +',
      '++++@+++',
    ],
  },
  {
    name: 'Level 5',
    rows: 8,
    columns: 8,
    board: [
      '++++++++',
      '+      +',
      '+  *   +',
      '+  *   +',
      '+ aa   +',
      '+ bbb  +',
      '+ cc   +',
      '+++@++++',
    ],
  },
];