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
        <div className="foam" aria-hidden />
        <div className="topbar-inner">
          <h1 className="logo">
            <span className="logo-mug" aria-hidden>🍺</span> Il Giovedì di <em>Max</em>
          </h1>
          <div className="who">
            <span className={`badge role-${me.role}`}>{ROLE_LABEL[me.role]}</span>
            <button className="who-name" onClick={() => setAccount(true)} title="Il mio account">👤 {me.name}</button>
            <button className="btn ghost sm" onClick={() => api.signOut()}>Esci</button>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === 'calendario' ? 'on' : ''} onClick={() => setTab('calendario')}>📅 Calendario</button>
          <button className={tab === 'classifica' ? 'on' : ''} onClick={() => setTab('classifica')}>🏆 Classifica</button>
          {isAdmin(me.role) && (
            <button className={tab === 'admin' ? 'on' : ''} onClick={() => setTab('admin')}>⚙️ Gestione</button>
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
      <footer className="footer">Prosit! 🍻 Fatto con amore e luppolo</footer>
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
