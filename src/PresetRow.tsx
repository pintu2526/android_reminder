import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Preset } from './storage';
import Button from './ui/Button';
import { layout, shadow, useTheme } from './ui/theme';

type Props = {
  preset: Preset;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
};

export default function PresetRow({
  preset,
  selected,
  onSelect,
  onEdit,
}: Props) {
  const { colors } = useTheme();
  const textColor = selected ? colors.onPrimary : colors.text;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityLabel={
          preset.defaultMinutes
            ? `${preset.label}, ${preset.defaultMinutes} minutes`
            : preset.label
        }
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: selected ? colors.primary : colors.surface },
          shadow(1),
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.label, { color: textColor }]}>{preset.label}</Text>
        {preset.defaultMinutes ? (
          <Text
            style={[
              styles.pill,
              selected
                ? { color: colors.onPrimary, borderColor: colors.onPrimary }
                : {
                    color: colors.onPrimarySoft,
                    backgroundColor: colors.primarySoft,
                    borderColor: colors.primarySoft,
                  },
            ]}
          >
            {preset.defaultMinutes} min
          </Text>
        ) : null}
      </Pressable>
      <Button
        label="Edit"
        onPress={onEdit}
        accessibilityLabel={`Edit ${preset.label}`}
        style={styles.edit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: layout.space.m },
  card: {
    flex: 1,
    minHeight: 60,
    borderRadius: layout.radius,
    paddingHorizontal: layout.space.l,
    paddingVertical: layout.space.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.m,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  label: { flexShrink: 1, fontSize: layout.font.bodyLarge, fontWeight: '700' },
  pill: {
    fontSize: layout.font.body,
    fontWeight: '700',
    borderWidth: 1.5,
    borderRadius: layout.radius,
    paddingHorizontal: layout.space.m,
    paddingVertical: layout.space.xs,
    overflow: 'hidden',
  },
  edit: { minHeight: 60, paddingHorizontal: layout.space.l },
});
