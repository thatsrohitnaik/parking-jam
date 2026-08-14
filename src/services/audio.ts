import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useParkingStore } from '../store/gameStore';

let player: AudioPlayer | null = null;
let musicActive = false;

function getPlayer(): AudioPlayer {
  if (!player) {
    // Local asset bundled with the app (see assets/bg-music.mp3).
    player = createAudioPlayer(require('../../assets/bg-music.mp3'));
    player.loop = true;
  }
  return player;
}

// Starts the looping background track. Safe to call repeatedly (no restart)
// and a no-op while sound is disabled. Must be triggered from a user gesture
// on web due to browser autoplay policies.
export function startBackgroundMusic() {
  if (musicActive) return;
  if (!useParkingStore.getState().settings.soundEnabled) return;
  try {
    const p = getPlayer();
    p.loop = true;
    p.play();
    musicActive = true;
  } catch {
    // Autoplay may be blocked until a gesture occurs; ignore.
  }
}

export function stopBackgroundMusic() {
  if (!musicActive) return;
  try {
    player?.pause();
  } catch {
    // ignore
  }
  musicActive = false;
}

// React to the in-app sound toggle (used by Settings) so music starts/stops
// without the screens needing to know about it.
useParkingStore.subscribe((state, prev) => {
  if (state.settings.soundEnabled !== prev.settings.soundEnabled) {
    if (state.settings.soundEnabled) startBackgroundMusic();
    else stopBackgroundMusic();
  }
});
