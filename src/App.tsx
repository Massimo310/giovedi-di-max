import { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { api } from './lib/api';
import { ROLE_LABEL, isAdmin } from './lib/types';
import Login from './components/Login';
import CalendarView from './components/CalendarView';
import Leaderboard from './components/Leaderboard';
import AddBar from './components/AddBar';
import AdminPanel from './components/AdminPanel';
import BarDetail from './components/BarDetail';
import Bubbles from './components/Bubbles';
import AccountModal from './components/AccountModal';


type Tab = 'calendario' | 'classifica' | 'admin';

function Shell() {
  const { me, loading, error, setError } = useStore();
  const [tab, setTab] = useState<Tab>('calendario');
  const [openBar, setOpenBar] = useState<string | null>(null);
  const [account, setAccount] = useState(false);

  if (loading) return <div className="center"><div className="pour" aria-label="Caricamento" /></div>;
  if (!me) return <Login />;

  return (
    <>
      <header className="topbar">
        <Bubbles variant="hero" count={18} />
        <div className="topbar-inner">
          <div className="brand">
            <span className="beer-logo" aria-hidden>🍺</span>
            <h1 className="logo">Il Giovedì di Max</h1>
          </div>
          <div className="who">
            <span className={`badge role-${me.role}`}>{ROLE_LABEL[me.role]}</span>
            <button className="who-name" onClick={() => setAccount(true)} title="Profilo e password">
              <span className="avatar">{me.name.slice(0, 1).toUpperCase()}</span>
              <span className="who-label">{me.name}</span>
              <span className="who-key" aria-hidden>🔑</span>
            </button>
            <button className="btn on-dark sm" onClick={() => api.signOut()}>Esci</button>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === 'calendario' ? 'on' : ''} onClick={() => setTab('calendario')}>Calendario</button>
          <button className={tab === 'classifica' ? 'on' : ''} onClick={() => setTab('classifica')}>Classifica</button>
          {isAdmin(me.role) && (
            <button className={tab === 'admin' ? 'on' : ''} onClick={() => setTab('admin')}>Gestione</button>
          )}
        </nav>
      </header>

      {api.mode === 'demo' && (
        <div className="demo-note">
          Modalità demo: i dati restano solo in questo browser.{' '}
          <button className="link" onClick={() => api.signOut()}>Cambia utente</button>
        </div>
      )}
      {error && (
        <div className="toast" role="alert" onClick={() => setError(null)}>
          {error} <span aria-hidden>✕</span>
        </div>
      )}

      <main className="container">
        {tab === 'calendario' && (
          <>
            <AddBar />
            <CalendarView onOpen={setOpenBar} />
          </>
        )}
        {tab === 'classifica' && <Leaderboard onOpen={setOpenBar} />}
        {tab === 'admin' && isAdmin(me.role) && <AdminPanel onOpen={setOpenBar} />}
      </main>

      {account && <AccountModal onClose={() => setAccount(false)} />}
      {openBar && <BarDetail barId={openBar} onClose={() => setOpenBar(null)} />}
      <footer className="footer">
        <span>Il Bar Bruto chiude, il Giovedì di Max no.<br />Cambiano i banconi, resta la compagnia. 🍻</span>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Bubbles />
      <Shell />
    </StoreProvider>
  );
}
