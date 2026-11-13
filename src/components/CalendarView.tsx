import { useMemo, useState } from 'react';
import { isVisited, prettyDate, toISO, todayISO } from '../lib/dates';
import { fmtScore, scoreBar } from '../lib/scoring';
import { useStore } from '../store';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const monthFmt = new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' });

export default function CalendarView({ onOpen }: { onOpen: (id: string) => void }) {
  const { bars, ratings, profiles, settings } = useStore();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const today = todayISO();

  const byDate = useMemo(() => {
    const m = new Map<string, typeof bars>();
    for (const b of bars) if (b.scheduled_date) m.set(b.scheduled_date, [...(m.get(b.scheduled_date) ?? []), b]);
    return m;
  }, [bars]);

  const cells = useMemo(() => {
    const first = new Date(cursor);
    const offset = (first.getDay() + 6) % 7; // lunedì = 0
    const start = new Date(first);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const upcoming = bars
    .filter((b) => b.scheduled_date && b.scheduled_date >= today)
    .sort((a, b) => a.scheduled_date!.localeCompare(b.scheduled_date!))
    .slice(0, 4);
  const unscheduled = bars.filter((b) => !b.scheduled_date);

  const move = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <>
      {upcoming.length > 0 && (
        <section className="next-up">
          {upcoming.map((b, i) => (
            <button key={b.id} className={`next-card ${i === 0 ? 'hero' : ''}`} onClick={() => onOpen(b.id)}>
              <span className="next-when">{i === 0 ? (b.scheduled_date === today ? 'STASERA' : 'PROSSIMO GIOVEDÌ') : prettyDate(b.scheduled_date)}</span>
              <strong>{b.name}</strong>
              {i === 0 && <span className="muted">{prettyDate(b.scheduled_date)}</span>}
              {b.has_foosball && <span className="chip foos">⚽ Biliardino</span>}
            </button>
          ))}
        </section>
      )}

      <section className="card calendar">
        <div className="cal-head">
          <button className="btn ghost sm" onClick={() => move(-1)} aria-label="Mese precedente">‹</button>
          <h2>{monthFmt.format(cursor)}</h2>
          <button className="btn ghost sm" onClick={() => move(1)} aria-label="Mese successivo">›</button>
        </div>
        <div className="cal-grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className={`cal-wd ${w === 'Gio' ? 'thu' : ''}`}>{w}</div>
          ))}
          {cells.map((d) => {
            const iso = toISO(d);
            const items = byDate.get(iso) ?? [];
            const out = d.getMonth() !== cursor.getMonth();
            const thu = d.getDay() === 4;
            return (
              <div key={iso} className={`cal-cell ${out ? 'out' : ''} ${thu ? 'thu' : ''} ${iso === today ? 'today' : ''}`}>
                <span className="cal-day">{d.getDate()}</span>
                {items.map((b) => {
                  const s = scoreBar(b, ratings, profiles, settings);
                  return (
                    <button key={b.id} className={`cal-bar ${isVisited(b) ? 'past' : ''}`} onClick={() => onOpen(b.id)} title={b.name}>
                      <span className="cal-bar-name">{b.name}</span>
                      {isVisited(b) && s.total !== null && <span className="cal-bar-score">{fmtScore(s.total)}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {unscheduled.length > 0 && (
        <section className="card">
          <h3>Da programmare</h3>
          <ul className="plain">
            {unscheduled.map((b) => (
              <li key={b.id}><button className="link" onClick={() => onOpen(b.id)}>{b.name}</button></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

