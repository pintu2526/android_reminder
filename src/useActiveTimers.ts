import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { takeWidgetTimers } from './alarms';
import { loadTimers, saveTimers, StoredTimer } from './storage';

// Timers that have rung are dropped: the ring screen's Stop button lives in
// native code, so JavaScript only knows a timer is over once its time has passed.
export function stillPending(
  timers: StoredTimer[],
  now = Date.now(),
): StoredTimer[] {
  return timers.filter((timer) => timer.ringAt > now);
}

// Saved timers plus the ones already in memory, each id listed once.
export function mergeTimers(
  saved: StoredTimer[],
  current: StoredTimer[],
  now = Date.now(),
): StoredTimer[] {
  const byId = new Map<string, StoredTimer>();
  for (const timer of [...stillPending(saved, now), ...current]) {
    byId.set(timer.id, timer);
  }
  return [...byId.values()];
}

export function useActiveTimers() {
  const [timers, setTimers] = useState<StoredTimer[]>([]);
  const latest = useRef<StoredTimer[]>([]);

  const update = useCallback((next: StoredTimer[]) => {
    latest.current = next;
    setTimers(next);
    saveTimers(next).catch((error) =>
      console.error('Could not save timers', error),
    );
  }, []);

  const dropFinished = useCallback(() => {
    const pending = stillPending(latest.current);
    if (pending.length !== latest.current.length) update(pending);
  }, [update]);

  const importWidgetTimers = useCallback(() => {
    const fromWidgets = stillPending(takeWidgetTimers());
    if (fromWidgets.length > 0)
      update(mergeTimers(fromWidgets, latest.current));
  }, [update]);

  useEffect(() => {
    importWidgetTimers();
    // Merge, so a timer added before the load finished is not lost.
    loadTimers()
      .then((saved) => update(mergeTimers(saved, latest.current)))
      .catch((error) => console.error('Could not load timers', error));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      dropFinished();
      importWidgetTimers();
    });
    return () => subscription.remove();
  }, [update, dropFinished, importWidgetTimers]);

  useEffect(() => {
    if (timers.length === 0) return;
    const nextRing = Math.min(...timers.map((timer) => timer.ringAt));
    const timeout = setTimeout(dropFinished, nextRing - Date.now() + 1000);
    return () => clearTimeout(timeout);
  }, [timers, dropFinished]);

  const addTimer = (timer: StoredTimer) => update([...latest.current, timer]);
  const removeTimer = (id: string) =>
    update(latest.current.filter((timer) => timer.id !== id));

  return { timers, addTimer, removeTimer };
}
