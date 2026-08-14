import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 1400);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.card} />
      <Text style={styles.title}>Parking Jam</Text>
      <Text style={styles.subtitle}>Free the red car</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    width: 72,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.redCar,
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.subtle,
    fontSize: 16,
  },
});