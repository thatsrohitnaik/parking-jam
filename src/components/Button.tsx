import React from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { COLORS } from '../utils/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled, style }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        pressed && { opacity: 0.85 },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, variant === 'ghost' && styles.ghostLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: '#334155',
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostLabel: {
    color: COLORS.text,
  },
});