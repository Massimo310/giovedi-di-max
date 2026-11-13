// Modalità DEMO: tutto salvato nel localStorage del browser.
// Serve per provare l'app senza backend; i dati NON sono condivisi tra persone.
import type { Api } from './api';
import { DEFAULT_SETTINGS } from './api';
import { CATEGORIES } from './categories';
import { thursdayOnOrAfter, toISO } from './dates';
import type { Bar, Profile, Rating, Settings } from './types';

interface DB {
  profiles: Profile[];
  bars: Bar[];
  ratings: Rating[];
  settings: Settings;
  session: string | null;
}

const KEY = 'giovedi-di-max:demo:v1';
const uid = () => Math.random().toString(36).slice(2, 10);

function thursdayOffset(weeks: number) {
  const d = thursdayOnOrAfter(new Date());
  d.setDate(d.getDate() + weeks * 7);
  return toISO(d);
}

function seed(): DB {
  const profiles: Profile[] = [
    { id: 'max', name: 'Max', role: 'admin' },
    { id: 'luca', name: 'Luca', role: 'fedelissimo' },
    { id: 'giulia', name: 'Giulia', role: 'fedelissimo' },
    { id: 'marco', name: 'Marco', role: 'occasionale' },
    { id: 'ospite', name: 'Ospite curioso', role: 'ospite' },
  ];
  const now = new Date().toISOString();
  const mk = (id: string, name: string, address: string, w: number, foos: boolean, by: string): Bar => ({
    id, name, address, notes: '', added_by: by, scheduled_date: thursdayOffset(w), has_foosball: foos, created_at: now,
  });
  const bars = [
    mk('b1', 'Il Luppolo Ribelle', 'Via dei Mastri 12', -3, true, 'max'),
    mk('b2', 'Schiuma & Co.', 'Piazza Garibaldi 4', -2, false, 'luca'),
    mk('b3', 'The Hoppy Owl', 'Corso Italia 88', -1, true, 'giulia'),
    mk('b4', 'Birrificio del Porto', 'Lungomare 3', 0, false, 'marco'),
    mk('b5', 'La Botte Piena', 'Vicolo Stretto 7', 1, false, 'max'),
  ];
  const r = (bar_id: string, user_id: string, vals: number[], comment = ''): Rating => ({
    bar_id, user_id, comment, updated_at: now,
    scores: Object.fromEntries(CATEGORIES.map((c, i) => [c.key, vals[i]])),
  });
  const ratings = [
    r('b1', 'max', [4, 4, 5, 5, 4, 4], 'Biliardino storico, tornei epici'),
    r('b1', 'luca', [3, 4, 5, 4, 4, 3]),
    r('b1', 'marco', [5, 3, 4, 4, 3, 4]),
    r('b2', 'max', [3, 5, 2, 4, 5, 5], 'Birre artigianali top, un po’ caro'),
    r('b2', 'giulia', [2, 5, 3, 4, 4, 5]),
    r('b3', 'luca', [4, 3, 4, 3, 3, 4]),
    r('b3', 'giulia', [4, 3, 3, 4, 4, 3]),
    r('b3', 'marco', [5, 4, 5, 5, 4, 4]),
  ];
  return { profiles, bars, ratings, settings: structuredClone(DEFAULT_SETTINGS), session: null };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage non disponibile */
  }
  return seed();
}

export function createDemoApi(): Api {
  let db = load();
  const listeners = new Set<() => void>();
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* ignora */
    }
  };
  const me = () => db.profiles.find((p) => p.id === db.session) ?? null;
  const need = () => {
    const u = me();
    if (!u) throw new Error('Devi entrare prima');
    return u;
  };
  const emit = () => listeners.forEach((l) => l());

  return {
    mode: 'demo',
    async currentUser() {
      return me();
    },
    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    async signIn() {
      throw new Error('In modalità demo scegli un utente dalla lista');
    },
    async signUp(_e, _p, name) {
      const p: Profile = { id: uid(), name, role: 'ospite' };
      db.profiles.push(p);
      db.session = p.id;
      save();
      emit();
    },
    async signOut() {
      db.session = null;
      save();
      emit();
    },
    async demoLogin(id) {
      db.session = id;
      save();
      emit();
    },
    async demoReset() {
      db = seed();
      save();
      emit();
    },
    async listProfiles() {
      return structuredClone(db.profiles);
    },
    async setRole(id, role) {
      if (need().role !== 'admin') throw new Error('Solo l’admin può cambiare i ruoli');
      const p = db.profiles.find((x) => x.id === id);
      if (p) p.role = role;
      save();
    },
    async listBars() {
      return structuredClone(db.bars);
    },
    async addBar(input, scheduled_date) {
      const u = need();
      if (u.role === 'ospite') throw new Error('Gli ospiti non possono aggiungere bar');
      const bar: Bar = { ...input, id: uid(), added_by: u.id, scheduled_date, has_foosball: false, created_at: new Date().toISOString() };
      db.bars.push(bar);
      save();
      return bar;
    },
    async updateBar(id, patch) {
      if (need().role !== 'admin') throw new Error('Solo l’admin può modificare i bar');
      const b = db.bars.find((x) => x.id === id);
      if (b) Object.assign(b, patch);
      save();
    },
    async deleteBar(id) {
      if (need().role !== 'admin') throw new Error('Solo l’admin può eliminare i bar');
      db.bars = db.bars.filter((b) => b.id !== id);
      db.ratings = db.ratings.filter((r) => r.bar_id !== id);
      save();
    },
    async listRatings() {
      return structuredClone(db.ratings);
    },
    async saveRating(bar_id, scores, comment) {
      const u = need();
      if (u.role === 'ospite') throw new Error('Gli ospiti non possono votare');
      db.ratings = db.ratings.filter((r) => !(r.bar_id === bar_id && r.user_id === u.id));
      db.ratings.push({ bar_id, user_id: u.id, scores, comment, updated_at: new Date().toISOString() });
      save();
    },
    async getSettings() {
      return structuredClone(db.settings);
    },
    async saveSettings(s) {
      if (need().role !== 'admin') throw new Error('Solo l’admin può cambiare i pesi');
      db.settings = s;
      save();
    },
  };
}
