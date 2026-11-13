-- =====================================================================
--  Il Giovedì di Max — schema database Supabase
--  Da incollare in Supabase > SQL Editor > New query > Run
-- =====================================================================

create type public.user_role as enum ('admin', 'cofounder', 'fedelissimo', 'occasionale', 'ospite');

-- Profili utente (uno per account)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  username text unique,
  role public.user_role not null default 'ospite',
  created_at timestamptz not null default now()
);

-- Bar
create table public.bars (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  address text not null default '',
  notes text not null default '',
  added_by uuid references public.profiles on delete set null,
  scheduled_date date unique,
  has_foosball boolean not null default false,
  created_at timestamptz not null default now()
);

-- Voti: un voto per persona per bar. "scores" è un JSON {categoria: 1..10}
create table public.ratings (
  bar_id uuid references public.bars on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  scores jsonb not null check (
    jsonb_typeof(scores) = 'object'
    and not jsonb_path_exists(scores, '$.* ? (@.type() != "number" || @ < 1 || @ > 10)')
  ),
  comment text not null default '',
  updated_at timestamptz not null default now(),
  primary key (bar_id, user_id)
);

-- Impostazioni (una sola riga)
create table public.settings (
  id int primary key default 1 check (id = 1),
  weights jsonb not null default '{"admin":2,"cofounder":2,"fedelissimo":2,"occasionale":1}',
  foosball_bonus numeric not null default 1
);
insert into public.settings (id) values (1);

-- ---------- funzioni di supporto ----------
create or replace function public.my_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Crea il profilo automaticamente quando nasce un account (ruolo: ospite).
-- Gli account li crea il fondatore dall'app (funzione "gestione-utenti").
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1))
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Solo l'admin può cambiare i ruoli (anche via update diretto)
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() è null per SQL Editor e funzione server: lì è permesso
  if new.role is distinct from old.role and auth.uid() is not null
     and coalesce(public.my_role()::text, '') <> 'admin' then
    raise exception 'Solo l''admin può cambiare i ruoli';
  end if;
  return new;
end $$;

create trigger profiles_protect_role
  before update on public.profiles for each row execute function public.protect_role();

-- Le funzioni interne non devono essere richiamabili dall'esterno
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_role() from public, anon, authenticated;
revoke execute on function public.my_role() from public, anon;
grant execute on function public.my_role() to authenticated;

-- ---------- sicurezza (Row Level Security) ----------
alter table public.profiles enable row level security;
alter table public.bars enable row level security;
alter table public.ratings enable row level security;
alter table public.settings enable row level security;

-- Tutti gli utenti registrati vedono tutto
create policy "lettura profili" on public.profiles for select to authenticated using (true);
create policy "lettura bar" on public.bars for select to authenticated using (true);
create policy "lettura voti" on public.ratings for select to authenticated using (true);
create policy "lettura impostazioni" on public.settings for select to authenticated using (true);

-- Profili: ognuno modifica il proprio nome, l'admin tutti
create policy "modifica profilo" on public.profiles for update to authenticated
  using (id = auth.uid() or public.my_role() = 'admin');

-- Bar: chi non è ospite può proporre, solo l'admin modifica/elimina
create policy "proponi bar" on public.bars for insert to authenticated
  with check (public.my_role() in ('admin', 'cofounder', 'fedelissimo', 'occasionale') and added_by = auth.uid());
create policy "admin modifica bar" on public.bars for update to authenticated using (public.my_role() = 'admin');
create policy "admin elimina bar" on public.bars for delete to authenticated using (public.my_role() = 'admin');

-- Voti: chi non è ospite vota il proprio, solo per bar già visitati
create policy "vota" on public.ratings for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.my_role() in ('admin', 'cofounder', 'fedelissimo', 'occasionale')
    and exists (select 1 from public.bars b where b.id = bar_id and b.scheduled_date <= current_date)
  );
create policy "cambia voto" on public.ratings for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.my_role() <> 'ospite');
create policy "admin elimina voti" on public.ratings for delete to authenticated
  using (user_id = auth.uid() or public.my_role() = 'admin');

-- Impostazioni: solo admin
create policy "admin impostazioni" on public.settings for update to authenticated using (public.my_role() = 'admin');

-- =====================================================================
--  PRIMO ACCESSO DEL FONDATORE
--  1. Authentication > Users > Add user > Create new user
--       email:    max@giovedi-di-max.example.com   (così entri con "max")
--       password: quella che vuoi  ·  spunta "Auto Confirm User"
--  2. Poi esegui qui sotto (dal SQL Editor il controllo sui ruoli è bypassato):
--
--     update public.profiles set role = 'admin', name = 'Max'
--     where username = 'max';
-- =====================================================================
