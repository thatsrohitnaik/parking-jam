import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useParkingStore } from '../store/gameStore';
import { COLORS } from '../utils/theme';
import { LEVELS } from '../engine/levels';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

export default function LevelSelectScreen({ navigation }: Props) {
  const startLevel = useParkingStore((s) => s.startLevel);

  const choose = (index: number) => {
    startLevel(index);
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Level</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {Array.from({ length: LEVELS.length }, (_, i) => i + 1).map((n) => (
          <Pressable
            key={n}
            onPress={() => choose(n - 1)}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{n}</Text>
            </View>
            <Text style={styles.cardLabel}>Level {n}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  list: {
    gap: 14,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  cardLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});