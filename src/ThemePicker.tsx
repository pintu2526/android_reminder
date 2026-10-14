import { StyleSheet, Text, View } from 'react-native';

import { ThemeChoice } from './storage';
import Button from './ui/Button';
import { layout, useTheme } from './ui/theme';

const OPTIONS: { choice: ThemeChoice; label: string }[] = [
  { choice: 'dark', label: 'Dark' },
  { choice: 'light', label: 'Light' },
  { choice: 'system', label: 'Phone' },
];

type Props = {
  value: ThemeChoice;
  onChange: (choice: ThemeChoice) => void;
};

export default function ThemePicker({ value, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textMuted }]}>Theme</Text>
      <View style={styles.row}>
        {OPTIONS.map(({ choice, label }) => (
          <Button
            key={choice}
            label={label}
            variant={value === choice ? 'primary' : 'soft'}
            onPress={() => onChange(choice)}
            accessibilityLabel={
              choice === 'system' ? 'Theme: follow phone' : `Theme: ${label}`
            }
            style={styles.option}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: layout.space.s },
  title: { fontSize: layout.font.caption, fontWeight: '600' },
  row: { flexDirection: 'row', gap: layout.space.s },
  option: { paddingHorizontal: layout.space.m },
});
