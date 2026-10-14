import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

import AlarmRing from '../modules/alarm-ring';
import { Preset, StoredTimer } from './storage';

export type ScheduledTimer = {
  id: string;
  ringAt: Date;
};

export type AlarmPermissions = {
  notifications: boolean;
  exactAlarms: boolean;
  fullScreen: boolean;
};

export async function scheduleTimer(
  label: string,
  minutes: number,
  from = new Date(),
): Promise<ScheduledTimer> {
  const ringAt = new Date(from.getTime() + minutes * 60 * 1000);
  const id = AlarmRing.scheduleAlarm(label, ringAt.getTime());
  return { id, ringAt };
}

// Home-screen widgets are native, so they read their own copy of the presets.
export function syncWidgetPresets(presets: Preset[]): void {
  try {
    AlarmRing.syncPresets(JSON.stringify(presets));
  } catch (error) {
    // Widgets are optional, so a failed sync must not break the app.
    console.error('Could not sync presets to widgets', error);
  }
}

// Timers started from a widget while the app was closed. Each one is returned only once.
export function takeWidgetTimers(): StoredTimer[] {
  try {
    return JSON.parse(AlarmRing.takeWidgetTimers()) as StoredTimer[];
  } catch (error) {
    console.error('Could not read widget timers', error);
    return [];
  }
}

export async function cancelTimer(id: string): Promise<void> {
  AlarmRing.cancelAlarm(id);
}

export async function requestNotificationPermission(): Promise<void> {
  await Notifications.requestPermissionsAsync();
}

export async function getAlarmPermissions(): Promise<AlarmPermissions> {
  const { granted } = await Notifications.getPermissionsAsync();
  return {
    notifications: granted,
    exactAlarms: AlarmRing.canScheduleExactAlarms(),
    fullScreen: AlarmRing.canUseFullScreenIntent(),
  };
}

export function openNotificationSettings(): void {
  Linking.openSettings();
}

export function openExactAlarmSettings(): void {
  AlarmRing.openExactAlarmSettings();
}

export function openFullScreenSettings(): void {
  AlarmRing.openFullScreenIntentSettings();
}
