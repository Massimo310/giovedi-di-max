import { CATEGORIES } from '../lib/categories';
import { isRateable, shortDate } from '../lib/dates';
import { fmtScore, scoreBar } from '../lib/scoring';
import { useStore } from '../store';
import Pint from './Pint';

export default function Leaderboard({ onOpen }: { onOpen: (id: string) => void }) {
  const { bars, ratings, profiles, settings } = useStore();
  const scored = bars
    .filter(isRateable)
    .map((b) => scoreBar(b, ratings, profiles, settings))
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));

  if (!scored.length)
    return (
      <section className="card empty">
        <div className="empty-mug" aria-hidden>🍺</div>
        <p>Nessun bar ancora visitato. La classifica si riempie dopo il primo giovedì!</p>
      </section>
    );

  return (
    <section className="board">
      <p className="muted board-note">
        Media pesata per ruolo (Co-founder ×{settings.weights.cofounder ?? 2}, Fedelissimi ×{settings.weights.fedelissimo}, Occasionali ×{settings.weights.occasionale})
        {settings.foosball_bonus > 0 && <> · Biliardino +{settings.foosball_bonus}</>}
      </p>
      {scored.map((s, i) => (
        <button key={s.bar.id} className={`card board-row ${i < 3 ? `top${i + 1}` : ''}`} onClick={() => onOpen(s.bar.id)}>
          <span className="rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
          <Pint value={s.total} />
          <span className="board-main">
            <strong className="board-name">{s.bar.name}</strong>
            <span className="muted">
              {shortDate(s.bar.scheduled_date)} · {s.votes} {s.votes === 1 ? 'voto' : 'voti'}
            </span>
            <span className="board-cats">
              {CATEGORIES.map((c) => (
                <span key={c.key} className="mini" title={c.label}>
                  {c.emoji} {fmtScore(s.categories[c.key]).replace(/0$/, '')}
                </span>
              ))}
            </span>
          </span>
          <span className="board-score">
            {fmtScore(s.total)}
            {s.bar.has_foosball && <span className="chip foos">⚽ +{settings.foosball_bonus}</span>}
          </span>
        </button>
      ))}
    </section>
  );
}
