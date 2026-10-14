import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { cancelTimer, scheduleTimer, ScheduledTimer } from './alarms';
import ActiveTimersList from './ActiveTimersList';
import AlarmPermissionsModal from './AlarmPermissionsModal';
import { canSubtractMinute } from './minutes';
import PresetModal, { PresetValues } from './PresetModal';
import PresetRow from './PresetRow';
import ThemePicker from './ThemePicker';
import TimerPanel from './TimerPanel';
import { loadPresets, Preset, savePresets } from './storage';
import { useActiveTimers } from './useActiveTimers';
import { useAlarmPermissions } from './useAlarmPermissions';
import { useThemeChoice } from './useThemeChoice';
import Button from './ui/Button';
import { layout, shadow, useTheme } from './ui/theme';

const CHANGE_WINDOW_MS = 5000;

type ActiveTimer = ScheduledTimer & { minutes: number; startedAt: number };

export default function TimerScreen() {
  const { colors } = useTheme();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selected, setSelected] = useState<Preset | null>(null);
  const [editing, setEditing] = useState(true);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  // `{}` opens the popup for a new preset, `{ preset }` for editing one.
  const [presetDialog, setPresetDialog] = useState<{ preset?: Preset } | null>(
    null,
  );
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const permissions = useAlarmPermissions();
  const [themeChoice, setThemeChoice] = useThemeChoice();
  const { timers, addTimer, removeTimer } = useActiveTimers();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Mirrors activeTimer so quick consecutive taps read the latest value, not a stale render.
  const activeRef = useRef<ActiveTimer | null>(null);

  function updateActiveTimer(timer: ActiveTimer | null) {
    activeRef.current = timer;
    setActiveTimer(timer);
  }

  useEffect(() => {
    loadPresets()
      .then(setPresets)
      .catch((error) => console.error('Could not load presets', error));
    return () => clearTimeout(closeTimeout.current);
  }, []);

  // The countdown stays after the buttons hide; remove it once the timer has rung.
  const finishId = activeTimer?.id;
  const finishAt = activeTimer?.ringAt.getTime();
  useEffect(() => {
    if (finishId === undefined || finishAt === undefined) return;
    const timeout = setTimeout(
      () => {
        activeRef.current = null;
        setActiveTimer(null);
        setSelected(null);
      },
      finishAt - Date.now() + 1000,
    );
    return () => clearTimeout(timeout);
  }, [finishId, finishAt]);

  async function updatePresets(next: Preset[]) {
    setPresets(next);
    try {
      await savePresets(next);
    } catch (error) {
      console.error('Could not save presets', error);
      setMessage('Could not save your presets. They may be lost on restart.');
    }
  }

  function savePreset(values: PresetValues) {
    const existing = presetDialog?.preset;
    if (!existing) {
      updatePresets([...presets, { id: Date.now().toString(), ...values }]);
      return;
    }
    const updated = { ...existing, ...values };
    updatePresets(
      presets.map((item) => (item.id === existing.id ? updated : item)),
    );
    if (selected?.id === existing.id) setSelected(updated);
  }

  function removePreset(preset: Preset) {
    updatePresets(presets.filter((item) => item.id !== preset.id));
    if (selected?.id === preset.id) setSelected(null);
  }

  function selectPreset(preset: Preset) {
    clearTimeout(closeTimeout.current);
    updateActiveTimer(null);
    // Tapping the open preset again only hides its panel. A running timer keeps going in the list.
    if (selected?.id === preset.id) {
      setSelected(null);
      return;
    }
    setEditing(true);
    setSelected(preset);
    if (preset.defaultMinutes) addMinutes(preset.defaultMinutes, preset);
  }

  function openPermissionsDialog() {
    setMenuOpen(false);
    setPermissionsOpen(true);
  }

  async function cancelActiveTimer(id: string) {
    await cancelTimer(id);
    removeTimer(id);
  }

  // Cancelling the timer being shown also closes its panel. Reset keeps the preset selected to start again.
  async function cancelFromList(id: string, keepSelected = false) {
    try {
      await cancelActiveTimer(id);
      if (activeRef.current?.id === id) {
        clearTimeout(closeTimeout.current);
        updateActiveTimer(null);
        if (!keepSelected) setSelected(null);
      }
      setMessage('');
    } catch (error) {
      console.error('Could not cancel timer', error);
      setMessage('Could not cancel the timer. Please try again.');
    }
  }

  // Each tap adds to the running timer. The options stay for a few seconds after the last tap.
  async function addMinutes(minutes: number, preset = selected) {
    if (!preset) return;
    // Stop and the ring screen live in the notification, so without it a ringing alarm can't be stopped.
    if (permissions?.notifications === false) {
      setMessage(
        'Turn on Notifications in ☰ → Alarm permissions so you can stop the alarm, then try again.',
      );
      return;
    }
    clearTimeout(closeTimeout.current);
    try {
      const current = activeRef.current;
      if (current) await cancelActiveTimer(current.id);
      const timer = await scheduleTimer(preset.label, minutes, current?.ringAt);
      addTimer({
        id: timer.id,
        label: preset.label,
        ringAt: timer.ringAt.getTime(),
      });
      updateActiveTimer({
        ...timer,
        minutes,
        startedAt:
          current?.startedAt ?? timer.ringAt.getTime() - minutes * 60_000,
      });
      setMessage('');
      setEditing(true);
      closeTimeout.current = setTimeout(() => {
        setEditing(false);
      }, CHANGE_WINDOW_MS);
    } catch (error) {
      console.error('Could not start timer', error);
      updateActiveTimer(null);
      setMessage(
        permissions?.exactAlarms === false
          ? 'Turn on "Alarms & reminders" in ☰ → Alarm permissions, then try again.'
          : 'Could not start the timer. Please try again.',
      );
    }
  }

  // Takes a minute off the running timer. If less than a minute is left there is nothing to shorten, so it stops.
  function subtractMinute() {
    const current = activeRef.current;
    if (!current) return;
    if (canSubtractMinute(current.ringAt)) addMinutes(-1);
    else resetTimer();
  }

  function resetTimer() {
    if (activeRef.current) cancelFromList(activeRef.current.id, true);
  }

  const permissionsOff =
    permissions !== null && !Object.values(permissions).every(Boolean);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            Quick Reminder
          </Text>
          <Button
            label="☰ Menu"
            onPress={() => setMenuOpen((open) => !open)}
            accessibilityLabel="Menu"
            style={styles.menuButton}
          />
        </View>
        {permissionsOff && (
          <Pressable
            onPress={openPermissionsDialog}
            accessibilityRole="button"
            style={[styles.notice, { backgroundColor: colors.dangerSoft }]}
          >
            <Text style={[styles.noticeText, { color: colors.onDangerSoft }]}>
              ⚠ Alarms may not ring. Tap here to fix.
            </Text>
          </Pressable>
        )}
        {presets.map((preset) => (
          <PresetRow
            key={preset.id}
            preset={preset}
            selected={selected?.id === preset.id}
            onSelect={() => selectPreset(preset)}
            onEdit={() => setPresetDialog({ preset })}
          />
        ))}
        {message !== '' && (
          <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
            <Text style={[styles.noticeText, { color: colors.onDangerSoft }]}>
              ⚠ {message}
            </Text>
          </View>
        )}
        <ActiveTimersList
          timers={timers}
          onCancel={(id) => cancelFromList(id)}
        />
      </ScrollView>
      {!selected && (
        <Pressable
          onPress={() => setPresetDialog({})}
          accessibilityRole="button"
          accessibilityLabel="Add new preset"
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primary },
            shadow(3),
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.addText, { color: colors.onPrimary }]}>+</Text>
        </Pressable>
      )}
      {selected && (
        <TimerPanel
          label={selected.label}
          ringAt={activeTimer?.ringAt ?? null}
          startedAt={activeTimer?.startedAt ?? 0}
          lastMinutes={activeTimer?.minutes}
          editing={editing}
          onAdd={addMinutes}
          onSubtract={subtractMinute}
          onReset={resetTimer}
        />
      )}
      {menuOpen && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
          />
          <View
            style={[
              styles.menu,
              { backgroundColor: colors.surface },
              shadow(3),
            ]}
          >
            <ThemePicker value={themeChoice} onChange={setThemeChoice} />
            <Button label="Alarm permissions" onPress={openPermissionsDialog} />
          </View>
        </>
      )}
      <PresetModal
        visible={presetDialog !== null}
        preset={presetDialog?.preset}
        onSave={savePreset}
        onDelete={() =>
          presetDialog?.preset && removePreset(presetDialog.preset)
        }
        onClose={() => setPresetDialog(null)}
      />
      <AlarmPermissionsModal
        visible={permissionsOpen}
        permissions={permissions}
        onClose={() => setPermissionsOpen(false)}
      />
    </View>
  );
}

const ADD_BUTTON_SIZE = 64;
const HEADER_TOP = (StatusBar.currentHeight ?? 24) + layout.space.m;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: layout.space.xl,
    paddingTop: HEADER_TOP,
    // Room to scroll the last preset clear of the floating add button.
    paddingBottom: ADD_BUTTON_SIZE + layout.space.xl * 2,
    gap: layout.space.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.m,
  },
  title: { flexShrink: 1, fontSize: layout.font.title, fontWeight: '800' },
  menuButton: { minHeight: 56, paddingHorizontal: layout.space.l },
  notice: { borderRadius: layout.radius, padding: layout.space.l },
  noticeText: { fontSize: layout.font.body, fontWeight: '700' },
  addButton: {
    position: 'absolute',
    right: layout.space.xl,
    bottom: layout.space.xl,
    width: ADD_BUTTON_SIZE,
    height: ADD_BUTTON_SIZE,
    borderRadius: ADD_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 36, fontWeight: '600', lineHeight: 40 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  menu: {
    position: 'absolute',
    top: HEADER_TOP + 64,
    right: layout.space.xl,
    borderRadius: layout.radius,
    padding: layout.space.m,
    gap: layout.space.m,
  },
});
