import React from 'react';
import C from '../../constants/theme';
import { Button, CardHeader } from '../ui';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };
const isSafeNotionUrl = (value) => { try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'notion.so' || url.hostname.endsWith('.notion.so')); } catch { return false; } };

export default function Notion({ data, navigate }) {
  const notionUrl = data.settings?.notionUrl || '';
  const configured = isSafeNotionUrl(notionUrl);
  const openNotion = () => window.open(notionUrl, '_blank', 'noopener,noreferrer');
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ background: C.navy2, borderRadius: 14, padding: '20px 24px', color: '#fff', borderLeft: `4px solid ${C.gold}` }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>PERSONALOS + NOTION</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 3 }}>Your planning workspace</div><div style={{ fontSize: 12, marginTop: 5, opacity: .9 }}>Use Notion for richer notes, project planning, and reference material—without exposing an AI API key in this app.</div>{configured ? <div style={{ marginTop: 13 }}><Button onClick={openNotion} color="#fff" outline>Open Notion Workspace</Button></div> : <div style={{ marginTop: 13 }}><Button onClick={() => navigate('settings')} color="#fff" outline>Configure Notion Link</Button></div>}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}><div style={card}><CardHeader icon="📅" title="WEEKLY PLANS" color={C.notion} /><div style={{ padding: 13, fontSize: 11, color: C.g3, lineHeight: 1.6 }}>Create a weekly planning database with outcomes, next actions, due dates, and a relation to your PersonalOS goals.</div></div><div style={card}><CardHeader icon="📓" title="KNOWLEDGE & NOTES" color={C.notion} /><div style={{ padding: 13, fontSize: 11, color: C.g3, lineHeight: 1.6 }}>Keep long-form meeting notes, study notes, templates, and reference links in Notion instead of adding more free-form state here.</div></div><div style={card}><CardHeader icon="🚀" title="PROJECTS" color={C.notion} /><div style={{ padding: 13, fontSize: 11, color: C.g3, lineHeight: 1.6 }}>Track projects and applications in a Kanban database. Keep PersonalOS focused on daily execution and measurement.</div></div></div>
    <div style={card}><CardHeader icon="🔗" title="RECOMMENDED INTEGRATION PATH" color={C.navy2} /><div style={{ padding: 14, fontSize: 11, color: C.g3, lineHeight: 1.65 }}><b style={{ color: C.dark }}>Preferred now:</b> configure a private Notion page link in Settings and use the PersonalOS dashboards as your daily dashboard.<br /><b style={{ color: C.dark }}>Preferred later:</b> add an opt-in backend integration using Notion OAuth. Sync only selected fields—weekly priorities, projects, and reading notes—rather than mirroring the entire local data object.<br /><b style={{ color: C.dark }}>Avoid:</b> placing a Notion integration token in this browser app. Tokens must remain server-side.</div></div>
  </div>;
}
