import { StyleSheet, Text, View } from 'react-native';

import { StoredTimer } from './storage';
import Button from './ui/Button';
import { layout, shadow, useTheme } from './ui/theme';

type Props = {
  timers: StoredTimer[];
  onCancel: (id: string) => void;
};

export default function ActiveTimersList({ timers, onCancel }: Props) {
  const { colors } = useTheme();
  if (timers.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, shadow(1)]}>
      <Text style={[styles.title, { color: colors.text }]}>Active timers</Text>
      {timers.map((timer) => (
        <View key={timer.id} style={styles.row}>
          <View style={styles.info}>
            <Text style={[styles.label, { color: colors.text }]}>
              {timer.label}
            </Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>
              Rings at{' '}
              {new Date(timer.ringAt).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Button
            label="Cancel"
            variant="danger"
            onPress={() => onCancel(timer.id)}
            accessibilityLabel={`Cancel ${timer.label} timer`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: layout.radius,
    padding: layout.space.l,
    gap: layout.space.m,
  },
  title: { fontSize: layout.font.bodyLarge, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.m,
  },
  info: { flex: 1 },
  label: { fontSize: layout.font.body, fontWeight: '700' },
  time: { fontSize: layout.font.body },
});
