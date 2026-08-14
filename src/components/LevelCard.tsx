import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/theme';

interface LevelCardProps {
  number: number;
  stars: number; // 0..3 (0 = not yet earned)
  locked: boolean;
  highlighted: boolean;
  onPress: () => void;
}

export function LevelCard({ number, stars, locked, highlighted, onPress }: LevelCardProps) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      style={({ pressed }) => [
        styles.card,
        highlighted && styles.cardHighlighted,
        locked && styles.cardLocked,
        pressed && !locked && styles.cardPressed,
      ]}
    >
      <Text style={[styles.number, locked && styles.numberLocked]}>{number}</Text>
      <View style={styles.stars}>
        {[0, 1, 2].map((i) => (
          <Text
            key={i}
            style={[styles.star, i < stars ? styles.starFilled : styles.starEmpty]}
          >
            ★
          </Text>
        ))}
      </View>
      {locked && <Text style={styles.lock}>🔒</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardHighlighted: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  cardLocked: {
    opacity: 0.55,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  number: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
  },
  numberLocked: {
    color: COLORS.subtle,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 12,
  },
  starFilled: {
    color: COLORS.star,
  },
  starEmpty: {
    color: 'rgba(148,163,184,0.35)',
  },
  lock: {
    position: 'absolute',
    fontSize: 20,
  },
});
