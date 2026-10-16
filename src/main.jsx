import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Laporan from './pages/Laporan.jsx';
import Budget from './pages/Budget.jsx';
import MasterApar from './pages/MasterApar.jsx';
import MasterForklift from './pages/MasterForklift.jsx';
import Admin from './pages/Admin.jsx';
import QRCodes from './pages/QRCodes.jsx';
import Checklist from './pages/Checklist.jsx';

// HashRouter dipakai agar link QR (…/#/checklist/APAR-001) langsung jalan di GitHub Pages
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/checklist/:kode" element={<Checklist />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/master-apar" element={<MasterApar />} />
          <Route path="/master-forklift" element={<MasterForklift />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/qrcodes" element={<QRCodes />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
