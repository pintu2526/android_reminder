import AsyncStorage from '@react-native-async-storage/async-storage';

import { loadPresets, loadTimers, savePresets, saveTimers } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);

describe('presets storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns the default presets when nothing is saved', async () => {
    const presets = await loadPresets();

    expect(presets.length).toBeGreaterThan(0);
    expect(presets[0].label).toBe('Milk on stove');
  });

  it('returns what was saved', async () => {
    const saved = [{ id: 'eggs', label: 'Boil eggs' }];

    await savePresets(saved);

    expect(await loadPresets()).toEqual(saved);
  });

  it.each(['{not json', 'null', '{}'])(
    'falls back to defaults when saved data is corrupt or wrong-shaped: %s',
    async (data) => {
      await AsyncStorage.setItem('presets', data);

      const presets = await loadPresets();

      expect(presets[0].label).toBe('Milk on stove');
    },
  );

  it('skips saved items of the wrong shape', async () => {
    await AsyncStorage.setItem(
      'presets',
      JSON.stringify([{ id: 'a', label: 'Tea' }, { id: 5 }]),
    );

    expect(await loadPresets()).toEqual([{ id: 'a', label: 'Tea' }]);
  });
});

describe('timers storage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns no timers when nothing is saved', async () => {
    expect(await loadTimers()).toEqual([]);
  });

  it('returns what was saved', async () => {
    const saved = [{ id: 'a', label: 'Tea', ringAt: 1000 }];

    await saveTimers(saved);

    expect(await loadTimers()).toEqual(saved);
  });

  it.each(['{not json', 'null', '{"id":"a"}', '[{"id":1}]'])(
    'ignores corrupt or wrong-shaped data: %s',
    async (data) => {
      await AsyncStorage.setItem('timers', data);

      expect(await loadTimers()).toEqual([]);
    },
  );
});
