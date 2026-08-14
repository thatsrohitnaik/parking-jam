import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { Direction } from '../engine/types';
import { useParkingStore } from '../store/gameStore';
import type { CarViewData } from '../store/gameStore';
import { carBodyColor, getCarTheme } from '../utils/theme';

const SPRING = { damping: 22, stiffness: 220, mass: 1 } as const;

interface CarViewProps {
  car: CarViewData;
  tileSize: number;
  // Returns the number of cells actually moved (0 if blocked).
  onMove: (id: string, dir: Direction, distance: number) => number;
}

export function CarView({ car, tileSize, onMove }: CarViewProps) {
  // `base` is the animated grid position (px); `drag` is the live finger offset.
  // Rendered position = base + drag, so both can be sprung independently.
  const baseX = useSharedValue(car.y * tileSize);
  const baseY = useSharedValue(car.x * tileSize);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const draggingRef = useRef(false);
  const dataRef = useRef({ car, tileSize, onMove });
  dataRef.current = { car, tileSize, onMove };

  const carTheme = useParkingStore((s) => s.settings.carTheme);
  const theme = getCarTheme(carTheme);

  // Pulsing glow for the target (red) car.
  const glow = useSharedValue(0);
  useEffect(() => {
    if (!car.red) return;
    glow.value = withRepeat(withTiming(1, { duration: 1100 }), -1, true);
    return () => {
      glow.value = 0;
    };
  }, [car.red, glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: car.red ? 0.25 + glow.value * 0.4 : 0,
  }), [car.red]);

  // Keep the animated base in sync with the store (animates moves, undo,
  // redo and reset). Skipped mid-drag so the finger owns the offset.
  useEffect(() => {
    if (draggingRef.current) return;
    baseX.value = withSpring(car.y * tileSize, SPRING);
    baseY.value = withSpring(car.x * tileSize, SPRING);
  }, [car.x, car.y, tileSize, baseX, baseY]);

  const commit = useCallback(
    (id: string, dir: Direction, distance: number) => {
      onMove(id, dir, distance);
      // Return the finger to the grid; the base springs to its new cell via
      // the effect above, so the car slides instead of teleporting.
      dragX.value = withSpring(0, SPRING);
      dragY.value = withSpring(0, SPRING);
      draggingRef.current = false;
    },
    [dragX, dragY],
  );

  const pan = Gesture.Pan()
    .minDistance(0)
    .maxPointers(1)
    .onStart(() => {
      draggingRef.current = true;
    })
    .onChange((e) => {
      const { car: c, tileSize: t } = dataRef.current;
      if (c.horizontal) {
        dragX.value += e.changeX;
        dragY.value = 0;
      } else {
        dragY.value += e.changeY;
        dragX.value = 0;
      }
      void t;
    })
    .onEnd(() => {
      const { car: c, tileSize: t } = dataRef.current;
      const raw = c.horizontal ? dragX.value : dragY.value;
      const distance = Math.round(Math.abs(raw) / t);
      if (distance === 0) {
        dragX.value = withSpring(0, SPRING);
        dragY.value = withSpring(0, SPRING);
        draggingRef.current = false;
        return;
      }
      const dir: Direction = c.horizontal
        ? dragX.value >= 0
          ? 'R'
          : 'L'
        : dragY.value >= 0
          ? 'D'
          : 'U';
      runOnJS(commit)(c.id, dir, distance);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: baseX.value + dragX.value },
      { translateY: baseY.value + dragY.value },
    ],
  }));

  const width = car.horizontal ? car.length * tileSize : tileSize;
  const height = car.horizontal ? tileSize : car.length * tileSize;
  const backgroundColor = carBodyColor(car.id, theme);

  // --- decoration (scales with tileSize; orientation-aware) ---
  const isH = car.horizontal;
  const bodyR = tileSize * 0.2;
  const wheel = Math.max(7, tileSize * 0.26);
  const hub = wheel * 0.46;

  const cabinLong = car.length >= 3 ? tileSize * 0.52 : tileSize * 0.62;
  const cabinCross = isH ? height * 0.5 : width * 0.5;
  const cabinStyle: any = isH
    ? {
        width: cabinLong,
        height: cabinCross,
        left: (width - cabinLong) / 2,
        top: (height - cabinCross) / 2,
        borderRadius: bodyR * 0.7,
      }
    : {
        width: cabinCross,
        height: cabinLong,
        left: (width - cabinCross) / 2,
        top: (height - cabinLong) / 2,
        borderRadius: bodyR * 0.7,
      };

  const sheenStyle: any = isH
    ? { top: 0, left: 0, right: 0, height: height * 0.3 }
    : { top: 0, left: 0, bottom: 0, width: width * 0.3 };
  const shadeStyle: any = isH
    ? { bottom: 0, left: 0, right: 0, height: height * 0.22 }
    : { bottom: 0, right: 0, top: 0, width: width * 0.22 };

  // wheels with hubcaps
  const wheelCenters = [0.26, 0.74];
  const wheels = wheelCenters.map((p, i) => {
    if (isH) {
      const cx = width * p;
      return (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: wheel * 1.5,
            height: wheel,
            borderRadius: wheel / 2,
            backgroundColor: theme.wheel,
            left: cx - wheel * 0.75,
            top: height - wheel * 0.72,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View style={{ width: hub, height: hub, borderRadius: hub / 2, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        </View>
      );
    }
    const cy = height * p;
    return (
      <View
        key={i}
        style={{
          position: 'absolute',
          width: wheel,
          height: wheel * 1.5,
          borderRadius: wheel / 2,
          backgroundColor: theme.wheel,
          left: width - wheel * 0.72,
          top: cy - wheel * 0.75,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: hub, height: hub, borderRadius: hub / 2, backgroundColor: 'rgba(255,255,255,0.45)' }} />
      </View>
    );
  });

  // headlights (amber, front) + taillights (red, rear)
  const lightW = Math.max(3, tileSize * 0.07);
  const lightLen = Math.max(6, tileSize * 0.22);
  const headlights = isH
    ? [
        <View key="h1" style={{ position: 'absolute', right: 1, top: height * 0.24, width: lightW, height: lightLen, borderRadius: 1, backgroundColor: '#FDE047' }} />,
        <View key="h2" style={{ position: 'absolute', right: 1, top: height * 0.62, width: lightW, height: lightLen, borderRadius: 1, backgroundColor: '#FDE047' }} />,
      ]
    : [
        <View key="h1" style={{ position: 'absolute', bottom: 1, left: width * 0.24, width: lightLen, height: lightW, borderRadius: 1, backgroundColor: '#FDE047' }} />,
        <View key="h2" style={{ position: 'absolute', bottom: 1, left: width * 0.62, width: lightLen, height: lightW, borderRadius: 1, backgroundColor: '#FDE047' }} />,
      ];
  const taillights = isH
    ? [
        <View key="t1" style={{ position: 'absolute', left: 1, top: height * 0.24, width: lightW, height: lightLen, borderRadius: 1, backgroundColor: '#DC2626' }} />,
        <View key="t2" style={{ position: 'absolute', left: 1, top: height * 0.62, width: lightW, height: lightLen, borderRadius: 1, backgroundColor: '#DC2626' }} />,
      ]
    : [
        <View key="t1" style={{ position: 'absolute', top: 1, left: width * 0.24, width: lightLen, height: lightW, borderRadius: 1, backgroundColor: '#DC2626' }} />,
        <View key="t2" style={{ position: 'absolute', top: 1, left: width * 0.62, width: lightLen, height: lightW, borderRadius: 1, backgroundColor: '#DC2626' }} />,
      ];

  const trim = car.length >= 3
    ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: bodyR,
              borderWidth: 2,
              borderColor: theme.accent,
              opacity: 0.45,
            },
          ]}
        />
      )
    : null;

  const glowPad = tileSize * 0.16;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.wrap, { width, height }, animatedStyle]}>
        {/* grounded drop shadow so the vehicle floats above the asphalt */}
        <View style={[styles.shadow, { width, height, borderRadius: bodyR, top: height * 0.06 }]} />
        {car.red && (
          <Animated.View
            style={[
              styles.glow,
              {
                left: -glowPad,
                top: -glowPad,
                width: width + glowPad * 2,
                height: height + glowPad * 2,
                borderRadius: bodyR + glowPad,
                backgroundColor: theme.red,
              },
              glowStyle,
            ]}
          />
        )}
        <View
          style={[
            styles.car,
            { width, height, backgroundColor, borderRadius: bodyR, overflow: 'hidden' },
          ]}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.highlight }, sheenStyle]} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.18)' }, shadeStyle]} />
          {trim}
          <View style={[cabinStyle, { backgroundColor: theme.glass }]} />
          {headlights}
          {taillights}
          {wheels}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  shadow: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.42)',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glow: {
    position: 'absolute',
  },
  car: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.28)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
