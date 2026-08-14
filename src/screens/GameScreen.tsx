import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { Board, BOARD_FRAME_PADDING } from '../components/Board';
import { Button } from '../components/Button';
import { WinModal } from '../components/WinModal';
import { HintModal } from '../components/HintModal';
import { useHaptics } from '../hooks/useHaptics';
import { useParkingStore } from '../store/gameStore';
import { getHintMove, type HintMove } from '../engine/hint';
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
  const lastResult = useParkingStore((s) => s.lastResult);
  const retryLast = useParkingStore((s) => s.retryLast);
  const dismissLevelCompleted = useParkingStore((s) => s.dismissLevelCompleted);

  const tryMove = useParkingStore((s) => s.tryMove);
  const undo = useParkingStore((s) => s.undo);
  const redo = useParkingStore((s) => s.redo);
  const resetLevel = useParkingStore((s) => s.resetLevel);
  const restart = useParkingStore((s) => s.restart);

  const { success } = useHaptics();

  const game = useParkingStore((s) => s.game);
  const awardHint = useParkingStore((s) => s.awardHint);
  const hints = useParkingStore((s) => s.hints);
  const [showHint, setShowHint] = useState(false);
  const [hintMove, setHintMove] = useState<HintMove | null>(null);

  const tileSize = Math.floor((width - 24 - 2 * BOARD_FRAME_PADDING) / cols);

  const onHintPress = useCallback(() => {
    if (levelCompleted || finished) return;
    const move = getHintMove(game.getLevel().toData());
    if (!move) return;
    setHintMove(move);
    setShowHint(true);
  }, [game, levelCompleted, finished]);

  const onMove = useCallback(
    (id: string, dir: Direction, distance: number) => {
      const moved = tryMove(id, dir, distance);
      if (moved > 0) {
        success();
      }
      return moved;
    },
    [tryMove, success],
  );

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
        <Board rows={rows} cols={cols} tiles={tiles} cars={cars} tileSize={tileSize} levelKey={levelNumber} onMove={onMove} />
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + 16 }]}>
        <Button label="Undo" variant="bevelSecondary" style={styles.control} disabled={!canUndo} onPress={undo} />
        <Button label="Reset" variant="bevelSecondary" style={styles.control} onPress={resetLevel} />
        <Button label="Redo" variant="bevel" style={styles.control} disabled={!canRedo} onPress={redo} />
        <Button label={`Hint (${hints})`} variant="bevel" style={styles.control} onPress={onHintPress} />
      </View>

      {levelCompleted && lastResult && (
        <WinModal
          levelNumber={lastResult.levelNumber}
          moves={lastResult.moves}
          par={lastResult.par}
          stars={lastResult.stars}
          onNext={dismissLevelCompleted}
          onRetry={retryLast}
          onHome={() => {
            dismissLevelCompleted();
            navigation.navigate('Home');
          }}
        />
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

      {showHint && hintMove && (
        <HintModal
          onReward={() => {
            awardHint(hintMove);
            setShowHint(false);
          }}
          onClose={() => setShowHint(false)}
        />
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
    gap: 6,
  },
  levelName: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  stats: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
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