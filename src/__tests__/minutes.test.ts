import { parseMinutes } from '../minutes';

describe('parseMinutes', () => {
  it('accepts whole numbers', () => {
    expect(parseMinutes('15')).toBe(15);
    expect(parseMinutes(' 7 ')).toBe(7);
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
