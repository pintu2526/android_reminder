# Design

The app is meant to be used by older people as well, so the design is large, plain and labelled. By default it follows the phone's light or dark setting, and the Menu has a Theme choice (Dark, Light or Phone) to override it.

## Rules

- Every control is at least 64dp tall (the Menu button 56dp). Nothing tappable is smaller than 48dp.
- Body text is 20sp or larger. The countdown is 88sp. Text follows the phone's font size; only the countdown is capped (1.4x) so it never overflows.
- Every control has a visible text label. There are no icon-only buttons. Every control also has an accessibility label.
- Status is never shown by colour alone: permission rows say "✓ On" or "⚠ Off", and errors start with "⚠".
- Every text and background colour pair must keep a contrast ratio of at least 4.5:1, in both themes. `src/__tests__/theme.test.ts` checks this from the colour values.
- Motion is small (a fade and slide, a press scale) and is skipped when the phone's "reduce motion" setting is on.

## Where things live

- `src/ThemePicker.tsx` and `src/useThemeChoice.ts`: the Theme buttons in the Menu, and the hook that saves the choice and applies it with `Appearance.setColorScheme`. `useTheme()` and the status bar follow it automatically.
- `src/ui/theme.ts`: the two colour palettes, the size constants (`layout`) and `useTheme()`. Screens never use hex colours directly. To change a colour or size, change it here and run the tests.
- `src/ui/Button.tsx`: one button with three looks: `primary` (accent), `soft` (neutral) and `danger` (red tint).
- `src/ui/Dialog.tsx`: the shared popup shell. Both dialogs use it.

## Layout

The preset list scrolls. The timer panel (countdown, −1 and +N buttons, Reset) is docked at the bottom of the screen, so the countdown is always visible and the +N buttons never move while the user taps them. Reset is always drawn (greyed out until a timer exists) for the same reason.

## Palette

Calm blue-indigo accent. Light: white cards on a pale blue-grey page. Dark: deep navy page with lighter indigo accents.
