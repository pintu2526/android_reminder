import { StyleSheet, Text, View } from 'react-native';

import {
  AlarmPermissions,
  openExactAlarmSettings,
  openFullScreenSettings,
  openNotificationSettings,
} from './alarms';
import Button from './ui/Button';
import Dialog from './ui/Dialog';
import { layout, useTheme } from './ui/theme';

type Props = {
  visible: boolean;
  permissions: AlarmPermissions | null;
  onClose: () => void;
};

export default function AlarmPermissionsModal({
  visible,
  permissions,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const rows = permissions && [
    {
      name: 'Notifications',
      hint: 'Shows the Stop button when a timer rings.',
      enabled: permissions.notifications,
      open: openNotificationSettings,
    },
    {
      name: 'Exact alarms',
      hint: 'Called "Alarms & reminders" in Settings. Lets timers ring on time.',
      enabled: permissions.exactAlarms,
      open: openExactAlarmSettings,
    },
    {
      name: 'Full-screen alerts',
      hint: 'Lets the ring screen open over the lock screen.',
      enabled: permissions.fullScreen,
      open: openFullScreenSettings,
    },
  ];

  return (
    <Dialog visible={visible} title="Alarm permissions" onClose={onClose}>
      {rows?.map((row) => (
        <View
          key={row.name}
          style={[styles.row, { backgroundColor: colors.surfaceAlt }]}
        >
          <View style={styles.rowHeader}>
            <Text style={[styles.name, { color: colors.text }]}>
              {row.name}
            </Text>
            <Text
              style={[
                styles.status,
                row.enabled
                  ? {
                      color: colors.onSuccessSoft,
                      backgroundColor: colors.successSoft,
                    }
                  : {
                      color: colors.onDangerSoft,
                      backgroundColor: colors.dangerSoft,
                    },
              ]}
            >
              {row.enabled ? '✓ On' : '⚠ Off'}
            </Text>
          </View>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            {row.hint}
          </Text>
          {!row.enabled && (
            <Button
              label="Open settings"
              variant="primary"
              onPress={row.open}
              accessibilityLabel={`Open settings for ${row.name}`}
            />
          )}
        </View>
      ))}
      <Button label="Close" onPress={onClose} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: layout.radius,
    padding: layout.space.l,
    gap: layout.space.s,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.m,
  },
  name: { flexShrink: 1, fontSize: layout.font.bodyLarge, fontWeight: '700' },
  status: {
    fontSize: layout.font.body,
    fontWeight: '700',
    paddingHorizontal: layout.space.m,
    paddingVertical: layout.space.xs,
    borderRadius: layout.radius,
    overflow: 'hidden',
  },
  hint: { fontSize: layout.font.body },
});
