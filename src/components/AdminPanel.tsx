import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { prettyDate } from '../lib/dates';
import { ROLE_LABEL, type Settings } from '../lib/types';
import Crew from './Crew';
import { useStore } from '../store';

export default function AdminPanel({ onOpen }: { onOpen: (id: string) => void }) {
  const { bars, settings, run } = useStore();
  const [draft, setDraft] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(settings), [settings]);

  const sorted = [...bars].sort((a, b) => (b.scheduled_date ?? '9999').localeCompare(a.scheduled_date ?? '9999'));
  const setW = (k: keyof Settings['weights'], v: number) => { setDraft({ ...draft, weights: { ...draft.weights, [k]: v } }); setSaved(false); };

  return (
    <div className="admin">
      <section className="card">
        <h2>Peso dei voti</h2>
        <p className="muted">Quanto conta il voto di ciascun gruppo nella media.</p>
        <div className="weights">
          {(['admin', 'fedelissimo', 'occasionale'] as const).map((r) => (
            <label key={r}>
              {ROLE_LABEL[r]}
              <input type="number" min={0} max={10} step={0.5} value={draft.weights[r]} onChange={(e) => setW(r, Number(e.target.value))} />
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
        <h2>Tutti i bar</h2>
        <ul className="all-bars">
          {sorted.map((b) => (
            <li key={b.id}>
              <button className="link" onClick={() => onOpen(b.id)}>{b.name}</button>
              <span className="muted">{prettyDate(b.scheduled_date)}</span>
              <label className="toggle">
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
