import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  AlarmPermissions,
  getAlarmPermissions,
  requestNotificationPermission,
} from './alarms';

// Permissions are granted on Android's settings screens, so re-check when the
// user comes back to the app.
export function useAlarmPermissions(): AlarmPermissions | null {
  const [permissions, setPermissions] = useState<AlarmPermissions | null>(null);

  const refresh = useCallback(() => {
    getAlarmPermissions()
      .then(setPermissions)
      .catch((error) => console.error('Could not read permissions', error));
  }, []);

  useEffect(() => {
    requestNotificationPermission()
      .then(refresh)
      .catch((error) => console.error('Could not ask for permission', error));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return permissions;
}
