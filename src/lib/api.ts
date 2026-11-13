import type { Bar, NewBar, NewUser, Profile, Rating, Role, Scores, Settings } from './types';
import { createDemoApi } from './demoApi';
import { createSupabaseApi } from './supabaseApi';

export interface Api {
  mode: 'demo' | 'supabase';
  // sessione
  currentUser(): Promise<Profile | null>;
  onAuthChange(cb: () => void): () => void;
  /** login = nome utente oppure email */
  signIn(login: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  changeMyPassword(password: string): Promise<void>;
  /** solo demo: entra come uno degli utenti finti */
  demoLogin?(userId: string): Promise<void>;
  demoReset?(): Promise<void>;
  // dati
  listProfiles(): Promise<Profile[]>;
  setRole(userId: string, role: Role): Promise<void>;
  // gestione compagnia (solo fondatore)
  createUser(u: NewUser): Promise<void>;
  resetUserPassword(userId: string, password: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  listBars(): Promise<Bar[]>;
  addBar(input: NewBar, scheduled_date: string): Promise<Bar>;
  updateBar(id: string, patch: Partial<Omit<Bar, 'id'>>): Promise<void>;
  deleteBar(id: string): Promise<void>;
  listRatings(): Promise<Rating[]>;
  saveRating(barId: string, scores: Scores, comment: string): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;
}

export const DEFAULT_SETTINGS: Settings = {
  weights: { admin: 2, fedelissimo: 2, occasionale: 1 },
  foosball_bonus: 1,
};

/** Gli amici entrano con un nome utente: dietro le quinte diventa questa email finta */
export const LOGIN_DOMAIN = 'giovedi-di-max.example.com';
export const loginToEmail = (login: string) => {
  const l = login.trim().toLowerCase();
  return l.includes('@') ? l : `${l}@${LOGIN_DOMAIN}`;
};
export const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const api: Api = url && key ? createSupabaseApi(url, key) : createDemoApi();
