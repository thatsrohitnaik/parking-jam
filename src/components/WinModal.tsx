import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../utils/theme';
import { Button } from './Button';
import { AdBanner } from './AdBanner';

interface WinModalProps {
  levelNumber: number;
  moves: number;
  par: number;
  stars: number;
  onNext: () => void;
  onRetry: () => void;
  onHome: () => void;
}

const CONFETTI_COLORS = ['#FBBF24', '#22C55E', '#3B82F6', '#EC4899', '#F97316'];

export function WinModal({ levelNumber, moves, par, stars, onNext, onRetry, onHome }: WinModalProps) {
  const cardScale = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withSpring(1, { damping: 16, stiffness: 220 });
  }, [cardScale]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View style={styles.backdrop}>
      <Confetti />
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.title}>Level {levelNumber} Complete!</Text>
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Star key={i} filled={i < stars} delay={250 + i * 180} />
          ))}
        </View>
        <Text style={styles.moves}>
          Moves {moves} · Par {par}
        </Text>
        <AdBanner />
        <Button label="Next Level" onPress={onNext} style={styles.full} />
        <View style={styles.row}>
          <Button label="Retry" variant="bevelSecondary" onPress={onRetry} style={styles.flex} />
          <Button label="Home" variant="bevelSecondary" onPress={onHome} style={styles.flex} />
        </View>
      </Animated.View>
    </View>
  );
}

function Star({ filled, delay }: { filled: boolean; delay: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 260 }));
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: v.value }],
    opacity: v.value,
  }));
  return (
    <Animated.Text style={[styles.star, filled ? styles.starFilled : styles.starEmpty, style]}>
      ★
    </Animated.Text>
  );
}

function Confetti() {
  return (
    <View style={styles.confettiLayer} pointerEvents="none">
      {Array.from({ length: 16 }, (_, i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </View>
  );
}

function ConfettiPiece({ index }: { index: number }) {
  const t = useSharedValue(0);
  const rot = useSharedValue(0);
  const startX = ((index * 53) % 260) - 130;

  useEffect(() => {
    const delay = (index * 110) % 900;
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false));
    rot.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1000, easing: Easing.linear }), -1, false));
  }, [t, rot]);

  const style = useAnimatedStyle(() => ({
    left: startX + 130,
    transform: [{ translateY: -40 + t.value * 460 }, { rotate: `${rot.value * 360}deg` }],
    opacity: t.value < 0.85 ? 0.9 : (1 - t.value) * 0.9,
  }));

  return (
    <Animated.View
      style={[styles.confetti, { backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2,6,23,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 10,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  star: {
    fontSize: 40,
  },
  starFilled: {
    color: COLORS.star,
  },
  starEmpty: {
    color: 'rgba(148,163,184,0.3)',
  },
  moves: {
    color: COLORS.subtle,
    fontSize: 14,
    fontWeight: '600',
  },
  full: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'stretch',
  },
  flex: {
    flex: 1,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    width: 9,
    height: 9,
    borderRadius: 2,
  },
});
