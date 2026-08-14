import { useCallback } from 'react';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useParkingStore } from '../store/gameStore';

export function useHaptics() {
  const hapticsEnabled = useParkingStore((s) => s.settings.hapticsEnabled);

  const light = useCallback(() => {
    if (hapticsEnabled) {
      impactAsync(ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [hapticsEnabled]);

  const success = useCallback(() => {
    if (hapticsEnabled) {
      impactAsync(ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [hapticsEnabled]);

  const error = useCallback(() => {
    if (hapticsEnabled) {
      impactAsync(ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  }, [hapticsEnabled]);

  return { light, success, error };
}