import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/theme';
import { Button } from './Button';
import { AdBanner } from './AdBanner';

interface HintModalProps {
  onReward: () => void;
  onClose: () => void;
}

export function HintModal({ onReward, onClose }: HintModalProps) {
  const [count, setCount] = useState(3);
  const rewarded = useRef(false);

  useEffect(() => {
    if (count <= 0) {
      if (!rewarded.current) {
        rewarded.current = true;
        onReward();
      }
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onReward]);

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Get a Hint</Text>
        <Text style={styles.sub}>Watch the ad, then we'll show you the next move.</Text>
        <AdBanner />
        <Text style={styles.count}>{count > 0 ? `Reward in ${count}…` : 'Reward!'}</Text>
        <Button label="Cancel" variant="bevelSecondary" onPress={onClose} style={styles.full} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
  sub: {
    color: COLORS.subtle,
    fontSize: 14,
    textAlign: 'center',
  },
  count: {
    color: COLORS.star,
    fontSize: 16,
    fontWeight: '700',
  },
  full: {
    alignSelf: 'stretch',
  },
});
