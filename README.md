# 🍺 Il Giovedì di Max

Ogni giovedì un bar nuovo. Gli amici propongono i bar, l'app li mette in calendario
in automatico, e dopo la serata tutti votano. La schiuma decide.

## Cosa fa

- **Calendario dei giovedì**: chi propone un bar lo vede programmato automaticamente nel primo giovedì libero.
- **Voti per categoria** (da 1 a 5 boccali): Prezzo, Location, Intrattenimento, Mood, Personale, Qualità birra.
- **Bonus biliardino ⚽**: l'admin segna i bar col biliardino, che prendono punti extra.
- **Voti pesati per ruolo**:
  | Ruolo | Può fare | Peso voto (default) |
  |---|---|---|
  | Mastro Birraio (admin) | tutto: calendario, bar, utenti, pesi | ×2 |
  | Fedelissimo | proporre bar, votare | ×2 |
  | Occasionale | proporre bar, votare | ×1 |
  | Ospite | solo guardare | – |
- **Classifica** con media pesata + bonus.

## Modalità demo vs online

Senza configurazione l'app parte in **modalità demo**: utenti finti, dati salvati solo nel browser.
Perfetta per provarla e vedere com'è.

Per usarla davvero con gli amici serve **Supabase** (gratuito), che fornisce database e login:

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Apri *SQL Editor*, incolla il contenuto di [`supabase/schema.sql`](supabase/schema.sql) ed esegui.
3. In *Project Settings → API* copia **Project URL** e **anon public key**.
4. Su GitHub: *Settings → Secrets and variables → Actions → Variables* e crea
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` con quei valori.
5. Rilancia la pubblicazione (tab *Actions*), registrati nell'app, poi nel SQL Editor:
   ```sql
   update public.profiles set role = 'admin' where name = 'Max';
   ```
6. Dalla tab *Gestione* promuovi gli amici a Fedelissimo / Occasionale.

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
- Calcolo del punteggio: `src/lib/scoring.ts`
- Programmazione automatica: `src/lib/dates.ts` (`nextFreeThursday`)
- Stile birroso: `src/styles.css`
