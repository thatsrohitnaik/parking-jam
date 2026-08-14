import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Board } from '../components/Board';
import { Button } from '../components/Button';
import { useHaptics } from '../hooks/useHaptics';
import { useParkingStore } from '../store/gameStore';
import type { Direction } from '../engine/types';
import { COLORS } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export default function GameScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const levelName = useParkingStore((s) => s.levelName);
  const levelNumber = useParkingStore((s) => s.levelNumber);
  const levelScore = useParkingStore((s) => s.levelScore);
  const totalScore = useParkingStore((s) => s.totalScore);
  const rows = useParkingStore((s) => s.rows);
  const cols = useParkingStore((s) => s.cols);
  const tiles = useParkingStore((s) => s.tiles);
  const cars = useParkingStore((s) => s.cars);
  const canUndo = useParkingStore((s) => s.canUndo);
  const canRedo = useParkingStore((s) => s.canRedo);
  const finished = useParkingStore((s) => s.finished);
  const levelCompleted = useParkingStore((s) => s.levelCompleted);

  const tryMove = useParkingStore((s) => s.tryMove);
  const undo = useParkingStore((s) => s.undo);
  const redo = useParkingStore((s) => s.redo);
  const resetLevel = useParkingStore((s) => s.resetLevel);
  const restart = useParkingStore((s) => s.restart);
  const dismissLevelCompleted = useParkingStore((s) => s.dismissLevelCompleted);

  const { success } = useHaptics();

  const tileSize = Math.floor((width - 24) / cols);

  const onMove = useCallback(
    (id: string, dir: Direction, distance: number) => {
      if (tryMove(id, dir, distance)) {
        success();
      }
    },
    [tryMove, success],
  );

  const completedLevel = levelNumber - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.levelName}>{levelName}</Text>
          <Text style={styles.stats}>
            Moves {levelScore} · Total {totalScore}
          </Text>
        </View>
        <View style={styles.back} />
      </View>

      <View style={styles.boardArea}>
        <Board rows={rows} cols={cols} tiles={tiles} cars={cars} tileSize={tileSize} onMove={onMove} />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Undo" variant="ghost" style={styles.control} disabled={!canUndo} onPress={undo} />
        <Button label="Reset" variant="ghost" style={styles.control} onPress={resetLevel} />
        <Button label="Redo" variant="ghost" style={styles.control} disabled={!canRedo} onPress={redo} />
      </View>

      {levelCompleted && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.winBadge} />
            <Text style={styles.modalTitle}>Level {completedLevel} Complete!</Text>
            <Text style={styles.modalText}>The red car escaped. On to the next one.</Text>
            <Button label="Keep Going" onPress={dismissLevelCompleted} style={styles.modalButton} />
          </View>
        </View>
      )}

      {finished && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.winBadge} />
            <Text style={styles.modalTitle}>Parking Cleared!</Text>
            <Text style={styles.modalText}>You freed the red car in every lot.</Text>
            <Text style={styles.finalScore}>{totalScore} moves</Text>
            <Button
              label="Play Again"
              onPress={() => {
                restart();
                navigation.goBack();
                navigation.navigate('Game');
              }}
              style={styles.modalButton}
            />
            <Button label="Choose Level" variant="ghost" onPress={() => navigation.navigate('LevelSelect')} style={styles.modalButton} />
          </View>
        </View>
      )}
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
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  levelName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  stats: {
    color: COLORS.subtle,
    fontSize: 13,
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  control: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    elevation: 8,
  },
  modal: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  winBadge: {
    width: 44,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.redCar,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalText: {
    color: COLORS.subtle,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  finalScore: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  modalButton: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
});