import { CATEGORIES } from './categories';
import type { Bar, Profile, Rating, Role, Settings } from './types';

export interface BarScore {
  bar: Bar;
  categories: Record<string, number | null>; // media pesata per categoria
  base: number | null; // media delle categorie
  bonus: number;
  total: number | null;
  votes: number;
}

export function weightOf(role: Role | undefined, s: Settings): number {
  if (!role || role === 'ospite') return 0;
  return s.weights[role] ?? (role === 'occasionale' ? 1 : 2);
}

/**
 * Per ogni categoria: media pesata dei voti in base al ruolo di chi vota.
 * Punteggio finale = media delle categorie + bonus biliardino (se presente).
 */
export function scoreBar(bar: Bar, ratings: Rating[], profiles: Profile[], s: Settings): BarScore {
  const roleById = new Map(profiles.map((p) => [p.id, p.role]));
  const mine = ratings.filter((r) => r.bar_id === bar.id);
  const categories: Record<string, number | null> = {};

  for (const c of CATEGORIES) {
    let sum = 0;
    let wsum = 0;
    for (const r of mine) {
      const v = r.scores[c.key];
      const w = weightOf(roleById.get(r.user_id), s);
      if (typeof v === 'number' && w > 0) {
        sum += v * w;
        wsum += w;
      }
    }
    categories[c.key] = wsum > 0 ? sum / wsum : null;
  }

  const vals = Object.values(categories).filter((v): v is number => v !== null);
  const base = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  const bonus = bar.has_foosball ? s.foosball_bonus : 0;
  return { bar, categories, base, bonus, total: base === null ? null : base + bonus, votes: mine.length };
}

export const fmtScore = (n: number | null) => (n === null ? '–' : n.toFixed(2));
