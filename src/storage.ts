import AsyncStorage from '@react-native-async-storage/async-storage';

export type Preset = {
  id: string;
  label: string;
  defaultMinutes?: number;
};

// 'system' follows the phone's light or dark setting.
export type ThemeChoice = 'system' | 'light' | 'dark';

export type StoredTimer = {
  id: string;
  label: string;
  ringAt: number;
};

const PRESETS_KEY = 'presets';
const TIMERS_KEY = 'timers';
const THEME_KEY = 'themeChoice';

const DEFAULT_PRESETS: Preset[] = [
  { id: 'milk', label: 'Milk on stove' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'tea', label: 'Tea' },
  { id: 'pump', label: 'Turn off pump' },
];

function isPreset(value: unknown): value is Preset {
  const preset = value as Preset;
  return (
    typeof preset?.id === 'string' &&
    typeof preset.label === 'string' &&
    (preset.defaultMinutes === undefined ||
      typeof preset.defaultMinutes === 'number')
  );
}

export async function loadPresets(): Promise<Preset[]> {
  const stored = await AsyncStorage.getItem(PRESETS_KEY);
  if (stored === null) {
    return DEFAULT_PRESETS;
  }
  try {
    const presets: unknown = JSON.parse(stored);
    return Array.isArray(presets) ? presets.filter(isPreset) : DEFAULT_PRESETS;
  } catch {
    // Corrupt data should not leave the user with an empty, unusable app.
    return DEFAULT_PRESETS;
  }
}

export async function savePresets(presets: Preset[]): Promise<void> {
  await AsyncStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function isStoredTimer(value: unknown): value is StoredTimer {
  const timer = value as StoredTimer;
  return (
    typeof timer?.id === 'string' &&
    typeof timer.label === 'string' &&
    typeof timer.ringAt === 'number'
  );
}

export async function loadTimers(): Promise<StoredTimer[]> {
  const stored = await AsyncStorage.getItem(TIMERS_KEY);
  if (stored === null) return [];
  try {
    const timers: unknown = JSON.parse(stored);
    return Array.isArray(timers) ? timers.filter(isStoredTimer) : [];
  } catch {
    return [];
  }
}

export async function saveTimers(timers: StoredTimer[]): Promise<void> {
  await AsyncStorage.setItem(TIMERS_KEY, JSON.stringify(timers));
}

export async function loadThemeChoice(): Promise<ThemeChoice> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export async function saveThemeChoice(choice: ThemeChoice): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, choice);
}
