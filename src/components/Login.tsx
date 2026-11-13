import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Profile } from '../lib/types';
import { ROLE_DESC, ROLE_LABEL } from '../lib/types';
import { useStore } from '../store';

export default function Login() {
  const { run, error } = useStore();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [demoUsers, setDemoUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (api.mode === 'demo') api.listProfiles().then(setDemoUsers);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(() => (mode === 'in' ? api.signIn(email, password) : api.signUp(email, password, name)));
    if (ok && mode === 'up') setInfo('Account creato! Se richiesto, conferma la mail. Entrerai come Ospite finché Max non ti promuove.');
  };

  return (
    <div className="login">
      <div className="login-card card">
        <div className="login-hero" aria-hidden>🍻</div>
        <h1 className="logo big">Il Giovedì di <em>Max</em></h1>
        <p className="muted">Ogni giovedì un bar nuovo. Voi votate, la schiuma decide.</p>

        {api.mode === 'demo' ? (
          <>
            <h3>Prova come…</h3>
            <div className="demo-users">
              {demoUsers.map((u) => (
                <button key={u.id} className="demo-user" onClick={() => run(() => api.demoLogin!(u.id))}>
                  <strong>{u.name}</strong>
                  <span className={`badge role-${u.role}`}>{ROLE_LABEL[u.role]}</span>
                  <small>{ROLE_DESC[u.role]}</small>
                </button>
              ))}
            </div>
            <button className="link" onClick={() => run(() => api.demoReset!()).then(() => api.listProfiles().then(setDemoUsers))}>
              Ripristina dati demo
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="form">
            {mode === 'up' && (
              <label>Nome<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={40} /></label>
            )}
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
            </label>
            <button className="btn primary">{mode === 'in' ? 'Entra' : 'Crea account'}</button>
            <button type="button" className="link" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
              {mode === 'in' ? 'Non hai un account? Registrati' : 'Hai già un account? Entra'}
            </button>
          </form>
        )}
        {info && <p className="ok">{info}</p>}
        {error && <p className="err">{error}</p>}
      </div>
    </div>
  );
}
