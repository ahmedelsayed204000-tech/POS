import React, { useState } from 'react';
import C from '../../constants/theme';
import { durationRecommendation, elapsedMinutes, estimateAccuracy } from '../../utils/durationLearning';
import { guidanceForPostponement, postponementOptions, suggestNextAction } from '../../utils/taskGuidance';
import { Button, CardHeader, Input, Label, Select } from '../ui';

const card = { background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' };
const initialForm = { title: '', desiredOutcome: '', expectedMinutes: 25, energy: 'medium', priority: 'P2', deadline: '' };

export default function Tasks({ data, setData }) {
  const [form, setForm] = useState(initialForm);
  const [reasons, setReasons] = useState({});
  const [durations, setDurations] = useState({});
  const tasks = data.tasks || [];
  const updateTask = (id, patch) => setData((previous) => ({ ...previous, tasks: (previous.tasks || []).map((task) => task.id === id ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task) }));
  const addEvent = (previous, event) => previous.behaviorPreferences?.consent?.behaviorEvents ? [...(previous.behaviorEvents || []), event] : (previous.behaviorEvents || []);
  const addTask = () => {
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    const id = globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`;
    const task = { id, title: form.title.trim(), desiredOutcome: form.desiredOutcome.trim(), nextAction: suggestNextAction(form), expectedMinutes: Number(form.expectedMinutes) || 25, actualMinutes: null, energy: form.energy, priority: form.priority, deadline: form.deadline, scheduledStart: '', scheduledEnd: '', dependencies: [], context: '', status: 'inbox', postponementCount: 0, postponementReason: '', goalId: null, createdAt: now, updatedAt: now };
    setData((previous) => ({ ...previous, tasks: [task, ...(previous.tasks || [])], behaviorEvents: addEvent(previous, { id: `${now}-created`, type: 'task_created', occurredAt: now, entityType: 'task', entityId: id, metadata: { priority: task.priority } }) }));
    setForm(initialForm);
  };
  const start = (task) => {
    const now = new Date().toISOString();
    setData((previous) => ({ ...previous, tasks: (previous.tasks || []).map((item) => item.id === task.id ? { ...item, status: 'in_progress', startedAt: now, updatedAt: now } : item), behaviorEvents: addEvent(previous, { id: `${now}-started`, type: 'task_started', occurredAt: now, entityType: 'task', entityId: task.id, metadata: { expectedMinutes: task.expectedMinutes } }) }));
  };
  const complete = (task) => {
    const now = new Date().toISOString();
    const actualMinutes = Number(durations[task.id]) || elapsedMinutes(task.startedAt, now) || Number(task.expectedMinutes);
    setData((previous) => ({ ...previous, tasks: (previous.tasks || []).map((item) => item.id === task.id ? { ...item, status: 'completed', actualMinutes, completedAt: now, updatedAt: now } : item), behaviorEvents: addEvent(previous, { id: `${now}-completed`, type: 'task_completed', occurredAt: now, entityType: 'task', entityId: task.id, metadata: { expectedMinutes: task.expectedMinutes, actualMinutes, estimateAccuracy: estimateAccuracy(task.expectedMinutes, actualMinutes) } }) }));
  };
  const postpone = (task) => {
    const reason = reasons[task.id] || 'unclear';
    const now = new Date().toISOString();
    setData((previous) => ({ ...previous, tasks: (previous.tasks || []).map((item) => item.id === task.id ? { ...item, status: 'postponed', postponementCount: item.postponementCount + 1, postponementReason: reason, updatedAt: now } : item), behaviorEvents: addEvent(previous, { id: `${now}-postponed`, type: 'task_postponed', occurredAt: now, entityType: 'task', entityId: task.id, metadata: { reason } }) }));
  };

  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) 300px', gap: 12, alignItems: 'start' }}><div style={{ display: 'grid', gap: 12 }}>
    {tasks.map((task) => {
      const recommendation = durationRecommendation(task, tasks);
      const accuracy = estimateAccuracy(task.expectedMinutes, task.actualMinutes);
      return <div key={task.id} style={card}><CardHeader icon={task.status === 'completed' ? '✓' : '→'} title={task.title.toUpperCase()} color={task.status === 'completed' ? C.green : C.blue} /><div style={{ padding: 13, display: 'grid', gap: 9 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 9, color: C.g3 }}><b>{task.priority}</b><span>estimated {task.expectedMinutes} min</span><span>{task.energy} energy</span><span>{task.status}</span>{task.actualMinutes && <span>actual {task.actualMinutes} min · {accuracy}% estimate accuracy</span>}{task.postponementCount > 0 && <span>moved {task.postponementCount}×</span>}</div>
        <div><Label>SMALLEST NEXT ACTION</Label><Input value={task.nextAction} onChange={(event) => updateTask(task.id, { nextAction: event.target.value })} /></div>
        {recommendation && <div style={{ background: C.lblue, color: C.blue, borderRadius: 8, padding: 9, fontSize: 10, lineHeight: 1.5 }}>Based on {recommendation.sampleSize} completed {task.energy}-energy tasks, consider <b>{recommendation.suggestedMinutes} minutes</b> plus {recommendation.recoveryMinutes} minutes to transition or recover. This is guidance, not a command.</div>}
        {task.status === 'postponed' && <div style={{ color: C.orange, fontSize: 10 }}>{guidanceForPostponement(task.postponementReason)}</div>}
        {task.status !== 'completed' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto auto auto', gap: 6 }}><Select value={reasons[task.id] || 'unclear'} onChange={(event) => setReasons((current) => ({ ...current, [task.id]: event.target.value }))} options={postponementOptions.map(([v, l]) => ({ v, l }))} /><Input aria-label={`Actual minutes for ${task.title}`} type="number" min="1" placeholder="Actual min" value={durations[task.id] || ''} onChange={(event) => setDurations((current) => ({ ...current, [task.id]: event.target.value }))} /><Button onClick={() => postpone(task)} color={C.orange} small outline>Postpone</Button><Button onClick={() => start(task)} color={C.blue} small outline>Start</Button><Button onClick={() => complete(task)} color={C.green} small>Complete</Button></div>}
      </div></div>;
    })}
    {!tasks.length && <div style={{ ...card, padding: 24, textAlign: 'center', color: C.g3 }}>Add a task and PersonalOS will suggest an editable physical first action.</div>}
  </div><div style={card}><CardHeader icon="＋" title="ADD TASK" color={C.navy2} /><div style={{ padding: 13, display: 'grid', gap: 9 }}><div><Label>TITLE</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Work on presentation" /></div><div><Label>DESIRED OUTCOME</Label><Input value={form.desiredOutcome} onChange={(event) => setForm({ ...form, desiredOutcome: event.target.value })} /></div><div><Label>EXPECTED MINUTES</Label><Input type="number" min="5" max="1440" value={form.expectedMinutes} onChange={(event) => setForm({ ...form, expectedMinutes: Number(event.target.value) || 5 })} /></div><div><Label>ENERGY</Label><Select value={form.energy} onChange={(event) => setForm({ ...form, energy: event.target.value })} options={['low', 'medium', 'high']} /></div><div><Label>PRIORITY</Label><Select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} options={['P1', 'P2', 'P3']} /></div><div><Label>DEADLINE</Label><Input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></div><Button onClick={addTask} color={C.navy2} full>Add with suggested next action</Button></div></div></div>;
}
