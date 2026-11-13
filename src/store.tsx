import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, DEFAULT_SETTINGS } from './lib/api';
import type { Bar, Profile, Rating, Settings } from './lib/types';

interface State {
  me: Profile | null;
  profiles: Profile[];
  bars: Bar[];
  ratings: Rating[];
  settings: Settings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  /** esegue un'azione, gestisce l'errore e ricarica i dati */
  run: (fn: () => Promise<unknown>) => Promise<boolean>;
  setError: (e: string | null) => void;
}

const Ctx = createContext<State | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bars, setBars] = useState<Bar[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const user = await api.currentUser();
      setMe(user);
      if (user) {
        const [p, b, r, s] = await Promise.all([api.listProfiles(), api.listBars(), api.listRatings(), api.getSettings()]);
        setProfiles(p);
        setBars(b);
        setRatings(r);
        setSettings(s);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return api.onAuthChange(() => refresh());
  }, [refresh]);

  const run = useCallback(
    async (fn: () => Promise<unknown>) => {
      try {
        setError(null);
        await fn();
        await refresh();
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      }
    },
    [refresh],
  );

  return (
    <Ctx.Provider value={{ me, profiles, bars, ratings, settings, loading, error, refresh, run, setError }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider mancante');
  return s;
};
