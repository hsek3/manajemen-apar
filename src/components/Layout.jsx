import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import LoginGate from './LoginGate.jsx';
import { api, clearAdminPw } from '../lib/api.js';
import { useLoad } from '../lib/hooks.js';

const MENU = [
  ['/', '🏠', 'Home', true],
  ['/dashboard', '📊', 'Dashboard'],
  ['/laporan', '📄', 'Laporan Bulanan'],
  ['/budget', '💰', 'Budget & Realisasi'],
  ['/master-apar', '🏭', 'Master APAR'],
  ['/master-forklift', '🚜', 'Master Forklift'],
  ['/admin', '⚙️', 'Admin'],
  ['/qrcodes', '🔳', 'QR Codes'],
];

export default function Layout() {
  const { data: info } = useLoad(() => api('getPublicInfo'), []);
  return (
    <LoginGate>
      <div className="app-shell">
        <aside className="sidebar no-print">
          <div className="brand">
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="" width="34" height="34" />
            <div><b>Manajemen APAR</b><span>{info?.namaPerusahaan || 'Sistem Internal'}</span></div>
          </div>
          <nav>
            {MENU.map(([to, ic, label, end]) => (
              <NavLink key={to} to={to} end={!!end} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="ic">{ic}</span> {label}
              </NavLink>
            ))}
          </nav>
          <button className="logout" onClick={() => { clearAdminPw(); window.location.reload(); }}>Keluar</button>
        </aside>
        <main className="main"><Outlet /></main>
      </div>
    </LoginGate>
  );
}
