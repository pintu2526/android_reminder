import { useColorScheme } from 'react-native';

// Every colour pair that is drawn as text on a background must keep a contrast
// ratio of at least 4.5:1 (checked in src/__tests__/theme.test.ts).
export const palettes = {
  light: {
    background: '#F4F6FB',
    surface: '#FFFFFF',
    surfaceAlt: '#E9ECF6',
    text: '#14172B',
    textMuted: '#4A4F66',
    border: '#C9CEDF',
    primary: '#3949AB',
    onPrimary: '#FFFFFF',
    primarySoft: '#DCE1FF',
    onPrimarySoft: '#1F2A7A',
    dangerSoft: '#FDE3E1',
    onDangerSoft: '#8C1D18',
    successSoft: '#DDF3E4',
    onSuccessSoft: '#14532D',
    scrim: 'rgba(10, 12, 30, 0.5)',
  },
  dark: {
    background: '#0F1220',
    surface: '#1A1E33',
    surfaceAlt: '#262B47',
    text: '#EEF0FF',
    textMuted: '#B4B9D6',
    border: '#3A4062',
    primary: '#AEB9FF',
    onPrimary: '#10163F',
    primarySoft: '#2C3566',
    onPrimarySoft: '#DCE1FF',
    dangerSoft: '#4A1F23',
    onDangerSoft: '#FFB4AB',
    successSoft: '#1F4630',
    onSuccessSoft: '#9BE3B4',
    scrim: 'rgba(0, 0, 0, 0.65)',
  },
};

export type Colors = typeof palettes.light;

export const layout = {
  // Large targets and text keep the app usable for older people.
  minTouch: 64,
  radius: 20,
  radiusLarge: 28,
  space: { xs: 4, s: 8, m: 12, l: 16, xl: 24 },
  font: { caption: 16, body: 20, bodyLarge: 22, title: 28, hero: 88 },
};

export function useTheme(): { colors: Colors; isDark: boolean } {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? palettes.dark : palettes.light, isDark };
}

export function shadow(level: number) {
  return {
    elevation: level * 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: level * 4,
    shadowOffset: { width: 0, height: level },
  };
}
