import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

import { loadThemeChoice, saveThemeChoice, ThemeChoice } from './storage';

// Appearance.setColorScheme overrides the phone's setting for the whole app, so
// useTheme() and the status bar follow it without extra wiring. 'unspecified' means "follow the phone".
function applyThemeChoice(choice: ThemeChoice) {
  Appearance.setColorScheme(choice === 'system' ? 'unspecified' : choice);
}

export function useThemeChoice(): [ThemeChoice, (choice: ThemeChoice) => void] {
  const [choice, setChoice] = useState<ThemeChoice>('system');

  useEffect(() => {
    loadThemeChoice()
      .then((saved) => {
        applyThemeChoice(saved);
        setChoice(saved);
      })
      .catch((error) => console.error('Could not load theme', error));
  }, []);

  function choose(next: ThemeChoice) {
    applyThemeChoice(next);
    setChoice(next);
    saveThemeChoice(next).catch((error) =>
      console.error('Could not save theme', error),
    );
  }

  return [choice, choose];
}
