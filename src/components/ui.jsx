import React from 'react';

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export const Loading = ({ text = 'Memuat data...' }) => <div className="empty">{text}</div>;
export const ErrorBox = ({ error, onRetry }) => (
  <div className="msg msg-err">⚠️ {error} {onRetry && <button className="btn btn-outline" style={{ marginLeft: 8, padding: '4px 10px' }} onClick={onRetry}>Coba lagi</button>}</div>
);

export function Field({ label, children }) {
  return <div><label>{label}</label>{children}</div>;
}

export function StatusBadge({ s }) {
  return <span className={'status-badge ' + (s === 'Aktif' ? 'st-aktif' : 'st-lain')}>{s || '-'}</span>;
}

export function Kpi({ label, value, tone = '' }) {
  return <div className={'kpi ' + tone}><div className="num">{value}</div><div className="lbl">{label}</div></div>;
}

/** Tabel sederhana: cols = [{key|render, label}] */
export function DataTable({ rows, cols, empty = 'Tidak ada data.' }) {
  if (!rows || rows.length === 0) return <p className="empty-small">{empty}</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{cols.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{cols.map((c) => <td key={c.label}>{c.render ? c.render(r, i) : (r[c.key] ?? '-') || '-'}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
