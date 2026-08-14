import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useParkingStore } from '../store/gameStore';
import { startBackgroundMusic } from '../services/audio';
import { CAR_THEME_ORDER, CAR_THEMES, COLORS, getCarTheme } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const restart = useParkingStore((s) => s.restart);
  const carTheme = useParkingStore((s) => s.settings.carTheme);
  const setSettings = useParkingStore((s) => s.setSettings);

  const startGame = () => {
    startBackgroundMusic();
    restart();
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parking Jam</Text>
        <Text style={styles.subtitle}>
          Slide the cars around to clear a path and drive the red car out of the parking lot.
        </Text>
      </View>

      <View style={styles.themeRow}>
        <Text style={styles.themeLabel}>Car style</Text>
        <View style={styles.themeSwatches}>
          {CAR_THEME_ORDER.map((name) => {
            const theme = getCarTheme(name);
            const active = name === carTheme;
            return (
              <Pressable
                key={name}
                onPress={() => setSettings({ carTheme: name })}
                style={({ pressed }) => [
                  styles.swatch,
                  active && styles.swatchActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.swatchCar, { backgroundColor: theme.red }]} />
                <Text style={[styles.swatchText, active && styles.swatchTextActive]}>
                  {CAR_THEMES[name].label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.menu}>
        <Button label="Play" onPress={startGame} />
        <Button label="Choose Level" variant="ghost" onPress={() => { startBackgroundMusic(); navigation.navigate('LevelSelect'); }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    gap: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.subtle,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  menu: {
    gap: 14,
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
  },
  themeRow: {
    marginBottom: 28,
    alignItems: 'center',
    gap: 12,
  },
  themeLabel: {
    color: COLORS.subtle,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  themeSwatches: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: COLORS.card,
  },
  swatchActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#243049',
  },
  swatchCar: {
    width: 34,
    height: 20,
    borderRadius: 5,
  },
  swatchText: {
    color: COLORS.subtle,
    fontSize: 12,
    fontWeight: '600',
  },
  swatchTextActive: {
    color: COLORS.text,
  },
});