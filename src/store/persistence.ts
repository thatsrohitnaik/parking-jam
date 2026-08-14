import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameSettings } from './gameStore';

export interface LevelProgress {
  stars: number;
  bestMoves: number;
}

export interface PersistedState {
  progress: Record<number, LevelProgress>;
  maxUnlocked: number;
  hints: number;
  settings: GameSettings;
}

const KEY = 'parkingjam.save.v1';

export async function loadPersisted(): Promise<PersistedState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      progress: parsed.progress ?? {},
      maxUnlocked: parsed.maxUnlocked ?? 0,
      hints: parsed.hints ?? 0,
      settings: parsed.settings as GameSettings,
    };
  } catch {
    return null;
  }
}

export async function savePersisted(state: PersistedState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage is best-effort; ignore failures (e.g. web private mode).
  }
}
