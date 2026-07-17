import React, { useEffect, useMemo, useState } from 'react';
import C from '../../constants/theme';
import { clampSessionMinutes, formatFocusTime, nextSessionMinutes } from '../../utils/focusSessions';
import { Button, CardHeader, Input, Label, Select } from '../ui';

const card = { background: '#071424', border: '1px solid rgba(135,167,194,.22)', borderRadius: 16, color: '#fff8e8', overflow: 'hidden', boxShadow: '0 18px 60px rgba(4,12,24,.28)' };

export default function FocusSessions({ data, setData, navigate }) {
  const tasks = (data.tasks || []).filter((task) => !['completed', 'cancelled'].includes(task.status));
  const active = useMemo(() => (data.focusSessions || []).find((session) => ['running', 'paused'].includes(session.status)), [data.focusSessions]);
  const latestFinished = useMemo(() => (data.focusSessions || []).find((session) => ['completed', 'stopped'].includes(session.status) && !session.reflection), [data.focusSessions]);
  const [taskId, setTaskId] = useState(tasks[0]?.id || '');
  const selectedTask = tasks.find((task) => String(task.id) === String(taskId));
  const [minutes, setMinutes] = useState(data.behaviorPreferences?.focusSessionMinutes || 25);
  const [elapsed, setElapsed] = useState(active?.elapsedSeconds || 0);
  const [thought, setThought] = useState('');
  const [reflection, setReflection] = useState({ progress: 'some', interruption: '', nextLength: 'equal' });
  const addEvent = (previous, event) => previous.behaviorPreferences?.consent?.behaviorEvents ? [...(previous.behaviorEvents || []), event] : (previous.behaviorEvents || []);

  useEffect(() => { setElapsed(active?.elapsedSeconds || 0); }, [active?.id]);
  useEffect(() => {
    if (!active || active.status !== 'running') return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active?.id, active?.status]);

  const updateSession = (id, patch) => setData((previous) => ({ ...previous, focusSessions: (previous.focusSessions || []).map((session) => session.id === id ? { ...session, ...patch } : session) }));
  const start = () => {
    const now = new Date().toISOString();
    const id = globalThis.crypto?.randomUUID?.() || `focus-${Date.now()}`;
    const plannedMinutes = clampSessionMinutes(minutes);
    const session = { id, taskId: selectedTask?.id || null, objective: selectedTask?.title || 'Intentional focus', nextAction: selectedTask?.nextAction || '', plannedMinutes, elapsedSeconds: 0, status: 'running', startedAt: now, endedAt: null, pauseCount: 0, thoughtParking: [], reflection: null };
    setData((previous) => ({ ...previous, focusSessions: [session, ...(previous.focusSessions || [])], tasks: (previous.tasks || []).map((task) => task.id === selectedTask?.id ? { ...task, status: 'in_progress', startedAt: task.startedAt || now, updatedAt: now } : task), behaviorEvents: addEvent(previous, { id: `${now}-focus-start`, type: 'focus_session_started', occurredAt: now, entityType: 'focusSession', entityId: id, metadata: { taskId: session.taskId, plannedMinutes } }) }));
    setElapsed(0);
  };
  const pause = () => updateSession(active.id, { status: 'paused', elapsedSeconds: elapsed, pauseCount: active.pauseCount + 1 });
  const resume = () => updateSession(active.id, { status: 'running', elapsedSeconds: elapsed });
  const extend = () => updateSession(active.id, { plannedMinutes: Math.min(180, active.plannedMinutes + 5), elapsedSeconds: elapsed });
  const end = (status) => {
    const now = new Date().toISOString();
    setData((previous) => ({ ...previous, focusSessions: (previous.focusSessions || []).map((session) => session.id === active.id ? { ...session, status, elapsedSeconds: elapsed, endedAt: now } : session), behaviorEvents: addEvent(previous, { id: `${now}-focus-end`, type: status === 'completed' ? 'focus_session_completed' : 'focus_session_stopped', occurredAt: now, entityType: 'focusSession', entityId: active.id, metadata: { elapsedSeconds: elapsed } }) }));
  };
  const parkThought = () => {
    if (!thought.trim()) return;
    updateSession(active.id, { elapsedSeconds: elapsed, thoughtParking: [...active.thoughtParking, { id: Date.now(), text: thought.trim(), capturedAt: new Date().toISOString() }] });
    setThought('');
  };
  const saveReflection = () => {
    const session = latestFinished;
    updateSession(session.id, { reflection });
    setMinutes(nextSessionMinutes(session.plannedMinutes, reflection.nextLength));
    setReflection({ progress: 'some', interruption: '', nextLength: 'equal' });
    navigate('dashboard');
  };

  if (!active && latestFinished) return <div style={{ maxWidth: 680, margin: '0 auto', ...card }}><CardHeader icon="◌" title="GENTLE COMPLETION" color={C.purple} /><div style={{ padding: 22, display: 'grid', gap: 13 }}><h2 style={{ margin: 0 }}>{latestFinished.objective}</h2><div><Label>DID YOU MAKE USEFUL PROGRESS?</Label><Select value={reflection.progress} onChange={(event) => setReflection({ ...reflection, progress: event.target.value })} options={[{ v: 'yes', l: 'Yes' }, { v: 'some', l: 'Some progress' }, { v: 'no', l: 'Not this time' }]} /></div><div><Label>WHAT INTERRUPTED YOU?</Label><Input value={reflection.interruption} onChange={(event) => setReflection({ ...reflection, interruption: event.target.value })} placeholder="Optional and judgment-free" /></div><div><Label>THE NEXT SESSION SHOULD BE</Label><Select value={reflection.nextLength} onChange={(event) => setReflection({ ...reflection, nextLength: event.target.value })} options={['shorter', 'equal', 'longer']} /></div><Button onClick={saveReflection} color={C.green} full>Save reflection</Button><Button onClick={() => navigate('dashboard')} color={C.blue} outline full>Return to dashboard</Button></div></div>;

  if (!active) return <div style={{ maxWidth: 680, margin: '0 auto', ...card }}><CardHeader icon="◎" title="START A FOCUS SESSION" color={C.navy2} /><div style={{ padding: 22, display: 'grid', gap: 13 }}><div><Label>CURRENT TASK</Label><Select value={taskId} onChange={(event) => setTaskId(event.target.value)} options={[{ v: '', l: 'Intentional focus without a task' }, ...tasks.map((task) => ({ v: task.id, l: task.title }))]} /></div>{selectedTask?.nextAction && <div style={{ color: '#8fd8c1', fontSize: 12 }}>First action: {selectedTask.nextAction}</div>}<div><Label>DURATION · YOUR CHOICE</Label><Input type="number" min="5" max="180" value={minutes} onChange={(event) => setMinutes(clampSessionMinutes(event.target.value))} /></div><Button onClick={start} color={C.gold} full>Begin gently</Button><Button onClick={() => navigate('dashboard')} color={C.blue} outline full>Return to dashboard</Button></div></div>;

  const remaining = Math.max(0, active.plannedMinutes * 60 - elapsed);
  return <div style={{ maxWidth: 760, margin: '0 auto', ...card }}><div style={{ padding: 26, display: 'grid', gap: 18, textAlign: 'center' }}><div><div style={{ color: '#8fd8c1', fontSize: 10, letterSpacing: '.12em' }}>CURRENT OBJECTIVE</div><h1 style={{ margin: '6px 0' }}>{active.objective}</h1><div style={{ color: '#b8c8d8', fontSize: 12 }}>{active.nextAction}</div></div><div aria-label={`${formatFocusTime(remaining)} remaining`} style={{ fontSize: 64, fontVariantNumeric: 'tabular-nums', color: '#f4c66a' }}>{formatFocusTime(remaining)}</div><div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>{active.status === 'running' ? <Button onClick={pause} color={C.blue}>Pause</Button> : <Button onClick={resume} color={C.green}>Resume</Button>}<Button onClick={extend} color={C.purple} outline>Extend 5 min</Button><Button onClick={() => end('completed')} color={C.green}>Finish</Button><Button onClick={() => end('stopped')} color={C.red} outline>Emergency exit</Button></div><div style={{ textAlign: 'left', background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: 12 }}><Label>THOUGHT PARKING</Label><div style={{ display: 'flex', gap: 7 }}><Input value={thought} onChange={(event) => setThought(event.target.value)} placeholder="Store it here so you do not have to hold it" /><Button onClick={parkThought} color={C.blue} small>Park</Button></div>{active.thoughtParking.map((item) => <div key={item.id} style={{ color: '#b8c8d8', fontSize: 10, marginTop: 6 }}>• {item.text}</div>)}</div><div style={{ color: '#8296a8', fontSize: 9 }}>Sound is off. No rewards or secondary navigation appear during focus.</div></div></div>;
}
