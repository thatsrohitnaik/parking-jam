import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { Direction } from '../engine/types';
import type { CarViewData } from '../store/gameStore';
import { COLORS } from '../utils/theme';
import { CarView } from './CarView';

interface BoardProps {
  rows: number;
  cols: number;
  tiles: string[];
  cars: CarViewData[];
  tileSize: number;
  levelKey?: number;
  onMove: (id: string, dir: Direction, distance: number) => number;
}

type ExitDir = 'up' | 'down' | 'left' | 'right';

function findExit(tiles: string[], rows: number, cols: number): { r: number; c: number; dir: ExitDir } | null {
  for (let r = 0; r < rows; r++) {
    const c = tiles[r].indexOf('@');
    if (c >= 0) {
      const dir: ExitDir =
        r === rows - 1 ? 'down' : r === 0 ? 'up' : c === cols - 1 ? 'right' : 'left';
      return { r, c, dir };
    }
  }
  return null;
}

const LANE = 'rgba(51,65,85,0.18)';

function ExitGate({ x, y, size, dir }: { x: number; y: number; size: number; dir: ExitDir }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + pulse.value * 0.4,
  }));

  const rot = dir === 'up' ? 180 : dir === 'right' ? -90 : dir === 'left' ? 90 : 0;
  const tri = size * 0.2;

  return (
    <View style={{ position: 'absolute', left: x, top: y, width: size, height: size, pointerEvents: 'none' }}>
      {/* halo glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: -size * 0.12,
            top: -size * 0.12,
            width: size * 1.24,
            height: size * 1.24,
            borderRadius: size * 0.3,
            backgroundColor: COLORS.exit,
          },
          pulseStyle,
        ]}
      />
      {/* solid gate base */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          backgroundColor: COLORS.exit,
          borderWidth: 1.5,
          borderColor: COLORS.exitBorder,
          borderRadius: size * 0.16,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: tri,
            borderRightWidth: tri,
            borderTopWidth: tri * 1.4,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: '#ECFDF5',
            transform: [{ rotate: `${rot}deg` }],
          }}
        />
      </View>
    </View>
  );
}

export function Board({ rows, cols, tiles, cars, tileSize, levelKey = 0, onMove }: BoardProps) {
  const exit = findExit(tiles, rows, cols);

  const vLines: React.ReactNode[] = [];
  for (let c = 1; c < cols; c++) {
    vLines.push(
      <View
        key={`v${c}`}
        style={{ position: 'absolute', left: c * tileSize, top: 0, width: 1.5, height: rows * tileSize, backgroundColor: LANE }}
      />,
    );
  }
  const hLines: React.ReactNode[] = [];
  for (let r = 1; r < rows; r++) {
    hLines.push(
      <View
        key={`h${r}`}
        style={{ position: 'absolute', top: r * tileSize, left: 0, height: 1.5, width: cols * tileSize, backgroundColor: LANE }}
      />,
    );
  }

  const walls: React.ReactNode[] = [];
  tiles.forEach((line, r) => {
    line.split('').forEach((tile, c) => {
      if (tile === '+') {
        walls.push(
          <View
            key={`w${r}-${c}`}
            style={{
              position: 'absolute',
              left: c * tileSize,
              top: r * tileSize,
              width: tileSize,
              height: tileSize,
              backgroundColor: COLORS.wall,
            }}
          />,
        );
      }
    });
  });

  return (
    <View
      style={{
        width: cols * tileSize,
        height: rows * tileSize,
        backgroundColor: COLORS.road,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      {/* lighting: soft top highlight + bottom shade for depth */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: rows * tileSize * 0.4, backgroundColor: 'rgba(255,255,255,0.08)' }} pointerEvents="none" />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: rows * tileSize * 0.4, backgroundColor: 'rgba(15,23,42,0.10)' }} pointerEvents="none" />

      {/* painted lane lines (parking spaces) */}
      {vLines}
      {hLines}

      {/* raised curbs / walls */}
      {walls}

      {/* animated exit gate */}
      {exit && <ExitGate x={exit.c * tileSize} y={exit.r * tileSize} size={tileSize} dir={exit.dir} />}

      {/* inner vignette frame */}
      <View style={[StyleSheet.absoluteFill, { borderWidth: 6, borderColor: 'rgba(0,0,0,0.22)', borderRadius: 10 }]} pointerEvents="none" />

      {/* vehicles */}
      {cars.map((car) => (
        <CarView key={`${levelKey}-${car.id}`} car={car} tileSize={tileSize} onMove={onMove} />
      ))}
    </View>
  );
}
