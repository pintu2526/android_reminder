import * as Notifications from 'expo-notifications';

import AlarmRing from '../../modules/alarm-ring';
import { cancelTimer, getAlarmPermissions, scheduleTimer } from '../alarms';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('../../modules/alarm-ring', () => ({
  scheduleAlarm: jest.fn(),
  cancelAlarm: jest.fn(),
  canScheduleExactAlarms: jest.fn(),
  canUseFullScreenIntent: jest.fn(),
}));

describe('alarms', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('adds the minutes to a given start time', async () => {
    jest.mocked(AlarmRing.scheduleAlarm).mockReturnValue('abc');
    const from = new Date('2026-01-01T10:03:00Z');

    const { ringAt } = await scheduleTimer('Tea', 2, from);

    expect(ringAt.toISOString()).toBe('2026-01-01T10:05:00.000Z');
  });

  it('moves the ring time earlier when minutes are negative', async () => {
    const from = new Date('2026-01-01T10:05:00Z');

    const { ringAt } = await scheduleTimer('Tea', -1, from);

    expect(ringAt.toISOString()).toBe('2026-01-01T10:04:00.000Z');
  });

  it('schedules an alarm the given number of minutes from now', async () => {
    jest.mocked(AlarmRing.scheduleAlarm).mockReturnValue('abc');

    const { id, ringAt } = await scheduleTimer('Milk on stove', 5);

    expect(id).toBe('abc');
    expect(ringAt.toISOString()).toBe('2026-01-01T10:05:00.000Z');
    expect(AlarmRing.scheduleAlarm).toHaveBeenCalledWith(
      'Milk on stove',
      ringAt.getTime(),
    );
  });

  it('cancels a scheduled timer by id', async () => {
    await cancelTimer('abc');

    expect(AlarmRing.cancelAlarm).toHaveBeenCalledWith('abc');
  });

  it('combines the three permission checks', async () => {
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({
      granted: true,
    } as Notifications.NotificationPermissionsStatus);
    jest.mocked(AlarmRing.canScheduleExactAlarms).mockReturnValue(false);
    jest.mocked(AlarmRing.canUseFullScreenIntent).mockReturnValue(true);

    expect(await getAlarmPermissions()).toEqual({
      notifications: true,
      exactAlarms: false,
      fullScreen: true,
    });
  });
});
