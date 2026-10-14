import { mergeTimers, stillPending } from '../useActiveTimers';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual(
    '@react-native-async-storage/async-storage/jest/async-storage-mock',
  ),
);

describe('stillPending', () => {
  const timer = (id: string, ringAt: number) => ({ id, label: id, ringAt });

  it('keeps timers that have not rung yet', () => {
    const timers = [timer('a', 2000)];

    expect(stillPending(timers, 1000)).toEqual(timers);
  });

  it('drops timers whose time has passed', () => {
    const timers = [timer('done', 1000), timer('later', 5000)];

    expect(stillPending(timers, 1000)).toEqual([timer('later', 5000)]);
  });

  it('returns an empty list when every timer has rung', () => {
    expect(stillPending([timer('a', 500)], 1000)).toEqual([]);
  });
});

describe('mergeTimers', () => {
  const timer = (id: string, ringAt: number) => ({ id, label: id, ringAt });

  it('keeps timers that are saved and in memory only once', () => {
    const merged = mergeTimers([timer('a', 5000)], [timer('a', 5000)], 1000);

    expect(merged).toEqual([timer('a', 5000)]);
  });

  it('combines different saved and in-memory timers', () => {
    const merged = mergeTimers([timer('a', 5000)], [timer('b', 6000)], 1000);

    expect(merged).toEqual([timer('a', 5000), timer('b', 6000)]);
  });

  it('removes a duplicate that was already saved twice', () => {
    const merged = mergeTimers([timer('a', 5000), timer('a', 5000)], [], 1000);

    expect(merged).toEqual([timer('a', 5000)]);
  });

  it('drops saved timers that have already rung', () => {
    expect(mergeTimers([timer('old', 500)], [], 1000)).toEqual([]);
  });
});
