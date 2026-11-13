// Funzione server "gestione-utenti": solo il fondatore (ruolo admin) può
// creare account, reimpostare password ed eliminare persone.
// Gira su Supabase (Edge Functions) perché serve la chiave di servizio,
// che non deve mai finire nel browser.
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOGIN_DOMAIN = 'giovedi-di-max.example.com'; // deve combaciare con src/lib/api.ts
const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;
const ROLES = ['admin', 'cofounder', 'fedelissimo', 'occasionale', 'ospite'];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Chi sta chiamando?
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: who } = await admin.auth.getUser(token);
  if (!who?.user) return reply({ error: 'Devi entrare prima' }, 401);
  const { data: me } = await admin.from('profiles').select('role').eq('id', who.user.id).single();
  if (me?.role !== 'admin') return reply({ error: 'Solo il fondatore può gestire la compagnia' }, 403);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return reply({ error: 'Richiesta non valida' }, 400);
  }

  switch (body.action) {
    case 'create': {
      const username = String(body.username ?? '').trim().toLowerCase();
      const name = String(body.name ?? '').trim();
      const password = String(body.password ?? '');
      const role = ROLES.includes(body.role) ? body.role : 'ospite';
      if (!USERNAME_RE.test(username)) return reply({ error: 'Nome utente non valido' }, 400);
      if (!name || name.length > 40) return reply({ error: 'Nome non valido' }, 400);
      if (password.length < 6) return reply({ error: 'Password troppo corta (min 6)' }, 400);

      const { data, error } = await admin.auth.admin.createUser({
        email: `${username}@${LOGIN_DOMAIN}`,
        password,
        email_confirm: true,
        user_metadata: { name, username },
      });
      if (error) {
        const dup = /already|registered|exists/i.test(error.message);
        return reply({ error: dup ? 'Nome utente già usato' : error.message }, 400);
      }
      const { error: e2 } = await admin.from('profiles').update({ role, name, username }).eq('id', data.user.id);
      if (e2) return reply({ error: e2.message }, 500);
      return reply({ id: data.user.id });
    }

    case 'reset_password': {
      if (String(body.password ?? '').length < 6) return reply({ error: 'Password troppo corta (min 6)' }, 400);
      const { error } = await admin.auth.admin.updateUserById(body.id, { password: body.password });
      return error ? reply({ error: error.message }, 400) : reply({ ok: true });
    }

    case 'delete': {
      if (body.id === who.user.id) return reply({ error: 'Non puoi eliminare te stesso' }, 400);
      const { error } = await admin.auth.admin.deleteUser(body.id);
      return error ? reply({ error: error.message }, 400) : reply({ ok: true });
    }

    default:
      return reply({ error: 'Azione sconosciuta' }, 400);
  }
});
