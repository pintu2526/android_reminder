const MAX_MINUTES = 24 * 60;

// Whole minutes from 1 to 24 hours; anything else is null.
export function parseMinutes(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const minutes = Number(text);
  return minutes >= 1 && minutes <= MAX_MINUTES ? minutes : null;
}

// A timer can lose a minute only if it would still ring in the future afterwards.
export function canSubtractMinute(ringAt: Date, now = Date.now()): boolean {
  return ringAt.getTime() - 60_000 > now;
}

const pad = (value: number) => String(value).padStart(2, '0');

// Rounds up so a fresh 2-minute timer reads 02:00, not 01:59.
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const clock = `${pad(minutes)}:${pad(totalSeconds % 60)}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}
