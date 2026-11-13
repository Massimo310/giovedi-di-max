import { CATEGORIES } from '../lib/categories';
import { MAX_VOTE, ROLE_LABEL, type Role } from '../lib/types';
import { useStore } from '../store';

// Pagina "Come si vota": spiega categorie, scala, pesi e bonus
export default function HowToVote() {
  const { settings } = useStore();
  const weightRoles: Exclude<Role, 'ospite'>[] = ['admin', 'cofounder', 'fedelissimo', 'occasionale'];

  return (
    <div className="howto">
      <section className="card howto-intro">
        <h2>Come si vota</h2>
        <p>
          Dopo ogni giovedì, chi c’era dà un voto da <strong>1 a {MAX_VOTE} boccali</strong> a ciascuna delle{' '}
          {CATEGORIES.length} categorie qui sotto. Si vota dalla sera stessa in poi, e il voto si può cambiare quando vuoi.
        </p>
        <ul className="scale">
          <li><span className="scale-n low">1–3</span> da evitare</li>
          <li><span className="scale-n mid">4–6</span> nella media</li>
          <li><span className="scale-n good">7–8</span> bello, ci torno</li>
          <li><span className="scale-n top">9–10</span> leggendario</li>
        </ul>
      </section>

      <div className="howto-grid">
        {CATEGORIES.map((c) => (
          <section key={c.key} className="card howto-cat">
            <div className="howto-cat-head">
              <span className="howto-emoji" aria-hidden>{c.emoji}</span>
              <h3>{c.label}</h3>
            </div>
            <p>{c.description}</p>
            <p className="howto-label">A cosa fare caso</p>
            <ul className="howto-list">
              {c.lookFor.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <div className="howto-range">
              <div><span className="scale-n low">1</span> {c.low}</div>
              <div><span className="scale-n top">10</span> {c.high}</div>
            </div>
          </section>
        ))}
      </div>

      <section className="card">
        <h2>Come si calcola il punteggio</h2>
        <ol className="howto-steps">
          <li>Per ogni categoria si fa la <strong>media dei voti</strong>, pesata in base al ruolo di chi vota.</li>
          <li>Il <strong>punteggio del bar</strong> è la media delle {CATEGORIES.length} categorie.</li>
          <li>
            Se il bar ha il <strong>biliardino ⚽</strong>, prende <strong>+{settings.foosball_bonus}</strong> punti bonus.
            Il biliardino lo segna il Founder.
          </li>
        </ol>
        <p className="howto-label">Quanto pesa il voto</p>
        <ul className="weights-list">
          {weightRoles.map((r) => (
            <li key={r}>
              <span className={`badge role-${r}`}>{ROLE_LABEL[r]}</span>
              <strong>×{settings.weights[r] ?? 2}</strong>
            </li>
          ))}
          <li>
            <span className="badge role-ospite">{ROLE_LABEL.ospite}</span>
            <span className="muted">guarda e basta</span>
          </li>
        </ul>
      </section>

      <section className="card howto-special">
        <h2>Serate speciali 🍻</h2>
        <p>
          Alcune serate non si votano: sono quelle che non vanno in gara, come le ultime al <strong>Bar Bruto</strong>.
          Nel calendario le riconosci perché sono dorate.
        </p>
      </section>
    </div>
  );
}
