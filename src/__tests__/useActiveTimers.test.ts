import { stillPending } from '../useActiveTimers';

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
