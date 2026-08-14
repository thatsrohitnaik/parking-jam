import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { COLORS } from '../utils/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'bevel' | 'bevelSecondary';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  const isBevel = variant === 'bevel' || variant === 'bevelSecondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        isBevel && styles.bevel,
        variant === 'bevelSecondary' && styles.bevelSecondary,
        pressed && isBevel && styles.bevelPressed,
        pressed && !isBevel && { opacity: 0.85 },
        disabled && styles.disabled,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {isBevel && <View style={styles.bevelSheen} pointerEvents="none" />}
          <Text
            style={[
              styles.label,
              variant === 'ghost' && styles.ghostLabel,
              isBevel && styles.bevelLabel,
              pressed && isBevel && styles.bevelLabelPressed,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bevel: {
    backgroundColor: '#2F6BFF',
    borderBottomWidth: 6,
    borderBottomColor: '#1E40AF',
  },
  bevelSecondary: {
    backgroundColor: '#475569',
    borderBottomWidth: 6,
    borderBottomColor: '#1E293B',
  },
  bevelPressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 4 }],
  },
  bevelSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostLabel: {
    color: COLORS.text,
  },
  bevelLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bevelLabelPressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.4,
  },
});
