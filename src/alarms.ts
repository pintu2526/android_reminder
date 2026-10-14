import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

import AlarmRing from '../modules/alarm-ring';

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
