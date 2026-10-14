import { Colors, palettes } from '../ui/theme';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Text colour, then the background it is drawn on.
const textOnBackground: [keyof Colors, keyof Colors][] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['text', 'surfaceAlt'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['onPrimary', 'primary'],
  ['onPrimarySoft', 'primarySoft'],
  ['onDangerSoft', 'dangerSoft'],
  ['onSuccessSoft', 'successSoft'],
  ['onDangerSoft', 'surface'],
  ['onSuccessSoft', 'surface'],
  ['primary', 'surface'],
  ['primary', 'background'],
];

describe.each(Object.entries(palettes))('%s palette contrast', (_, colors) => {
  it.each(textOnBackground)(
    '%s on %s is at least 4.5:1',
    (text, background) => {
      expect(contrast(colors[text], colors[background])).toBeGreaterThanOrEqual(
        4.5,
      );
    },
  );
});
