import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CATEGORIES } from '../lib/categories';
import { isThursday, isVisited, prettyDate } from '../lib/dates';
import { fmtScore, scoreBar, weightOf } from '../lib/scoring';
import { ROLE_LABEL, canVote, isAdmin, type Scores } from '../lib/types';
import { useStore } from '../store';
import MugRating from './MugRating';
import Pint from './Pint';

export default function BarDetail({ barId, onClose }: { barId: string; onClose: () => void }) {
  const { me, bars, ratings, profiles, settings, run } = useStore();
  const bar = bars.find((b) => b.id === barId);
  const mine = ratings.find((r) => r.bar_id === barId && r.user_id === me?.id);
  const [scores, setScores] = useState<Scores>(mine?.scores ?? {});
  const [comment, setComment] = useState(mine?.comment ?? '');
  const [saved, setSaved] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!bar || !me) return null;
  const s = scoreBar(bar, ratings, profiles, settings);
  const visited = isVisited(bar);
  const admin = isAdmin(me.role);
  const others = ratings.filter((r) => r.bar_id === barId);
  const nameOf = (id: string | null) => profiles.find((p) => p.id === id)?.name ?? '—';
  const complete = CATEGORIES.every((c) => scores[c.key]);

  const saveVote = async () => {
    if (await run(() => api.saveRating(bar.id, scores, comment.trim()))) setSaved(true);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal aria-label={bar.name} onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Chiudi">✕</button>

        {!edit ? (
          <header className="detail-head">
            <Pint value={s.total} size={64} />
            <div>
              <h2>{bar.name}</h2>
              <p className="muted">{prettyDate(bar.scheduled_date)}{bar.address && <> · {bar.address}</>}</p>
              <p className="muted small">Proposto da {nameOf(bar.added_by)}</p>
              <div className="row">
                {bar.has_foosball && <span className="chip foos">⚽ Biliardino +{settings.foosball_bonus}</span>}
                {visited && <span className="chip">Punteggio {fmtScore(s.total)}</span>}
              </div>
            </div>
          </header>
        ) : (
          <EditBar barId={bar.id} onDone={() => setEdit(false)} />
        )}
        {bar.notes && !edit && <p className="notes">“{bar.notes}”</p>}

        {admin && !edit && (
          <div className="row admin-actions">
            <button className="btn ghost sm" onClick={() => setEdit(true)}>✏️ Modifica</button>
            <button className="btn ghost sm" onClick={() => run(() => api.updateBar(bar.id, { has_foosball: !bar.has_foosball }))}>
              {bar.has_foosball ? 'Togli biliardino' : '⚽ Ha il biliardino'}
            </button>
            <button
              className="btn danger sm"
              onClick={() => confirm(`Eliminare ${bar.name} e tutti i suoi voti?`) && run(() => api.deleteBar(bar.id)).then(onClose)}
            >
              Elimina
            </button>
          </div>
        )}

        {visited && (
          <section>
            <h3>Pagella</h3>
            <div className="cats">
              {CATEGORIES.map((c) => {
                const v = s.categories[c.key];
                return (
                  <div key={c.key} className="cat">
                    <span>{c.emoji} {c.label}</span>
                    <span className="bar-track"><span className="bar-fill" style={{ width: `${((v ?? 0) / 5) * 100}%` }} /></span>
                    <strong>{fmtScore(v)}</strong>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {visited && canVote(me.role) && (
          <section className="vote">
            <h3>{mine ? 'Il tuo voto (puoi cambiarlo)' : 'Dai il tuo voto'}</h3>
            {CATEGORIES.map((c) => (
              <div key={c.key} className="vote-row">
                <span>{c.emoji} {c.label}</span>
                <MugRating value={scores[c.key] ?? 0} onChange={(v) => { setScores({ ...scores, [c.key]: v }); setSaved(false); }} />
              </div>
            ))}
            <textarea placeholder="Un commento? (facoltativo)" value={comment} maxLength={300} rows={2}
              onChange={(e) => { setComment(e.target.value); setSaved(false); }} />
            <div className="row">
              <button className="btn primary" disabled={!complete} onClick={saveVote}>
                {complete ? 'Salva voto' : 'Vota tutte le categorie'}
              </button>
              {saved && <span className="ok">Salvato! Cin cin 🍻</span>}
            </div>
            <p className="muted small">Il tuo voto pesa ×{weightOf(me.role, settings)} ({ROLE_LABEL[me.role]}).</p>
          </section>
        )}

        {!visited && <p className="muted">Si potrà votare dalla sera di {prettyDate(bar.scheduled_date)}.</p>}

        {visited && others.length > 0 && (
          <section>
            <h3>Chi ha votato</h3>
            <ul className="voters">
              {others.map((r) => {
                const p = profiles.find((x) => x.id === r.user_id);
                const avg = Object.values(r.scores).reduce((a, b) => a + b, 0) / (Object.values(r.scores).length || 1);
                return (
                  <li key={r.user_id}>
                    <strong>{p?.name ?? '—'}</strong>
                    {p && <span className={`badge role-${p.role}`}>{ROLE_LABEL[p.role]}</span>}
                    <span className="muted">{avg.toFixed(1)}</span>
                    {r.comment && <em className="comment">“{r.comment}”</em>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function EditBar({ barId, onDone }: { barId: string; onDone: () => void }) {
  const { bars, run } = useStore();
  const bar = bars.find((b) => b.id === barId)!;
  const [name, setName] = useState(bar.name);
  const [address, setAddress] = useState(bar.address);
  const [notes, setNotes] = useState(bar.notes);
  const [date, setDate] = useState(bar.scheduled_date ?? '');
  const clash = date && bars.find((b) => b.id !== barId && b.scheduled_date === date);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(() => api.updateBar(barId, { name: name.trim(), address: address.trim(), notes: notes.trim(), scheduled_date: date || null }));
    if (ok) onDone();
  };

  return (
    <form className="form" onSubmit={save}>
      <h2>Modifica bar</h2>
      <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
      <label>Indirizzo<input value={address} onChange={(e) => setAddress(e.target.value)} /></label>
      <label>Note<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></label>
      <label>
        Data
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>
      {date && !isThursday(date) && <p className="warn">Attenzione: non è un giovedì.</p>}
      {clash && <p className="warn">Quel giorno c'è già {clash.name}.</p>}
      <div className="row">
        <button className="btn primary">Salva</button>
        <button type="button" className="btn ghost" onClick={onDone}>Annulla</button>
      </div>
    </form>
  );
}
