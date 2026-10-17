import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import LoginGate from './LoginGate.jsx';
import Icon from './Icons.jsx';
import { api, clearAdminPw } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';

// [kelompok, [[path, ikon, label, exact?]]]
const GROUPS = [
  ['Utama', [['/', 'home', 'Home', true], ['/dashboard', 'chart', 'Dashboard'], ['/laporan', 'file', 'Laporan Bulanan']]],
  ['Data APAR', [['/master-apar', 'building', 'Master APAR'], ['/master-forklift', 'truck', 'Master Forklift'], ['/qrcodes', 'qr', 'QR Codes']]],
  ['Keuangan', [['/budget', 'wallet', 'Budget & Realisasi']]],
  ['Pengaturan', [['/admin', 'settings', 'Admin']]],
];
const SEMUA = GROUPS.flatMap(([, items]) => items);

export default function Layout() {
  const { data: info } = useLoad(() => api('getPublicInfo'), []);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const judul = (SEMUA.find(([p, , , exact]) => (exact ? pathname === p : pathname.startsWith(p) && p !== '/')) || SEMUA[0])[2];
  const logo = `${import.meta.env.BASE_URL}favicon.png`;

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open]);

  return (
    <LoginGate>
      <div className="app-shell">
        <header className="topbar no-print">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Buka menu"><Icon name="menu" size={22} /></button>
          <span className="topbar-title">{judul}</span>
          <img src={logo} alt="" width="30" height="30" />
        </header>

        {open && <div className="scrim no-print" onClick={() => setOpen(false)} />}

        <aside className={'sidebar no-print' + (open ? ' open' : '')}>
          <div className="brand">
            <img src={logo} alt="" width="38" height="38" />
            <div><b>Manajemen APAR</b><span>{info?.namaPerusahaan || 'Sistem Internal'}</span></div>
            <button className="icon-btn close-btn" onClick={() => setOpen(false)} aria-label="Tutup menu"><Icon name="x" size={20} /></button>
          </div>
          <nav>
            {GROUPS.map(([grup, items]) => (
              <div className="nav-group" key={grup}>
                <div className="nav-label">{grup}</div>
                {items.map(([to, ic, label, exact]) => (
                  <NavLink key={to} to={to} end={!!exact} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                    <Icon name={ic} /> <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <button className="logout" onClick={() => { clearAdminPw(); window.location.reload(); }}>
            <Icon name="logout" /> Keluar
          </button>
        </aside>

        <main className="main"><Outlet /></main>
      </div>
    </LoginGate>
  );
}
