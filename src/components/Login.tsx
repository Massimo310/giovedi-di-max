import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Profile } from '../lib/types';
import { ROLE_DESC, ROLE_LABEL } from '../lib/types';
import { useStore } from '../store';
import Bubbles from './Bubbles';

export default function Login() {
  const { run, error } = useStore();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [demoUsers, setDemoUsers] = useState<Profile[]>([]);

  useEffect(() => {
    if (api.mode === 'demo') api.listProfiles().then(setDemoUsers);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(() => api.signIn(login, password));
  };

  return (
    <div className="login">
      <Bubbles variant="hero" count={30} />
      <div className="login-card card">
        <span className="beer-logo big" aria-hidden>🍺</span>
        <h1 className="logo big">Il Giovedì di Max</h1>
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
            <label>
              Nome utente
              <input value={login} onChange={(e) => setLogin(e.target.value)} required autoComplete="username" autoCapitalize="none" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            <button className="btn primary">Entra</button>
            <p className="muted small">Non hai un account? Chiedi a Max: gli account li crea lui.</p>
          </form>
        )}
        {error && <p className="err">{error}</p>}
      </div>
    </div>
  );
}
