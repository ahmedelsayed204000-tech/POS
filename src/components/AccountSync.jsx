import React, { useState } from 'react';

const labels = { local: 'Saved locally', connecting: 'Connecting…', saving: 'Saving…', synced: 'Cloud synced', error: 'Sync needs attention' };

export default function AccountSync({ cloud }) {
  const [open, setOpen] = useState(false);
  const color = cloud.status === 'error' ? '#bd3d4a' : cloud.status === 'synced' ? '#16877f' : '#536176';
  return <div className="account-sync" style={{ position: 'fixed', right: 14, bottom: 14, zIndex: 80, fontFamily: 'Arial, sans-serif' }}>
    {open && <div style={{ width: 286, marginBottom: 8, background: '#fff', border: '1px solid #dfe5ec', borderRadius: 13, boxShadow: '0 16px 45px rgba(13,27,42,.2)', padding: 14 }}>
      <div style={{ fontWeight: 800, color: '#152338', fontSize: 13 }}>Account & backup</div>
      <p style={{ color: '#687589', fontSize: 11, lineHeight: 1.5, margin: '6px 0 12px' }}>{cloud.session ? `Signed in as ${cloud.session.user.email || 'your account'}. Local backup and Supabase cloud sync are active.` : 'Your changes are backed up in this browser. Sign in to sync them securely across devices.'}</p>
      {cloud.error && <div style={{ background: '#fff0f1', color: '#a6323f', borderRadius: 7, padding: 8, fontSize: 10, marginBottom: 10 }}>{cloud.error}</div>}
      {!cloud.configured && <div style={{ background: '#fff8e7', color: '#886b21', borderRadius: 7, padding: 8, fontSize: 10 }}>Supabase environment settings are not configured, so local mode is active.</div>}
      {cloud.configured && !cloud.session && <div style={{ display: 'grid', gap: 7 }}><button onClick={() => cloud.signIn('google')} style={buttonStyle}>Continue with Google</button><button onClick={() => cloud.signIn('microsoft')} style={{ ...buttonStyle, background: '#243a5b' }}>Continue with Microsoft</button></div>}
      {cloud.session && <div style={{ display: 'flex', gap: 7 }}><button onClick={cloud.syncNow} style={{ ...buttonStyle, flex: 1 }}>Sync now</button><button onClick={cloud.signOut} style={{ ...buttonStyle, flex: 1, background: '#edf1f5', color: '#536176' }}>Sign out</button></div>}
    </div>}
    <button onClick={() => setOpen((value) => !value)} aria-label="Account and cloud sync" style={{ border: '1px solid rgba(255,255,255,.7)', background: '#fff', borderRadius: 999, boxShadow: '0 5px 18px rgba(13,27,42,.18)', padding: '8px 12px', color, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}><span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 6 }} />{labels[cloud.status] || cloud.status}</button>
  </div>;
}

const buttonStyle = { border: 0, borderRadius: 8, padding: '9px 11px', background: '#16877f', color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer' };
