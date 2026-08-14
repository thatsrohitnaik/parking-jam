import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  onMove: (id: string, dir: Direction, distance: number) => void;
}

export function Board({ rows, cols, tiles, cars, tileSize, onMove }: BoardProps) {
  return (
    <View
      style={{
        width: cols * tileSize,
        height: rows * tileSize,
        backgroundColor: COLORS.road,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      <View style={styles.grid} pointerEvents="none">
        {tiles.map((line, r) => (
          <View key={r} style={styles.row}>
            {line.split('').map((tile, c) => {
              const isWall = tile === '+';
              const isExit = tile === '@';
              return (
                <View
                  key={c}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    backgroundColor: isWall ? COLORS.wall : isExit ? COLORS.exit : COLORS.road,
                    borderWidth: 0.5,
                    borderColor: isExit ? COLORS.exitBorder : COLORS.roadBorder,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>

      {cars.map((car) => (
        <CarView key={car.id} car={car} tileSize={tileSize} onMove={onMove} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    flexDirection: 'row',
  },
});