import React, { useMemo, useState } from 'react';
import C from '../../constants/theme';
import { recommendDailyPlan, taskEnergyFromCheckIn } from '../../utils/dailyCompass';
import { Button, CardHeader, Input, Label, Textarea } from '../ui';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };
const emptyForm = { successDefinition: '', primaryOutcome: '', secondaryOne: '', secondaryTwo: '', obstacle: '', firstAction: '', energy: 3, availableMinutes: 120, stoppingTime: '18:00', lowEnergyPlan: '' };

export default function DailyCommandCenter({ data, setData, dateContext }) {
  const today = dateContext.today;
  const existing = useMemo(() => (data.dailyCompass || []).find((entry) => entry.date === today), [data.dailyCompass, today]);
  const [form, setForm] = useState(() => existing ? { ...existing, secondaryOne: existing.secondaryOutcomes[0] || '', secondaryTwo: existing.secondaryOutcomes[1] || '' } : emptyForm);
  const [saved, setSaved] = useState(Boolean(existing));
  const recommendation = recommendDailyPlan({ availableMinutes: form.availableMinutes, energy: form.energy, preferredFocusMinutes: data.behaviorPreferences?.focusSessionMinutes });
  const update = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setSaved(false); };

  const save = () => {
    if (!form.primaryOutcome.trim() || !form.firstAction.trim()) return;
    const now = new Date().toISOString();
    const id = existing?.id || `compass-${today}`;
    const secondaryOutcomes = [form.secondaryOne, form.secondaryTwo].map((value) => value.trim()).filter(Boolean).slice(0, 2);
    const compass = { id, date: today, successDefinition: form.successDefinition.trim(), primaryOutcome: form.primaryOutcome.trim(), secondaryOutcomes, obstacle: form.obstacle.trim(), firstAction: form.firstAction.trim(), energy: Number(form.energy), ...recommendation, stoppingTime: form.stoppingTime, lowEnergyPlan: form.lowEnergyPlan.trim(), createdAt: existing?.createdAt || now, updatedAt: now };
    const taskId = `task-${today}-primary`;
    const task = { id: taskId, title: compass.primaryOutcome, desiredOutcome: compass.successDefinition, nextAction: compass.firstAction, expectedMinutes: compass.firstBlockMinutes, actualMinutes: null, energy: taskEnergyFromCheckIn(compass.energy), priority: 'P1', deadline: today, scheduledStart: '', scheduledEnd: compass.stoppingTime, dependencies: [], context: '', status: 'planned', postponementCount: 0, postponementReason: '', goalId: null, createdAt: now, updatedAt: now };
    setData((previous) => {
      const dailyPlan = [compass.primaryOutcome, ...secondaryOutcomes].map((text, index) => ({ id: `${id}-${index}`, date: today, text, done: false, source: 'daily-compass' }));
      const behaviorEvents = previous.behaviorPreferences?.consent?.behaviorEvents ? [...(previous.behaviorEvents || []), { id: `${now}-planned`, type: 'daily_plan_created', occurredAt: now, entityType: 'dailyCompass', entityId: id, metadata: { energy: compass.energy, availableMinutes: compass.availableMinutes } }] : (previous.behaviorEvents || []);
      return { ...previous, dailyCompass: [compass, ...(previous.dailyCompass || []).filter((entry) => entry.date !== today)], tasks: [task, ...(previous.tasks || []).filter((entry) => entry.id !== taskId)], dailyPlan: [...(previous.dailyPlan || []).filter((entry) => entry.date !== today || entry.source !== 'daily-compass'), ...dailyPlan], behaviorEvents };
    });
    setSaved(true);
  };

  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(280px,.8fr)', gap: 12, alignItems: 'start' }}>
    <div style={card}><CardHeader icon="🧭" title={`DAILY COMPASS · ${today}`} color={C.navy2} /><div style={{ padding: 14, display: 'grid', gap: 12 }}>
      <div><Label>WHAT WOULD MAKE TODAY SUCCESSFUL?</Label><Input value={form.successDefinition} onChange={(event) => update('successDefinition', event.target.value)} placeholder="A calm, specific definition of a good day" /></div>
      <div><Label>SINGLE MOST IMPORTANT OUTCOME</Label><Input value={form.primaryOutcome} onChange={(event) => update('primaryOutcome', event.target.value)} placeholder="The result that matters most" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}><div><Label>SECONDARY OUTCOME 1</Label><Input value={form.secondaryOne} onChange={(event) => update('secondaryOne', event.target.value)} /></div><div><Label>SECONDARY OUTCOME 2</Label><Input value={form.secondaryTwo} onChange={(event) => update('secondaryTwo', event.target.value)} /></div></div>
      <div><Label>WHAT MIGHT PREVENT YOU FROM STARTING?</Label><Textarea value={form.obstacle} onChange={(event) => update('obstacle', event.target.value)} placeholder="Unclear task, missing information, low energy…" /></div>
      <div><Label>SMALLEST USEFUL FIRST ACTION</Label><Input value={form.firstAction} onChange={(event) => update('firstAction', event.target.value)} placeholder="Open the file and write the first three headings" /></div>
      <div><Label>REDUCED PLAN FOR A LOW-ENERGY DAY</Label><Input value={form.lowEnergyPlan} onChange={(event) => update('lowEnergyPlan', event.target.value)} placeholder="Complete a five-minute version, then stop without guilt" /></div>
      <Button onClick={save} color={C.navy2} full>{saved ? 'Plan saved' : 'Save today’s compass'}</Button>
    </div></div>
    <div style={{ display: 'grid', gap: 12 }}><div style={card}><CardHeader icon="⚡" title="CAPACITY" color={C.orange} /><div style={{ padding: 13, display: 'grid', gap: 10 }}>
      <div><Label>ENERGY · {form.energy}/5</Label><input aria-label="Energy" type="range" min="1" max="5" value={form.energy} onChange={(event) => update('energy', Number(event.target.value))} style={{ width: '100%' }} /></div>
      <div><Label>AVAILABLE MINUTES</Label><Input type="number" min="5" max="1440" value={form.availableMinutes} onChange={(event) => update('availableMinutes', Number(event.target.value) || 5)} /></div>
      <div><Label>CLEAR STOPPING TIME</Label><Input type="time" value={form.stoppingTime} onChange={(event) => update('stoppingTime', event.target.value)} /></div>
    </div></div><div style={card}><CardHeader icon="✨" title="RECOMMENDED START" color={C.green} /><div style={{ padding: 13, fontSize: 11, lineHeight: 1.6 }}><b>{recommendation.firstBlockMinutes}-minute first block</b><div style={{ color: C.g3 }}>{recommendation.bufferMinutes} minutes protected for transitions and recovery.</div>{Number(form.energy) <= 2 && <div style={{ marginTop: 8, color: C.orange }}>Low energy detected: the first block is intentionally shorter.</div>}</div></div></div>
  </div>;
}
