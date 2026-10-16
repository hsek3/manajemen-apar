import React, { useEffect, useState } from 'react';
import { api, getAdminPw, setAdminPw, clearAdminPw } from '../lib/api.js';

/** Gerbang password admin. Login tersimpan di browser sehingga cukup 1x login. */
export default function LoginGate({ children }) {
  const [locked, setLocked] = useState(true);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function verify(pw) {
    try {
      const r = await api('checkAdmin', {}, pw);
      return !!r.ok;
    } catch (e) {
      setErr(e.message);
      return false;
    }
  }

  useEffect(() => {
    (async () => {
      const saved = getAdminPw();
      if (saved && (await verify(saved))) setLocked(false);
      else clearAdminPw();
      setChecking(false);
    })();
    const relock = () => { clearAdminPw(); setLocked(true); };
    window.addEventListener('apar-unauthorized', relock);
    return () => window.removeEventListener('apar-unauthorized', relock);
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    const ok = await verify(password);
    setBusy(false);
    if (ok) { setAdminPw(password); setPassword(''); setLocked(false); }
    else setErr((prev) => prev || 'Password salah, coba lagi.');
  }

  if (checking) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Memuat...</div>;
  if (!locked) return children;

  return (
    <div className="login-overlay">
      <form onSubmit={submit} className="login-box">
        <h2>🔒 Login Diperlukan</h2>
        <p>Masukkan password admin untuk mengakses halaman ini.</p>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? 'Memeriksa...' : 'MASUK'}
        </button>
        {err && <div className="login-err">{err}</div>}
      </form>
    </div>
  );
}
