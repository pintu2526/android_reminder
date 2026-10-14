import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cancelTimer, scheduleTimer, ScheduledTimer } from './alarms';
import AddPresetModal from './AddPresetModal';
import AlarmPermissionsModal from './AlarmPermissionsModal';
import CustomMinutesInput from './CustomMinutesInput';
import { loadPresets, Preset, savePresets } from './storage';
import { useActiveTimers } from './useActiveTimers';
import { useAlarmPermissions } from './useAlarmPermissions';

const MINUTE_OPTIONS = [1, 2, 5, 10];
const CHANGE_WINDOW_MS = 5000;

type ActiveTimer = ScheduledTimer & { minutes: number };

export default function TimerScreen() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selected, setSelected] = useState<Preset | null>(null);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const permissions = useAlarmPermissions();
  const { timers, addTimer, removeTimer } = useActiveTimers();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    loadPresets()
      .then(setPresets)
      .catch((error) => console.error('Could not load presets', error));
    return () => clearTimeout(closeTimeout.current);
  }, []);

  async function updatePresets(next: Preset[]) {
    setPresets(next);
    try {
      await savePresets(next);
    } catch (error) {
      console.error('Could not save presets', error);
      setMessage('Could not save your presets. They may be lost on restart.');
    }
  }

  function addPreset(label: string) {
    updatePresets([...presets, { id: Date.now().toString(), label }]);
  }

  function removePreset(preset: Preset) {
    updatePresets(presets.filter((item) => item.id !== preset.id));
    if (selected?.id === preset.id) setSelected(null);
  }

  function selectPreset(preset: Preset) {
    clearTimeout(closeTimeout.current);
    setActiveTimer(null);
    setSelected(preset);
  }

  function openAddDialog() {
    setMenuOpen(false);
    setAddOpen(true);
  }

  function openPermissionsDialog() {
    setMenuOpen(false);
    setPermissionsOpen(true);
  }

  async function cancelActiveTimer(id: string) {
    await cancelTimer(id);
    removeTimer(id);
  }

  async function cancelFromList(id: string) {
    try {
      await cancelActiveTimer(id);
      if (activeTimer?.id === id) {
        clearTimeout(closeTimeout.current);
        setActiveTimer(null);
      }
      setMessage('');
    } catch (error) {
      console.error('Could not cancel timer', error);
      setMessage('Could not cancel the timer. Please try again.');
    }
  }

  // Keeps the minute options visible for a few seconds so the choice can be changed.
  async function startTimer(minutes: number) {
    if (!selected) return;
    // Stop and the ring screen live in the notification, so without it a ringing alarm can't be stopped.
    if (permissions?.notifications === false) {
      setMessage(
        'Turn on Notifications in ☰ → Alarm permissions so you can stop the alarm, then try again.',
      );
      return;
    }
    clearTimeout(closeTimeout.current);
    try {
      if (activeTimer) await cancelActiveTimer(activeTimer.id);
      const timer = await scheduleTimer(selected.label, minutes);
      addTimer({
        id: timer.id,
        label: selected.label,
        ringAt: timer.ringAt.getTime(),
      });
      const time = timer.ringAt.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
      setActiveTimer({ ...timer, minutes });
      setMessage(`${selected.label} rings at ${time}`);
      closeTimeout.current = setTimeout(() => {
        setSelected(null);
        setActiveTimer(null);
      }, CHANGE_WINDOW_MS);
    } catch (error) {
      console.error('Could not start timer', error);
      setActiveTimer(null);
      setMessage(
        permissions?.exactAlarms === false
          ? 'Turn on "Alarms & reminders" in ☰ → Alarm permissions, then try again.'
          : 'Could not start the timer. Please try again.',
      );
    }
  }

  return (
    <View style={styles.screen}>
      <Pressable
        onPress={() => setMenuOpen((open) => !open)}
        accessibilityLabel="Menu"
        style={styles.menuButton}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {permissions && !Object.values(permissions).every(Boolean) && (
          <Text style={styles.warning}>
            Some alarm permissions are off, so timers may not ring. Open the
            menu and choose Alarm permissions.
          </Text>
        )}
        {presets.map((preset) => (
          <Pressable
            key={preset.id}
            onPress={() => selectPreset(preset)}
            onLongPress={() => removePreset(preset)}
            style={[
              styles.button,
              selected?.id === preset.id && styles.buttonSelected,
            ]}
          >
            <Text style={styles.buttonText}>{preset.label}</Text>
          </Pressable>
        ))}
        {selected && (
          <View style={styles.minutesRow}>
            {MINUTE_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                onPress={() => startTimer(minutes)}
                style={[
                  styles.button,
                  activeTimer?.minutes === minutes && styles.buttonSelected,
                ]}
              >
                <Text style={styles.buttonText}>+{minutes}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {selected && <CustomMinutesInput onStart={startTimer} />}
        {message !== '' && <Text style={styles.message}>{message}</Text>}
        {timers.length > 0 && (
          <View style={styles.timers}>
            <Text style={styles.timersTitle}>Active timers</Text>
            {timers.map((timer) => (
              <View key={timer.id} style={styles.timerRow}>
                <Text style={styles.timerText}>
                  {timer.label} ·{' '}
                  {new Date(timer.ringAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
                <Pressable
                  onPress={() => cancelFromList(timer.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Cancel ${timer.label} timer`}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {menuOpen && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
          />
          <View style={styles.menu}>
            <Pressable onPress={openAddDialog} style={styles.menuItem}>
              <Text style={styles.buttonText}>Add new preset</Text>
            </Pressable>
            <Pressable onPress={openPermissionsDialog} style={styles.menuItem}>
              <Text style={styles.buttonText}>Alarm permissions</Text>
            </Pressable>
          </View>
        </>
      )}
      <AddPresetModal
        visible={addOpen}
        onAdd={addPreset}
        onClose={() => setAddOpen(false)}
      />
      <AlarmPermissionsModal
        visible={permissionsOpen}
        permissions={permissions}
        onClose={() => setPermissionsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 96, gap: 12 },
  menuButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    padding: 8,
    zIndex: 1,
  },
  menuIcon: { fontSize: 28 },
  menu: {
    position: 'absolute',
    top: 92,
    left: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 6,
    zIndex: 2,
  },
  menuItem: { paddingVertical: 14, paddingHorizontal: 20 },
  button: {
    backgroundColor: '#e8eaf0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonSelected: { backgroundColor: '#b9c6ff' },
  buttonText: { fontSize: 18 },
  minutesRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  message: { fontSize: 16, textAlign: 'center', marginTop: 12 },
  timers: { marginTop: 24, gap: 8 },
  timersTitle: { fontSize: 16, fontWeight: '600' },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timerText: { fontSize: 16, flexShrink: 1 },
  cancelButton: {
    backgroundColor: '#fde3e3',
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  cancelText: { fontSize: 16, color: '#b00020' },
  warning: { color: '#b00020', textAlign: 'center' },
});
