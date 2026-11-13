import type { Bar } from './types';

export const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());

export const isThursday = (iso: string) => fromISO(iso).getDay() === 4;

/** Primo giovedì >= data indicata */
export function thursdayOnOrAfter(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + ((4 - r.getDay() + 7) % 7));
  return r;
}

/**
 * Programmazione automatica: il nuovo bar va nel primo giovedì libero
 * a partire da oggi (incluso, se oggi è giovedì).
 */
export function nextFreeThursday(bars: Bar[], from = new Date()): string {
  const taken = new Set(bars.map((b) => b.scheduled_date).filter(Boolean));
  let d = thursdayOnOrAfter(from);
  while (taken.has(toISO(d))) d.setDate(d.getDate() + 7);
  return toISO(d);
}

const fmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });
export const prettyDate = (iso: string | null) => (iso ? fmt.format(fromISO(iso)) : 'Da programmare');
export const shortDate = (iso: string | null) => (iso ? fmtShort.format(fromISO(iso)) : '—');

/** Il bar è "visitato" (votabile) se la serata è oggi o nel passato */
export const isVisited = (b: Bar) => !!b.scheduled_date && b.scheduled_date <= todayISO();
