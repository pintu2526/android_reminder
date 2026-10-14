import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AlarmPermissions,
  openExactAlarmSettings,
  openFullScreenSettings,
  openNotificationSettings,
} from './alarms';

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
  const rows = permissions && [
    {
      name: 'Notifications',
      enabled: permissions.notifications,
      open: openNotificationSettings,
    },
    {
      name: 'Exact alarms ("Alarms & reminders")',
      enabled: permissions.exactAlarms,
      open: openExactAlarmSettings,
    },
    {
      name: 'Full-screen alerts',
      enabled: permissions.fullScreen,
      open: openFullScreenSettings,
    },
  ];

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Alarm permissions</Text>
          {rows?.map((row) => (
            <View key={row.name} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.name}>{row.name}</Text>
                <Text style={row.enabled ? styles.on : styles.off}>
                  {row.enabled ? 'On' : 'Off'}
                </Text>
              </View>
              {!row.enabled && (
                <Pressable onPress={row.open} style={styles.button}>
                  <Text style={styles.buttonText}>Open settings</Text>
                </Pressable>
              )}
            </View>
          ))}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 },
  name: { fontSize: 16 },
  on: { color: '#1b7f3b' },
  off: { color: '#b00020' },
  button: {
    backgroundColor: '#e8eaf0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  closeButton: {
    backgroundColor: '#e8eaf0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16 },
});
