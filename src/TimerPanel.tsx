import { StyleSheet, Text, View } from 'react-native';

import TimerDisplay from './TimerDisplay';
import Button from './ui/Button';
import { layout, useTheme } from './ui/theme';

const MINUTE_OPTIONS = [1, 2, 5, 10];

type Props = {
  label: string;
  ringAt: Date | null;
  startedAt: number;
  lastMinutes?: number;
  // While true, the add and reset buttons are shown; afterwards only the countdown.
  editing: boolean;
  onAdd: (minutes: number) => void;
  onSubtract: () => void;
  onReset: () => void;
};

export default function TimerPanel({
  label,
  ringAt,
  startedAt,
  lastMinutes,
  editing,
  onAdd,
  onSubtract,
  onReset,
}: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.panel}>
      <TimerDisplay label={label} ringAt={ringAt} startedAt={startedAt} />
      {editing && (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Add minutes
          </Text>
          <View style={styles.row}>
            <Button
              label="−1"
              disabled={!ringAt}
              onPress={onSubtract}
              accessibilityLabel="Remove 1 minute"
              style={styles.button}
            />
            {MINUTE_OPTIONS.map((minutes) => (
              <Button
                key={minutes}
                label={`+${minutes}`}
                variant={lastMinutes === minutes ? 'primary' : 'soft'}
                onPress={() => onAdd(minutes)}
                accessibilityLabel={`Add ${minutes} ${
                  minutes === 1 ? 'minute' : 'minutes'
                }`}
                style={styles.button}
              />
            ))}
          </View>
          {/* Always shown, so the buttons above never move when a timer starts. */}
          <Button
            label="Reset timer"
            variant="danger"
            disabled={!ringAt}
            onPress={onReset}
            accessibilityLabel={`Reset ${label} timer`}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    paddingHorizontal: layout.space.xl,
    paddingTop: layout.space.s,
    paddingBottom: layout.space.xl,
    gap: layout.space.m,
  },
  title: { fontSize: layout.font.body, fontWeight: '600' },
  row: { flexDirection: 'row', gap: layout.space.s },
  button: { flex: 1, paddingHorizontal: 0 },
});
