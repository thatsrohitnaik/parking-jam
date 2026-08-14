import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

export function WinModal({ levelNumber, moves, par, stars, onNext, onRetry, onHome }: WinModalProps) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Level {levelNumber} Complete!</Text>
        <View style={styles.starsRow}>
          {[0, 1, 2].map((i) => (
            <Text
              key={i}
              style={[styles.star, i < stars ? styles.starFilled : styles.starEmpty]}
            >
              ★
            </Text>
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
      </View>
    </View>
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
});
