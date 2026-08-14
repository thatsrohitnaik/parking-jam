import { Level } from './Level';
import type { Direction, LevelData } from './types';

export interface HintMove {
  id: string;
  dir: Direction;
  distance: number;
}

// Returns the first move of a shortest solution from the given board state,
// or null if already solved / unsolvable. Mirrors the BFS in solver.ts but
// records the opening move so we can tell the player what to do.
//
// @param data  Level layout (rows, columns, exit, board). Pass a `board`
//              reflecting the CURRENT positions to hint from the live state.
export function getHintMove(data: LevelData): HintMove | null {
  const start = new Level(data);
  if (start.checkStatus()) return null;

  const keyOf = (lvl: Level) => lvl.getBoard().lines().join('\n');
  const parse = (key: string): Level =>
    new Level({ name: data.name, rows: data.rows, columns: data.columns, board: key.split('\n') });

  const visited = new Set<string>([keyOf(start)]);
  let frontier: { key: string; firstMove: HintMove | null }[] = [
    { key: keyOf(start), firstMove: null },
  ];
  let depth = 0;

  while (frontier.length) {
    const next: typeof frontier = [];
    depth++;
    if (depth > 70) return null;

    for (const node of frontier) {
      const lvl = parse(node.key);
      const vehicles = Array.from(lvl.getVehiclesMap().values());
      for (const v of vehicles) {
        const dirs = v.getOrientation() === 'H' ? (['L', 'R'] as const) : (['U', 'D'] as const);
        for (const dir of dirs) {
          const max = lvl.maxMoveDistance(v, dir, 8);
          for (let d = 1; d <= max; d++) {
            lvl.moveCar(v, dir, d, false, false);
            const childKey = keyOf(lvl);
            const won = lvl.checkStatus();
            const firstMove: HintMove = node.firstMove ?? { id: v.getId(), dir, distance: d };
            if (!visited.has(childKey)) {
              if (won) return firstMove;
              visited.add(childKey);
              next.push({ key: childKey, firstMove });
              if (visited.size > 200000) return null;
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
