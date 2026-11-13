# 🍺 Il Giovedì di Max

Ogni giovedì un bar nuovo. Gli amici propongono i bar, l'app li mette in calendario
in automatico, e dopo la serata tutti votano. La schiuma decide.

## Cosa fa

- **Calendario dei giovedì**: chi propone un bar lo vede programmato automaticamente nel primo giovedì libero.
- **Voti da 1 a 10 boccali** per categoria: Prezzo, Location, Intrattenimento, Mood, Personale, Qualità birra.
- **Bonus biliardino ⚽**: il fondatore segna i bar col biliardino, che prendono punti extra (valore regolabile).
- **Voti pesati per ruolo** (pesi regolabili dalla tab Gestione):
  | Ruolo | Può fare | Peso voto (default) |
  |---|---|---|
  | Fondatore | tutto: calendario, bar, account, pesi | ×2 |
  | Fedelissimo | proporre bar, votare | ×2 |
  | Occasionale | proporre bar, votare | ×1 |
  | Ospite | solo guardare | – |
- **Classifica** con media pesata + bonus.
- **Account creati dal fondatore**: niente registrazione libera. Il fondatore crea nome utente e
  password per ogni amico dalla tab Gestione; ognuno può poi cambiarsi la password dal profilo (👤).

## Modalità demo vs online

Senza configurazione l'app parte in **modalità demo**: utenti finti, dati salvati solo nel browser.

Per usarla davvero serve **Supabase** (gratuito), che fornisce database e login.

### 1. Database
1. Crea un progetto su [supabase.com](https://supabase.com) (regione: Europe).
2. *SQL Editor → New query*: incolla tutto [`supabase/schema.sql`](supabase/schema.sql) → *Run*.

### 2. Funzione per creare gli account
1. *Edge Functions → Deploy a new function → Via Editor*.
2. Nome: **`gestione-utenti`** (esattamente così).
3. Incolla il contenuto di [`supabase/functions/gestione-utenti/index.ts`](supabase/functions/gestione-utenti/index.ts) → *Deploy*.

### 3. Chiudi le iscrizioni libere
*Authentication → Sign In / Providers*: disattiva **Allow new users to sign up**
(gli account li crea solo il fondatore).

### 4. Il tuo account da fondatore
1. *Authentication → Users → Add user → Create new user*
   - email: `max@giovedi-di-max.example.com` (così entri col nome utente **max**)
   - password a scelta, spunta **Auto Confirm User**
2. Nel *SQL Editor*:
   ```sql
   update public.profiles set role = 'admin', name = 'Max' where username = 'max';
   ```

### 5. Collega l'app
1. *Project Settings → API*: copia **Project URL** e la chiave **anon / publishable**.
2. Su GitHub: *Settings → Secrets and variables → Actions → Variables* e crea
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Tab *Actions* → *Pubblica su GitHub Pages* → *Run workflow*.

Fatto: entra con `max`, vai su **Gestione** e crea gli account degli amici.

## Pubblicazione

Ad ogni push su `main` la GitHub Action costruisce e pubblica su GitHub Pages
(*Settings → Pages → Source: GitHub Actions*).

## Sviluppo in locale

```bash
npm install
npm run dev
```

Per collegarsi a Supabase in locale copia `.env.example` in `.env` e compila i valori.

## Dove mettere le mani

- Categorie di voto: `src/lib/categories.ts`
- Scala dei voti (1–10): `MAX_VOTE` in `src/lib/types.ts`
- Calcolo del punteggio: `src/lib/scoring.ts`
- Programmazione automatica: `src/lib/dates.ts` (`nextFreeThursday`)
- Stile birroso: `src/styles.css`
