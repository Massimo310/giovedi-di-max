import { useState } from 'react';
import { api, USERNAME_RE } from '../lib/api';
import { ROLE_DESC, ROLE_LABEL, type Profile, type Role } from '../lib/types';
import { useStore } from '../store';

const ROLES: Role[] = ['admin', 'fedelissimo', 'occasionale', 'ospite'];

/** Genera una password facile da dettare: parola birrosa + numero */
function suggestPassword() {
  const words = ['luppolo', 'schiuma', 'boccale', 'pinta', 'malto', 'spina', 'ipa', 'stout', 'lager', 'brindisi'];
  return `${words[Math.floor(Math.random() * words.length)]}${Math.floor(1000 + Math.random() * 9000)}`;
}

// Gestione della compagnia: solo il fondatore crea, modifica ed elimina gli account
export default function Crew() {
  const { me, profiles, run } = useStore();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(suggestPassword);
  const [role, setRole] = useState<Role>('fedelissimo');
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [resetFor, setResetFor] = useState<{ p: Profile; pw: string } | null>(null);

  const uname = username.trim().toLowerCase();
  const validUser = USERNAME_RE.test(uname);
  const taken = profiles.some((p) => p.username === uname);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(() => api.createUser({ name: name.trim(), username: uname, password, role }));
    if (ok) {
      setCreated({ username: uname, password });
      setName('');
      setUsername('');
      setPassword(suggestPassword());
    }
  };

  const reset = async (p: Profile) => {
    const pw = suggestPassword();
    if (!confirm(`Generare una nuova password per ${p.name}?`)) return;
    if (await run(() => api.resetUserPassword(p.id, pw))) setResetFor({ p, pw });
  };

  return (
    <section className="card">
      <h2>Compagnia</h2>
      <ul className="users">
        {profiles.map((p) => (
          <li key={p.id}>
            <span className="user-id">
              <strong>{p.name}</strong>
              {p.username && <span className="muted small">@{p.username}</span>}
            </span>
            <select value={p.role} disabled={p.id === me?.id} onChange={(e) => run(() => api.setRole(p.id, e.target.value as Role))}
              title={ROLE_DESC[p.role]} aria-label={`Ruolo di ${p.name}`}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            {p.id !== me?.id ? (
              <span className="row user-actions">
                <button className="btn ghost sm" onClick={() => reset(p)} title="Nuova password">🔑</button>
                <button className="btn danger sm" title="Elimina"
                  onClick={() => confirm(`Eliminare ${p.name}? Spariranno anche i suoi voti.`) && run(() => api.deleteUser(p.id))}>✕</button>
              </span>
            ) : <span />}
          </li>
        ))}
      </ul>

      {resetFor && (
        <div className="credentials">
          Nuova password di <strong>{resetFor.p.name}</strong>: <code>{resetFor.pw}</code>
          <button className="link" onClick={() => setResetFor(null)}>ok</button>
        </div>
      )}

      <form className="form new-user" onSubmit={create}>
        <h3>Aggiungi un amico</h3>
        <div className="grid2">
          <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} placeholder="Es. Luca" /></label>
          <label>
            Nome utente
            <input value={username} onChange={(e) => setUsername(e.target.value)} required autoCapitalize="none" placeholder="es. luca" />
          </label>
          <label>
            Password iniziale
            <span className="row nowrap">
              <input value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              <button type="button" className="btn ghost sm" onClick={() => setPassword(suggestPassword())} title="Genera">🎲</button>
            </span>
          </label>
          <label>
            Ruolo
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </label>
        </div>
        {username && !validUser && <p className="warn">Nome utente: 3–30 caratteri, solo lettere minuscole, numeri, punto, trattino.</p>}
        {taken && <p className="warn">Nome utente già usato.</p>}
        <button className="btn primary" disabled={!validUser || taken}>Crea account</button>
      </form>

      {created && (
        <div className="credentials">
          Account creato! Manda queste credenziali al tuo amico:
          <br />Nome utente <code>{created.username}</code> · Password <code>{created.password}</code>
          <br /><span className="muted small">Potrà cambiarla toccando il suo nome in alto.</span>
          <button className="link" onClick={() => setCreated(null)}>ok</button>
        </div>
      )}
    </section>
  );
}
