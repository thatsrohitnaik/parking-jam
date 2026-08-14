import { Level } from './Level';
import type { LevelData } from './types';

// Breadth-first search that returns the minimum number of slide moves needed
// to drive the red car onto the exit, or null if unsolvable / too large.
//
// Each slide (by any distance) counts as one move, matching the game's scoring.
// To stay efficient we mutate a single Level instance per BFS layer: we apply a
// move, record its board key, then undo it, and only rebuild a fresh Level from
// the key when that node is later expanded.
export function minMoves(data: LevelData, maxNodes = 200000): number | null {
  const start = new Level(data);
  if (start.checkStatus()) return 0;

  const keyOf = (lvl: Level) => lvl.getBoard().lines().join('\n');
  const parse = (key: string): Level =>
    new Level({ name: 'x', rows: data.rows, columns: data.columns, board: key.split('\n') });

  const visited = new Set<string>([keyOf(start)]);
  let frontier: string[] = [keyOf(start)];
  let depth = 0;

  while (frontier.length) {
    const next: string[] = [];
    depth++;
    if (depth > 70) return null;

    for (const k of frontier) {
      const lvl = parse(k);
      const vehicles = Array.from(lvl.getVehiclesMap().values());
      for (const v of vehicles) {
        const dirs = v.getOrientation() === 'H' ? (['L', 'R'] as const) : (['U', 'D'] as const);
        for (const dir of dirs) {
          const max = lvl.maxMoveDistance(v, dir, 8);
          for (let d = 1; d <= max; d++) {
            lvl.moveCar(v, dir, d, false, false);
            const childKey = keyOf(lvl);
            const won = lvl.checkStatus();
            if (!visited.has(childKey)) {
              if (won) return depth;
              visited.add(childKey);
              next.push(childKey);
              if (visited.size > maxNodes) return null;
            }
            lvl.undo();
          }
        }
      }
    }
    frontier = next;
  }
  return null;
}
