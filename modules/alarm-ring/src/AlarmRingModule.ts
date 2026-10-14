import { NativeModule, requireNativeModule } from 'expo';

declare class AlarmRingModule extends NativeModule {
  scheduleAlarm(label: string, triggerAtMillis: number): string;
  cancelAlarm(id: string): void;
  canScheduleExactAlarms(): boolean;
  canUseFullScreenIntent(): boolean;
  openExactAlarmSettings(): void;
  openFullScreenIntentSettings(): void;
}

export default requireNativeModule<AlarmRingModule>('AlarmRing');
