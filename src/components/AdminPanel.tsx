import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { isThursday, prettyDate } from '../lib/dates';
import { ROLE_LABEL, type Settings } from '../lib/types';
import Crew from './Crew';
import { useStore } from '../store';

export default function AdminPanel({ onOpen }: { onOpen: (id: string) => void }) {
  const { bars, settings, run } = useStore();
  const [draft, setDraft] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(settings), [settings]);

  const sorted = [...bars].sort((a, b) => (a.scheduled_date ?? '9999').localeCompare(b.scheduled_date ?? '9999'));

  /** Sposta un bar a una nuova data; se è occupata propone lo scambio */
  const moveBar = async (id: string, date: string | null) => {
    const bar = bars.find((x) => x.id === id);
    if (!bar || date === bar.scheduled_date) return;
    if (date && !isThursday(date) && !confirm(`${prettyDate(date)} non è un giovedì. Va bene lo stesso?`)) return;
    const other = date ? bars.find((x) => x.id !== id && x.scheduled_date === date) : undefined;
    if (other) {
      if (!confirm(`Il ${prettyDate(date)} c'è già ${other.name}. Scambio le date dei due bar?`)) return;
      await run(async () => {
        await api.updateBar(other.id, { scheduled_date: null });
        await api.updateBar(id, { scheduled_date: date });
        await api.updateBar(other.id, { scheduled_date: bar.scheduled_date });
      });
      return;
    }
    await run(() => api.updateBar(id, { scheduled_date: date }));
  };
  const setW = (k: keyof Settings['weights'], v: number) => { setDraft({ ...draft, weights: { ...draft.weights, [k]: v } }); setSaved(false); };

  return (
    <div className="admin">
      <section className="card">
        <h2>Peso dei voti</h2>
        <p className="muted">Quanto conta il voto di ciascun gruppo nella media.</p>
        <div className="weights">
          {(['admin', 'cofounder', 'fedelissimo', 'occasionale'] as const).map((r) => (
            <label key={r}>
              {ROLE_LABEL[r]}
              <input type="number" min={0} max={10} step={0.5} value={draft.weights[r] ?? 2} onChange={(e) => setW(r, Number(e.target.value))} />
            </label>
          ))}
          <label>
            ⚽ Bonus biliardino
            <input type="number" min={0} max={5} step={0.1} value={draft.foosball_bonus}
              onChange={(e) => { setDraft({ ...draft, foosball_bonus: Number(e.target.value) }); setSaved(false); }} />
          </label>
        </div>
        <div className="row">
          <button className="btn primary" onClick={async () => setSaved(await run(() => api.saveSettings(draft)))}>Salva pesi</button>
          {saved && <span className="ok">Salvato</span>}
        </div>
      </section>

      <Crew />

      <section className="card">
        <h2>Calendario dei bar</h2>
        <p className="muted small">Cambia la data direttamente qui. Se il giorno è già occupato, puoi scambiare i due bar.</p>
        <ul className="all-bars">
          {sorted.map((b) => (
            <li key={b.id}>
              <span className="bar-cell">
                <button className="link" onClick={() => onOpen(b.id)}>{b.name}</button>
                <span className="muted small">{prettyDate(b.scheduled_date)}</span>
              </span>
              <input
                type="date"
                className="date-input"
                aria-label={`Data di ${b.name}`}
                value={b.scheduled_date ?? ''}
                onChange={(e) => moveBar(b.id, e.target.value || null)}
              />
              <label className="toggle" title="Biliardino">
                <input type="checkbox" checked={b.has_foosball} onChange={() => run(() => api.updateBar(b.id, { has_foosball: !b.has_foosball }))} />
                ⚽
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
