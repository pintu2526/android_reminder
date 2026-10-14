const MAX_MINUTES = 24 * 60;

export function parseMinutes(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  const minutes = Number(text);
  return minutes >= 1 && minutes <= MAX_MINUTES ? minutes : null;
}
