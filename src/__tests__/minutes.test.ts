import { canSubtractMinute, formatRemaining, parseMinutes } from '../minutes';

describe('formatRemaining', () => {
  it('formats minutes and seconds', () => {
    expect(formatRemaining(120_000)).toBe('02:00');
    expect(formatRemaining(59_000)).toBe('00:59');
  });

  it('rounds partial seconds up', () => {
    expect(formatRemaining(119_990)).toBe('02:00');
  });

  it('adds hours from one hour', () => {
    expect(formatRemaining(3_600_000)).toBe('1:00:00');
    expect(formatRemaining(3_725_000)).toBe('1:02:05');
  });

  it('never goes below zero', () => {
    expect(formatRemaining(0)).toBe('00:00');
    expect(formatRemaining(-5000)).toBe('00:00');
  });
});

describe('parseMinutes', () => {
  it('accepts whole numbers', () => {
    expect(parseMinutes('6')).toBe(6);
    expect(parseMinutes(' 15 ')).toBe(15);
  });

  it('rejects empty, zero, negative, decimal and non-numeric text', () => {
    for (const text of ['', '0', '-5', '2.5', 'abc']) {
      expect(parseMinutes(text)).toBeNull();
    }
  });

  it('rejects more than one day', () => {
    expect(parseMinutes('1441')).toBeNull();
  });
});

describe('canSubtractMinute', () => {
  const now = new Date('2026-01-01T10:00:00Z').getTime();

  it('is true when the timer would still ring in the future', () => {
    expect(canSubtractMinute(new Date(now + 90_000), now)).toBe(true);
  });

  it('is false when less than a minute is left or exactly a minute', () => {
    expect(canSubtractMinute(new Date(now + 60_000), now)).toBe(false);
    expect(canSubtractMinute(new Date(now + 30_000), now)).toBe(false);
  });
});
