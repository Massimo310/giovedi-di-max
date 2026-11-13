import { useState } from 'react';
import { api } from '../lib/api';
import { nextFreeThursday, prettyDate } from '../lib/dates';
import { canAddBar } from '../lib/types';
import { useStore } from '../store';

export default function AddBar() {
  const { me, bars, run } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [done, setDone] = useState<string | null>(null);

  if (!me || !canAddBar(me.role)) return null;
  const nextDate = nextFreeThursday(bars);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const date = nextFreeThursday(bars);
    const ok = await run(() => api.addBar({ name: name.trim(), address: address.trim(), notes: notes.trim() }, date));
    if (ok) {
      setDone(`${name} è in calendario per ${prettyDate(date)} 🎉`);
      setName('');
      setAddress('');
      setNotes('');
      setOpen(false);
    }
  };

  return (
    <section className="card add-bar">
      {!open ? (
        <div className="add-row">
          <div>
            <h2>Proponi un bar</h2>
            <p className="muted">Il prossimo giovedì libero è <strong>{prettyDate(nextDate)}</strong>.</p>
            {done && <p className="ok">{done}</p>}
          </div>
          <button className="btn primary" onClick={() => { setOpen(true); setDone(null); }}>＋ Aggiungi bar</button>
        </div>
      ) : (
        <form onSubmit={submit} className="form">
          <h2>Nuovo bar</h2>
          <label>Nome del bar<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoFocus /></label>
          <label>Indirizzo<input value={address} onChange={(e) => setAddress(e.target.value)} maxLength={120} placeholder="Via, città" /></label>
          <label>Note<textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={400} rows={2} placeholder="Perché ci dovremmo andare?" /></label>
          <p className="muted">Verrà programmato in automatico per <strong>{prettyDate(nextDate)}</strong>.</p>
          <div className="row">
            <button className="btn primary">Metti in calendario</button>
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Annulla</button>
          </div>
        </form>
      )}
    </section>
  );
}
