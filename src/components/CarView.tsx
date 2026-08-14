import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { Direction } from '../engine/types';
import type { CarViewData } from '../store/gameStore';
import { COLORS, carColor } from '../utils/theme';

interface CarViewProps {
  car: CarViewData;
  tileSize: number;
  onMove: (id: string, dir: Direction, distance: number) => void;
}

export function CarView({ car, tileSize, onMove }: CarViewProps) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const commit = useCallback(
    (dir: Direction, distance: number) => {
      if (distance > 0) onMove(car.id, dir, distance);
    },
    [car.id, onMove],
  );

  const pan = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onChange((e) => {
      if (car.horizontal) {
        tx.value += e.changeX;
        ty.value = 0;
      } else {
        ty.value += e.changeY;
        tx.value = 0;
      }
    })
    .onEnd(() => {
      const distance = car.horizontal
        ? Math.round(Math.abs(tx.value) / tileSize)
        : Math.round(Math.abs(ty.value) / tileSize);
      const dir: Direction = car.horizontal
        ? tx.value >= 0
          ? 'R'
          : 'L'
        : ty.value >= 0
          ? 'D'
          : 'U';
      tx.value = 0;
      ty.value = 0;
      if (distance > 0) {
        runOnJS(commit)(dir, distance);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const width = car.horizontal ? car.length * tileSize : tileSize;
  const height = car.horizontal ? tileSize : car.length * tileSize;
  const backgroundColor = car.red ? COLORS.redCar : carColor(car.id);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.car,
          {
            left: car.y * tileSize,
            top: car.x * tileSize,
            width,
            height,
            backgroundColor,
          },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  car: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});