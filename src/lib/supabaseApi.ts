// Modalità ONLINE: dati condivisi su Supabase (database + login).
// Le regole di sicurezza vere stanno nel database (vedi supabase/schema.sql).
import { createClient, FunctionsHttpError } from '@supabase/supabase-js';
import type { Api } from './api';
import { DEFAULT_SETTINGS, loginToEmail } from './api';
import type { Bar, Profile, Rating, Settings } from './types';

const PROFILE_COLS = 'id,name,role,username';

export function createSupabaseApi(url: string, key: string): Api {
  const sb = createClient(url, key);

  const check = <T>(res: { data: T; error: { message: string } | null }): T => {
    if (res.error) throw new Error(res.error.message);
    return res.data;
  };
  const userId = async () => {
    const { data } = await sb.auth.getUser();
    if (!data.user) throw new Error('Devi entrare prima');
    return data.user.id;
  };
  // Chiama la funzione server "gestione-utenti" (crea/elimina account, reset password)
  const manage = async (body: Record<string, unknown>) => {
    const { error } = await sb.functions.invoke('gestione-utenti', { body });
    if (error) {
      let msg = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          msg = (await error.context.json()).error ?? msg;
        } catch {
          /* risposta non JSON */
        }
      }
      throw new Error(msg);
    }
  };

  return {
    mode: 'supabase',
    async currentUser() {
      const { data } = await sb.auth.getSession();
      const id = data.session?.user.id;
      if (!id) return null;
      const res = await sb.from('profiles').select(PROFILE_COLS).eq('id', id).maybeSingle();
      return (check(res) as Profile | null) ?? null;
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') setTimeout(cb, 0);
      });
      return () => data.subscription.unsubscribe();
    },
    async signIn(login, password) {
      const { error } = await sb.auth.signInWithPassword({ email: loginToEmail(login), password });
      if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Nome utente o password sbagliati' : error.message);
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async changeMyPassword(password) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw new Error(error.message);
    },
    async listProfiles() {
      return check(await sb.from('profiles').select(PROFILE_COLS).order('name')) as Profile[];
    },
    async setRole(id, role) {
      check(await sb.from('profiles').update({ role }).eq('id', id));
    },
    async createUser(u) {
      await manage({ action: 'create', ...u });
    },
    async resetUserPassword(id, password) {
      await manage({ action: 'reset_password', id, password });
    },
    async deleteUser(id) {
      await manage({ action: 'delete', id });
    },
    async listBars() {
      return check(await sb.from('bars').select('*').order('scheduled_date', { nullsFirst: false })) as Bar[];
    },
    async addBar(input, scheduled_date) {
      const added_by = await userId();
      return check(await sb.from('bars').insert({ ...input, scheduled_date, added_by }).select().single()) as Bar;
    },
    async updateBar(id, patch) {
      check(await sb.from('bars').update(patch).eq('id', id));
    },
    async deleteBar(id) {
      check(await sb.from('bars').delete().eq('id', id));
    },
    async listRatings() {
      return check(await sb.from('ratings').select('bar_id,user_id,scores,comment,updated_at')) as Rating[];
    },
    async saveRating(bar_id, scores, comment) {
      const user_id = await userId();
      check(
        await sb
          .from('ratings')
          .upsert({ bar_id, user_id, scores, comment, updated_at: new Date().toISOString() }, { onConflict: 'bar_id,user_id' }),
      );
    },
    async getSettings() {
      const row = check(await sb.from('settings').select('weights,foosball_bonus').eq('id', 1).maybeSingle());
      return (row as Settings | null) ?? DEFAULT_SETTINGS;
    },
    async saveSettings(s) {
      check(await sb.from('settings').update(s).eq('id', 1));
    },
  };
}
