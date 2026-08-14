import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { Direction } from '../engine/types';
import type { CarViewData } from '../store/gameStore';
import { COLORS } from '../utils/theme';
import { CarView } from './CarView';

// Padding of the concrete tabletop frame around the board.
export const BOARD_FRAME_PADDING = 12;
const CONCRETE = '#3f4756';
const ASPHALT = '#353e4c';
const LANE = 'rgba(255,255,255,0.10)';

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

function Chevron({ size, color }: { size: number; color: string }) {
  const t = size * 0.22;
  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: t,
        borderRightWidth: t,
        borderTopWidth: t * 1.4,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
      }}
    />
  );
}

function ExitGate({ x, y, size, dir }: { x: number; y: number; size: number; dir: ExitDir }) {
  const pulse = useSharedValue(0);
  const march = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    march.value = withRepeat(withTiming(size, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [pulse, march]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.25 + pulse.value * 0.4 }));
  const rot = dir === 'up' ? 180 : dir === 'right' ? -90 : dir === 'left' ? 90 : 0;
  const marchStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot}deg` }, { translateY: march.value }],
  }));

  const chevron = size * 0.2;
  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: size * 0.16,
        backgroundColor: 'rgba(34,197,94,0.30)',
        borderWidth: 2,
        borderColor: COLORS.exit,
      }}
    >
      {/* pulsing halo */}
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
      {/* marching arrow flow (rotated so arrows always point out of the lot) */}
      <Animated.View style={[marchStyle, { position: 'absolute', left: 0, top: 0, width: size, height: size * 3 }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: size / 2 - chevron / 2,
              top: i * size - size + size * 0.4,
              width: chevron,
              height: chevron * 1.4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Chevron size={chevron} color="#ECFDF5" />
          </View>
        ))}
      </Animated.View>
      {/* neon barrier outline */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderWidth: 1.5,
          borderColor: COLORS.exitBorder,
          borderRadius: size * 0.16,
        }}
      />
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
      style={[
        styles.tabletop,
        { padding: BOARD_FRAME_PADDING, backgroundColor: CONCRETE, borderRadius: 22 },
      ]}
    >
      <View
        style={{
          width: cols * tileSize,
          height: rows * tileSize,
          backgroundColor: ASPHALT,
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        {/* lighting: soft top highlight + bottom shade for depth */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: rows * tileSize * 0.4, backgroundColor: 'rgba(255,255,255,0.07)' }} pointerEvents="none" />
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: rows * tileSize * 0.4, backgroundColor: 'rgba(0,0,0,0.16)' }} pointerEvents="none" />

        {/* painted lane lines (parking spaces) */}
        {vLines}
        {hLines}

        {/* raised curbs / walls */}
        {walls}

        {/* animated exit gate */}
        {exit && <ExitGate x={exit.c * tileSize} y={exit.r * tileSize} size={tileSize} dir={exit.dir} />}

        {/* inner vignette frame */}
        <View style={[StyleSheet.absoluteFill, { borderWidth: 6, borderColor: 'rgba(0,0,0,0.25)', borderRadius: 10 }]} pointerEvents="none" />

        {/* vehicles (rendered last so they sit above the background) */}
        {cars.map((car) => (
          <CarView key={`${levelKey}-${car.id}`} car={car} tileSize={tileSize} rows={rows} cols={cols} onMove={onMove} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabletop: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
