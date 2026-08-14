import { create } from 'zustand';
import { Game } from '../engine/Game';
import { Level } from '../engine/Level';
import { LEVELS } from '../engine/levels';
import { getPar } from '../engine/par';
import { loadPersisted, savePersisted, type LevelProgress } from './persistence';
import type { Direction } from '../engine/types';
import type { CarThemeName } from '../utils/theme';

export interface CarViewData {
  id: string;
  x: number;
  y: number;
  length: number;
  horizontal: boolean;
  red: boolean;
}

export interface GameSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  carTheme: CarThemeName;
}

interface ParkingStore {
  game: Game;
  levelNumber: number;
  levelName: string;
  levelScore: number;
  totalScore: number;
  finished: boolean;
  rows: number;
  cols: number;
  tiles: string[];
  cars: CarViewData[];
  canUndo: boolean;
  canRedo: boolean;
  levelCompleted: boolean;
  settings: GameSettings;

  currentPar: number;
  progress: Record<number, LevelProgress>;
  maxUnlocked: number;
  lastResult: { levelNumber: number; moves: number; par: number; stars: number } | null;

  tryMove: (id: string, dir: Direction, distance: number) => number;
  undo: () => void;
  redo: () => void;
  resetLevel: () => void;
  restart: () => void;
  startLevel: (index: number) => void;
  dismissLevelCompleted: () => void;
  retryLast: () => void;
  hydrate: () => void;
  persist: () => void;
  setSettings: (settings: Partial<GameSettings>) => void;
}

function snapshot(game: Game) {
  const level: Level = game.getLevel();
  const cars: CarViewData[] = [];
  level.getVehiclesMap().forEach((car) => {
    const pos = car.getCurrentPos();
    cars.push({
      id: car.getId(),
      x: pos.x,
      y: pos.y,
      length: car.getLength(),
      horizontal: car.getOrientation() === 'H',
      red: car.isRedCar(),
    });
  });
  return {
    levelNumber: game.getLevelNumber(),
    levelName: game.getLevelName(),
    levelScore: game.getLevelScore(),
    totalScore: game.getTotalScore(),
    finished: game.isFinished(),
    rows: level.getBoard().getNRows(),
    cols: level.getBoard().getNColumns(),
    tiles: level.getBoard().lines(),
    cars,
    canUndo: level.canUndo(),
    canRedo: level.canRedo(),
  };
}

export function createDefaultSettings(): GameSettings {
  return { hapticsEnabled: true, soundEnabled: true, carTheme: 'classic' };
}

// 3 stars at/under par, 2 up to 1.5x par, otherwise 1. Always >= 1 on a win.
function computeStars(moves: number, par: number): number {
  if (moves <= par) return 3;
  if (moves <= Math.ceil(par * 1.5)) return 2;
  return 1;
}

const initialGame = new Game();

export const useParkingStore = create<ParkingStore>((set, get) => ({
  game: initialGame,
  ...snapshot(initialGame),
  levelCompleted: false,
  currentPar: getPar(0),
  progress: {},
  maxUnlocked: 0,
  lastResult: null,
  settings: createDefaultSettings(),

  tryMove: (id, dir, distance) => {
    const game = get().game;
    if (game.isFinished()) return 0;
    const car = game.getLevel().getVehiclesMap().get(id);
    if (!car) return 0;
    const before = game.getLevelNumber();
    const completedIndex = before - 1;
    const movesBeforeWin = game.level.getScore();
    const moved = game.moveCar(car, dir, distance);
    if (moved > 0) {
      const won = before !== game.getLevelNumber();
      if (won) {
        const actualMoves = movesBeforeWin + 1;
        const par = getPar(completedIndex);
        const earned = computeStars(actualMoves, par);
        const prev = get().progress[completedIndex];
        set({
          progress: {
            ...get().progress,
            [completedIndex]: {
              stars: prev ? Math.max(prev.stars, earned) : earned,
              bestMoves: prev ? Math.min(prev.bestMoves, actualMoves) : actualMoves,
            },
          },
          maxUnlocked: Math.max(get().maxUnlocked, completedIndex + 1),
          lastResult: { levelNumber: before, moves: actualMoves, par, stars: earned },
        });
        get().persist();
      }
      set((state) => ({
        ...snapshot(game),
        levelCompleted: won && !game.isFinished(),
      }));
    }
    return moved;
  },

  undo: () => {
    const game = get().game;
    if (!game.undo()) return;
    game.getUndoRedoCarId(true);
    set((state) => ({ ...snapshot(game), levelCompleted: false }));
  },

  redo: () => {
    const game = get().game;
    if (!game.redo()) return;
    game.getUndoRedoCarId(false);
    set((state) => ({ ...snapshot(game) }));
  },

  resetLevel: () => {
    const game = get().game;
    game.reset();
    set((state) => ({ ...snapshot(game), levelCompleted: false }));
  },

  restart: () => {
    const game = get().game;
    game.newGame();
    set((state) => ({ ...snapshot(game), levelCompleted: false }));
  },

  startLevel: (index) => {
    const game = new Game();
    game.levelNumber = index + 1;
    game.level = new Level(LEVELS[index]);
    set((state) => ({ game, ...snapshot(game), levelCompleted: false, currentPar: getPar(index) }));
  },

  dismissLevelCompleted: () => set({ levelCompleted: false }),

  retryLast: () => {
    const last = get().lastResult;
    if (!last) return;
    get().startLevel(last.levelNumber - 1);
  },

  hydrate: () => {
    loadPersisted()
      .then((data) => {
        if (!data) return;
        set((state) => ({
          progress: data.progress ?? {},
          maxUnlocked: data.maxUnlocked ?? 0,
          settings: data.settings ? { ...state.settings, ...data.settings } : state.settings,
        }));
      })
      .catch(() => {});
  },

  persist: () => {
    const { progress, maxUnlocked, settings } = get();
    savePersisted({ progress, maxUnlocked, settings });
  },

  setSettings: (next) => {
    set((state) => ({ settings: { ...state.settings, ...next } }));
    get().persist();
  },
}));

useParkingStore.getState().hydrate();