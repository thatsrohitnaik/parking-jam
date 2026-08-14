import { create } from 'zustand';
import { Game } from '../engine/Game';
import { Level } from '../engine/Level';
import { LEVELS } from '../engine/levels';
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

  tryMove: (id: string, dir: Direction, distance: number) => number;
  undo: () => void;
  redo: () => void;
  resetLevel: () => void;
  restart: () => void;
  startLevel: (index: number) => void;
  dismissLevelCompleted: () => void;
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

const initialGame = new Game();

export const useParkingStore = create<ParkingStore>((set, get) => ({
  game: initialGame,
  ...snapshot(initialGame),
  levelCompleted: false,
  settings: createDefaultSettings(),

  tryMove: (id, dir, distance) => {
    const game = get().game;
    if (game.isFinished()) return 0;
    const car = game.getLevel().getVehiclesMap().get(id);
    if (!car) return 0;
    const before = game.getLevelNumber();
    const moved = game.moveCar(car, dir, distance);
    if (moved > 0) {
      set((state) => ({
        ...snapshot(game),
        levelCompleted: before !== game.getLevelNumber() && !game.isFinished(),
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
    set((state) => ({ game, ...snapshot(game), levelCompleted: false }));
  },

  dismissLevelCompleted: () => set({ levelCompleted: false }),

  setSettings: (next) =>
    set((state) => ({ settings: { ...state.settings, ...next } })),
}));