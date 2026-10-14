import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { layout, useTheme } from './theme';

type Variant = 'primary' | 'soft' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  onPress,
  variant = 'soft',
  disabled,
  accessibilityLabel,
  style,
}: Props) {
  const { colors } = useTheme();
  const look = {
    primary: { background: colors.primary, text: colors.onPrimary },
    soft: { background: colors.surfaceAlt, text: colors.text },
    danger: { background: colors.dangerSoft, text: colors.onDangerSoft },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: look.background },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.label, { color: look.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: layout.radius,
    paddingHorizontal: layout.space.l,
    paddingVertical: layout.space.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: layout.font.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
