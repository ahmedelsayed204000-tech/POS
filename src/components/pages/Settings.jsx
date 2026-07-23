import React, { useRef, useState } from 'react';
import C from '../../constants/theme';
import DEF from '../../data/defaults';
import { migrateData } from '../../data/migrate';
import { validateImport } from '../../data/schema';
import { deleteBehaviorHistory, privacyExportPayload, resetPersonalization } from '../../utils/privacyControls';
import { Button, CardHeader, Input, Label } from '../ui';
import BehaviorPreferences from '../settings/BehaviorPreferences';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };
const helpText = { color: C.g3, fontSize: 10, lineHeight: 1.5 };

export default function Settings({ data, setData }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const settings = data.settings || DEF.settings;
  const updateSettings = (patch) => setData((previous) => ({ ...previous, settings: { ...previous.settings, ...patch } }));
  const downloadJson = (payload, name) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const exportData = () => {
    downloadJson(data, 'personal-os');
    setMessage('Your data export has been downloaded.');
  };
  const exportPrivacy = (kind) => {
    downloadJson(privacyExportPayload(data, kind), `personal-os-${kind}`);
    setMessage(kind === 'personalization' ? 'Personalization export downloaded.' : 'Behavior history export downloaded.');
  };
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const check = validateImport(String(reader.result));
      if (!check.success) {
        setMessage(check.message);
        return;
      }
      setData(migrateData(check.data));
      setMessage('Import complete. A previous state is available through Undo.');
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  const deletePersonalization = () => {
    if (window.confirm('Delete personalization answers and reset score preferences? Your workspace data stays intact.')) {
      setData((previous) => resetPersonalization(previous));
      setMessage('Personalization has been reset. Undo is available.');
    }
  };
  const clearBehaviorHistory = () => {
    if (window.confirm('Delete stored behavior history? This clears behavior events used for reports and recommendations.')) {
      setData((previous) => deleteBehaviorHistory(previous));
      setMessage('Behavior history has been deleted. Undo is available.');
    }
  };
  const reset = () => {
    if (window.confirm('Reset all PersonalOS data to the starter data? Export first if you need a backup.')) {
      setData(DEF);
      setMessage('All data has been reset to the starter data.');
    }
  };

  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
    <div style={{ gridColumn: '1 / -1' }}><BehaviorPreferences data={data} setData={setData} /></div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card}>
        <CardHeader icon="person" title="PROFILE & TARGETS" color={C.settings} />
        <div style={{ padding: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          <div><Label>NAME</Label><Input value={settings.name || ''} onChange={(event) => updateSettings({ name: event.target.value })} /></div>
          <div><Label>CURRENCY</Label><Input value={settings.currency || ''} onChange={(event) => updateSettings({ currency: event.target.value.toUpperCase() })} /></div>
          <div><Label>WEEKLY HOURS TARGET</Label><Input type="number" value={settings.weekTarget || ''} onChange={(event) => updateSettings({ weekTarget: Number(event.target.value) || 0 })} /></div>
          <div><Label>FITNESS SESSIONS TARGET</Label><Input type="number" value={settings.fitnessTarget || ''} onChange={(event) => updateSettings({ fitnessTarget: Number(event.target.value) || 0 })} /></div>
          <div style={{ gridColumn: 'span 2' }}><Label>NET-WORTH GOAL</Label><Input type="number" value={settings.goalNetWorth || ''} onChange={(event) => updateSettings({ goalNetWorth: Number(event.target.value) || 0 })} /></div>
        </div>
      </div>
      <div style={card}>
        <CardHeader icon="edit_note" title="NOTION WORKSPACE" color={C.notion} />
        <div style={{ padding: 13 }}>
          <Label>NOTION PAGE OR DATABASE URL</Label>
          <Input value={settings.notionUrl || ''} onChange={(event) => updateSettings({ notionUrl: event.target.value.trim() })} placeholder="https://www.notion.so/..." />
          <div style={{ ...helpText, marginTop: 7 }}>This is a private workspace shortcut only. A live two-way Notion sync needs a secure backend, Notion OAuth, and a selected database schema.</div>
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card}>
        <CardHeader icon="shield" title="BACKUP & RESTORE" color={C.blue} />
        <div style={{ padding: 13, display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={helpText}>Your data currently lives in this browser. Export regularly before clearing browser storage or moving devices.</div>
          <Button onClick={exportData} color={C.blue} full>Export JSON Backup</Button>
          <input ref={inputRef} type="file" accept="application/json" onChange={importData} style={{ display: 'none' }} />
          <Button onClick={() => inputRef.current?.click()} color={C.blue} outline full>Import JSON Backup</Button>
        </div>
      </div>
      <div style={card}>
        <CardHeader icon="privacy_tip" title="PRIVACY CONTROLS" color={C.green} />
        <div style={{ padding: 13, display: 'grid', gap: 9 }}>
          <div style={helpText}>Export or remove personalization and behavior history without touching the rest of your workspace.</div>
          <Button onClick={() => exportPrivacy('personalization')} color={C.green} outline full>Export Personalization</Button>
          <Button onClick={deletePersonalization} color={C.red} outline full>Delete Personalization</Button>
          <Button onClick={() => exportPrivacy('behaviorHistory')} color={C.green} outline full>Export Behavior History</Button>
          <Button onClick={clearBehaviorHistory} color={C.red} outline full>Delete Behavior History</Button>
        </div>
      </div>
      <div style={card}>
        <CardHeader icon="warning" title="DANGER ZONE" color={C.red} />
        <div style={{ padding: 13 }}>
          <div style={{ ...helpText, marginBottom: 9 }}>Reset replaces all current data with the supplied starter data. This cannot be undone.</div>
          <Button onClick={reset} color={C.red} full>Reset All Data</Button>
        </div>
      </div>
      {message && <div style={{ background: C.lblue, color: C.blue, borderRadius: 8, padding: 10, fontSize: 11 }}>{message}</div>}
    </div>
  </div>;
}
