import { minMoves } from './solver';
import { LEVELS } from './levels';

const cache = new Map<number, number>();

// Minimum number of slide-moves to solve a level (its "par"). Cached so it is
// only computed once per level for the whole session.
export function getPar(index: number): number {
  const cached = cache.get(index);
  if (cached !== undefined) return cached;
  const result = minMoves(LEVELS[index]);
  const par = result ?? 99;
  cache.set(index, par);
  return par;
}
