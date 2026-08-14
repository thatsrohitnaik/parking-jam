import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { useParkingStore } from '../store/gameStore';
import { COLORS } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const restart = useParkingStore((s) => s.restart);

  const startGame = () => {
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

      <View style={styles.menu}>
        <Button label="Play" onPress={startGame} />
        <Button label="Choose Level" variant="ghost" onPress={() => navigation.navigate('LevelSelect')} />
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
});