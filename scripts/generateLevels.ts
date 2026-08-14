import { Level } from '../src/engine/Level';
import type { LevelData } from '../src/engine/types';
import { minMoves } from '../src/engine/solver';
import * as fs from 'fs';
import * as path from 'path';

// Deterministic PRNG so the generated set is reproducible.
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ROWS = 8;
const COLS = 8;
const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function emptyGrid(): string[][] {
  const g: string[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: string[] = [];
    for (let c = 0; c < COLS; c++) {
      const border = r === 0 || c === 0 || r === ROWS - 1 || c === COLS - 1;
      row.push(border ? '+' : ' ');
    }
    g.push(row);
  }
  return g;
}

function placeVehicles(g: string[][], rng: () => number, count: number): boolean {
  let placed = 0;
  let letterIdx = 0;
  let attempts = 0;
  const maxAttempts = count * 50;
  while (placed < count && attempts < maxAttempts) {
    attempts++;
    const horizontal = rng() < 0.5;
    const length = rng() < 0.6 ? 2 : 3;
    const maxR = horizontal ? ROWS - 2 : ROWS - 2 - (length - 1);
    const maxC = horizontal ? COLS - 2 - (length - 1) : COLS - 2;
    const r = 1 + Math.floor(rng() * maxR);
    const c = 1 + Math.floor(rng() * maxC);

    let free = true;
    for (let i = 0; i < length; i++) {
      const rr = horizontal ? r : r + i;
      const cc = horizontal ? c + i : c;
      if (g[rr][cc] !== ' ') {
        free = false;
        break;
      }
    }
    if (!free) continue;

    const letter = LETTERS[letterIdx % LETTERS.length];
    letterIdx++;
    for (let i = 0; i < length; i++) {
      const rr = horizontal ? r : r + i;
      const cc = horizontal ? c + i : c;
      g[rr][cc] = letter;
    }
    placed++;
  }
  return placed === count;
}

function scramble(level: Level, k: number, rng: () => number): void {
  for (let i = 0; i < k; i++) {
    const vehicles = Array.from(level.getVehiclesMap().values()).filter((v) => !v.isRedCar());
    if (vehicles.length === 0) break;
    const v = vehicles[Math.floor(rng() * vehicles.length)];
    const dirs = v.getOrientation() === 'H' ? (['L', 'R'] as const) : (['U', 'D'] as const);
    const dir = dirs[Math.floor(rng() * 2)];
    const max = level.maxMoveDistance(v, dir, 8);
    if (max <= 0) continue;
    const d = 1 + Math.floor(rng() * max);
    level.moveCar(v, dir, d, false, false);
  }
}

function generateOne(index: number, rng: () => number): { data: LevelData; min: number } | null {
  const k = 5 + Math.floor(index * 0.45);
  const carCount = Math.min(4 + Math.floor(index / 9), 10);
  const targetLow = Math.floor(index / 5) + 1;
  let best: { data: LevelData; min: number } | null = null;

  for (let attempt = 0; attempt < 30; attempt++) {
    const redCol = 1 + Math.floor(rng() * (COLS - 2));
    const g = emptyGrid();
    g[ROWS - 1][redCol] = '@';
    g[1][redCol] = '*';
    g[2][redCol] = '*';

    if (!placeVehicles(g, rng, carCount)) continue;
    const data: LevelData = { name: 'tmp', rows: ROWS, columns: COLS, board: g.map((r) => r.join('')) };

    let level: Level;
    try {
      level = new Level(data);
    } catch {
      continue;
    }
    if (level.checkStatus()) continue;

    scramble(level, k, rng);
    const finalData = level.toData();
    if (level.checkStatus()) continue;

    const min = minMoves(finalData, 30000);
    if (min === null) continue;

    if (min >= targetLow) return { data: finalData, min };
    if (!best || min > best.min) best = { data: finalData, min };
  }
  return best;
}

function main(): void {
  const rng = mulberry32(20240814);
  const generated: { data: LevelData; min: number }[] = [];

  for (let i = 0; i < 100; i++) {
    const lvl = generateOne(i, rng);
    if (!lvl) {
      console.error(`Failed to generate level ${i + 1}`);
      process.exit(1);
    }
    generated.push(lvl);
    console.error(`Level ${i + 1}: min moves = ${lvl.min}`);
  }

  // Sort by solution length so difficulty increases monotonically.
  generated.sort((a, b) => a.min - b.min);

  const levels: LevelData[] = generated.map((g, i) => ({
    name: `Level ${i + 1}`,
    rows: g.data.rows,
    columns: g.data.columns,
    board: g.data.board,
  }));

  const minMovesList = generated.map((g) => g.min);
  const out =
    `import type { LevelData } from './types';\n\n` +
    `// Auto-generated: 100 levels, verified solvable, ordered by increasing\n` +
    `// minimum number of moves (difficulty). Do not edit by hand; regenerate\n` +
    `// with scripts/generateLevels.ts.\n` +
    `export const LEVELS: LevelData[] = ${JSON.stringify(levels, null, 2)};\n`;

  const target = path.resolve(__dirname, '../src/engine/levels.ts');
  fs.writeFileSync(target, out);
  console.log(`Wrote ${levels.length} levels.`);
  console.log(`Min moves range: ${Math.min(...minMovesList)} .. ${Math.max(...minMovesList)}`);
}

main();
