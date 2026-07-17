import React from 'react';
import C from '../../constants/theme';
import DEF from '../../data/defaults';
import { CardHeader, Input, Label, Select } from '../ui';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };
const toggle = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.g1}`, fontSize: 10, color: C.dark };

export default function BehaviorPreferences({ data, setData }) {
  const preferences = data.behaviorPreferences || DEF.behaviorPreferences;
  const update = (patch) => setData((previous) => ({ ...previous, behaviorPreferences: { ...preferences, ...patch } }));
  const updateNested = (key, patch) => update({ [key]: { ...preferences[key], ...patch } });
  const consentChoices = [['behaviorEvents', 'Store behavior events for your reports'], ['contextualRecommendations', 'Use your history for recommendations'], ['healthPersonalization', 'Use connected health data for planning'], ['passiveDetection', 'Allow explicitly connected passive detection']];

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={card}><CardHeader icon="🧭" title="WORK & SUPPORT PREFERENCES" color={C.purple} /><div style={{ padding: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
      <div><Label>WORK START</Label><Input type="time" value={preferences.workingHoursStart} onChange={(event) => update({ workingHoursStart: event.target.value })} /></div><div><Label>WORK END</Label><Input type="time" value={preferences.workingHoursEnd} onChange={(event) => update({ workingHoursEnd: event.target.value })} /></div>
      <div><Label>WAKE TIME</Label><Input type="time" value={preferences.wakeTime} onChange={(event) => update({ wakeTime: event.target.value })} /></div><div><Label>SLEEP TIME</Label><Input type="time" value={preferences.sleepTime} onChange={(event) => update({ sleepTime: event.target.value })} /></div>
      <div><Label>FOCUS MINUTES</Label><Input type="number" min="5" max="180" value={preferences.focusSessionMinutes} onChange={(event) => update({ focusSessionMinutes: Math.max(5, Math.min(180, Number(event.target.value) || 25)) })} /></div><div><Label>REMINDERS</Label><Select value={preferences.reminderFrequency} onChange={(event) => update({ reminderFrequency: event.target.value })} options={[{ v: 'minimal', l: 'Minimal' }, { v: 'balanced', l: 'Balanced' }, { v: 'frequent', l: 'Frequent' }]} /></div>
      <div><Label>COACHING TONE</Label><Select value={preferences.coachingTone} onChange={(event) => update({ coachingTone: event.target.value })} options={[{ v: 'gentle', l: 'Gentle' }, { v: 'supportive', l: 'Supportive' }, { v: 'direct', l: 'Direct' }]} /></div><div><Label>GAMIFICATION</Label><Select value={preferences.gamification} onChange={(event) => update({ gamification: event.target.value })} options={[{ v: 'off', l: 'Off' }, { v: 'gentle', l: 'Gentle' }, { v: 'full', l: 'Full' }]} /></div>
    </div></div>
    <div style={card}><CardHeader icon="♿" title="ACCESSIBILITY" color={C.blue} /><div style={{ padding: '5px 13px 12px' }}>{[['reducedMotion', 'Reduce motion and animation'], ['highContrast', 'Increase interface contrast'], ['largeText', 'Prefer larger interface text']].map(([key, label]) => <label key={key} style={toggle}><span>{label}</span><input type="checkbox" checked={preferences.accessibility[key]} onChange={(event) => updateNested('accessibility', { [key]: event.target.checked })} /></label>)}</div></div>
    <div style={card}><CardHeader icon="🔐" title="PRIVACY & CONSENT" color={C.green} /><div style={{ padding: '8px 13px 12px' }}><p style={{ margin: '0 0 6px', color: C.g3, fontSize: 10, lineHeight: 1.5 }}>Personalization remains off until you enable each use. You can withdraw consent at any time.</p>{consentChoices.map(([key, label]) => <label key={key} style={toggle}><span>{label}</span><input type="checkbox" checked={preferences.consent[key]} onChange={(event) => updateNested('consent', { [key]: event.target.checked })} /></label>)}</div></div>
  </div>;
}
