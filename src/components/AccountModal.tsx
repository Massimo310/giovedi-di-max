import { useState } from 'react';
import { api } from '../lib/api';
import { ROLE_DESC, ROLE_LABEL } from '../lib/types';
import { useStore } from '../store';

// Il mio account: dati e cambio password
export default function AccountModal({ onClose }: { onClose: () => void }) {
  const { me, run } = useStore();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [ok, setOk] = useState(false);
  if (!me) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => api.changeMyPassword(pw))) {
      setOk(true);
      setPw('');
      setPw2('');
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal card narrow" role="dialog" aria-modal aria-label="Il mio account" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Chiudi">✕</button>
        <h2>{me.name}</h2>
        <p className="row">
          <span className={`badge role-${me.role}`}>{ROLE_LABEL[me.role]}</span>
          <span className="muted small">{ROLE_DESC[me.role]}</span>
        </p>
        {me.username && <p className="muted">Nome utente: <strong>{me.username}</strong></p>}
        <form className="form" onSubmit={submit}>
          <h3>Cambia password</h3>
          <label>Nuova password<input type="password" minLength={6} required value={pw} onChange={(e) => { setPw(e.target.value); setOk(false); }} autoComplete="new-password" /></label>
          <label>Ripetila<input type="password" minLength={6} required value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></label>
          {pw2 && pw !== pw2 && <p className="warn">Le password non coincidono</p>}
          <div className="row">
            <button className="btn primary" disabled={pw !== pw2}>Salva password</button>
            {ok && <span className="ok">Fatto!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
