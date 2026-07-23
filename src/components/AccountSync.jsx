import React, { useState } from 'react';
import { AUTH_STATUS, authStatusLabels } from '../lib/authStatus';

const busyStatuses = new Set([AUTH_STATUS.CHECKING, AUTH_STATUS.LOADING_REMOTE, AUTH_STATUS.CREATING_REMOTE, AUTH_STATUS.SAVING, AUTH_STATUS.SIGNING_OUT]);

export default function AccountSync({ cloud, data, setData }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const emailConsent = Boolean(data?.behaviorPreferences?.consent?.emailDelivery);
  const updateEmailConsent = (checked) => setData?.((previous) => ({
    ...previous,
    behaviorPreferences: {
      ...previous.behaviorPreferences,
      consent: { ...previous.behaviorPreferences?.consent, emailDelivery: checked },
    },
  }));
  const color = cloud.status === AUTH_STATUS.ERROR ? '#bd3d4a' : cloud.status === AUTH_STATUS.SYNCED ? '#16877f' : cloud.status === AUTH_STATUS.LINK_SENT ? '#0d6547' : '#536176';
  const busy = busyStatuses.has(cloud.status);
  const syncTime = cloud.lastSyncAt ? new Date(cloud.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  return <div className="account-sync" style={{ position: 'fixed', right: 14, bottom: 14, zIndex: 80, fontFamily: 'Arial, sans-serif' }}>
    {open && <div style={{ width: 286, marginBottom: 8, background: '#fff', border: '1px solid #dfe5ec', borderRadius: 13, boxShadow: '0 16px 45px rgba(13,27,42,.2)', padding: 14 }}>
      <div style={{ fontWeight: 800, color: '#152338', fontSize: 13 }}>Account & backup</div>
      <p style={{ color: '#687589', fontSize: 11, lineHeight: 1.5, margin: '6px 0 12px' }}>{cloud.session ? `Signed in as ${cloud.session.user.email || 'your account'}. ${cloud.remoteReady ? 'Cloud data is loaded and sync is active.' : 'Loading your cloud data before edits are enabled.'}` : cloud.status === AUTH_STATUS.LINK_SENT ? `Email sent to ${cloud.lastEmailSentTo}. Open the newest link to finish sign-in.` : 'Your changes are backed up in this browser. Sign in to sync them securely across devices.'}</p>
      {busy && <div role="status" style={{ background: '#eef4f1', color: '#0d6547', borderRadius: 7, padding: 8, fontSize: 10, marginBottom: 10 }}>{authStatusLabels[cloud.status]}…</div>}
      {cloud.status === AUTH_STATUS.SYNCED && <div role="status" style={{ background: '#edf7f1', color: '#176a4d', borderRadius: 7, padding: 8, fontSize: 10, marginBottom: 10 }}>Cloud sync complete{syncTime ? ` at ${syncTime}` : ''}.</div>}
      {cloud.error && <div style={{ background: '#fff0f1', color: '#a6323f', borderRadius: 7, padding: 8, fontSize: 10, marginBottom: 10 }}>{cloud.error}</div>}
      {!cloud.configured && <div style={{ background: '#fff8e7', color: '#886b21', borderRadius: 7, padding: 8, fontSize: 10 }}>Supabase environment settings are not configured, so local mode is active.</div>}
      {cloud.configured && !cloud.session && <div style={{ display: 'grid', gap: 7 }}><label style={{ fontSize: 10, fontWeight: 800, color: '#536176' }}>EMAIL MAGIC LINK<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={busy} style={{ width: '100%', marginTop: 5, border: '1px solid #dfe5ec', borderRadius: 8, padding: '9px 10px' }} /></label><label style={{ display: 'flex', gap: 7, alignItems: 'flex-start', color: '#536176', fontSize: 10, lineHeight: 1.35 }}><input type="checkbox" checked={emailConsent} onChange={(event) => updateEmailConsent(event.target.checked)} disabled={busy} />I consent to receive account, setup, and profile emails at this address.</label><button disabled={busy || !emailConsent} onClick={async () => { const result = await cloud.sendMagicLink(email); if (!result.error) setMessage('Check your email. Use the newest secure link to sign in and open your five-question profile check-in.'); }} style={{ ...buttonStyle, opacity: (busy || !emailConsent) ? .6 : 1 }}>Email my profile check-in</button>{message && <div role="status" style={{ background: '#edf7f1', color: '#176a4d', borderRadius: 7, padding: 8, fontSize: 10 }}>{message}</div>}<div style={{ textAlign: 'center', fontSize: 9, color: '#8a949f' }}>or</div><button disabled={busy} onClick={() => cloud.signIn('google')} style={{ ...buttonStyle, opacity: busy ? .6 : 1 }}>Continue with Google</button><button disabled={busy} onClick={() => cloud.signIn('microsoft')} style={{ ...buttonStyle, background: '#243a5b', opacity: busy ? .6 : 1 }}>Continue with Microsoft</button></div>}
      {cloud.session && <div style={{ display: 'flex', gap: 7 }}><button disabled={!cloud.remoteReady || busy} onClick={cloud.syncNow} style={{ ...buttonStyle, flex: 1, opacity: (!cloud.remoteReady || busy) ? .6 : 1 }}>Sync now</button><button disabled={busy} onClick={cloud.signOut} style={{ ...buttonStyle, flex: 1, background: '#edf1f5', color: '#536176', opacity: busy ? .6 : 1 }}>Sign out</button></div>}
    </div>}
    <button onClick={() => setOpen((value) => !value)} aria-label="Account and cloud sync" style={{ border: '1px solid rgba(255,255,255,.7)', background: '#fff', borderRadius: 999, boxShadow: '0 5px 18px rgba(13,27,42,.18)', padding: '8px 12px', color, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}><span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 6 }} />{authStatusLabels[cloud.status] || cloud.status}</button>
  </div>;
}

const buttonStyle = { border: 0, borderRadius: 8, padding: '9px 11px', background: '#16877f', color: '#fff', fontWeight: 800, fontSize: 11, cursor: 'pointer' };
