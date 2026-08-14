import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useParkingStore } from '../store/gameStore';
import { COLORS } from '../utils/theme';
import { LEVELS } from '../engine/levels';
import { LevelCard } from '../components/LevelCard';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export default function LevelSelectScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const startLevel = useParkingStore((s) => s.startLevel);
  const progress = useParkingStore((s) => s.progress);
  const maxUnlocked = useParkingStore((s) => s.maxUnlocked);

  const pad = 16;
  const gap = 12;
  const cols = width > 480 ? 4 : 3;
  const cardW = (width - pad * 2 - gap * (cols - 1)) / cols;

  const choose = (index: number) => {
    startLevel(index);
    navigation.navigate('Game');
  };

  const total = LEVELS.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Levels</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={[styles.grid, { paddingHorizontal: pad, gap }]}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const locked = i > maxUnlocked;
          const stars = progress[i]?.stars ?? 0;
          const highlighted = i === maxUnlocked && i < total;
          return (
            <View key={n} style={{ width: cardW }}>
              <LevelCard
                number={n}
                stars={stars}
                locked={locked}
                highlighted={highlighted}
                onPress={() => choose(i)}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: COLORS.text,
    fontSize: 26,
    lineHeight: 28,
    marginTop: -2,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 40,
  },
});
