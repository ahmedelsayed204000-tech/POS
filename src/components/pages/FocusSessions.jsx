import React, { useEffect, useMemo, useState } from 'react';
import { clampSessionMinutes, formatFocusTime, nextSessionMinutes } from '../../utils/focusSessions';

const Icon = ({ children }) => <span className="material-symbols-rounded" aria-hidden="true">{children}</span>;

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

  if (!active && latestFinished) return <section className="focus-modern">
    <header><small>GENTLE COMPLETION</small><h2>{latestFinished.objective}</h2><p>Close the loop without turning reflection into a second task.</p></header>
    <div className="focus-form-grid">
      <label><span>Did you make useful progress?</span><select value={reflection.progress} onChange={(event) => setReflection({ ...reflection, progress: event.target.value })}><option value="yes">Yes</option><option value="some">Some progress</option><option value="no">Not this time</option></select></label>
      <label><span>What interrupted you?</span><input value={reflection.interruption} onChange={(event) => setReflection({ ...reflection, interruption: event.target.value })} placeholder="Optional and judgment-free" /></label>
      <label><span>The next session should be</span><select value={reflection.nextLength} onChange={(event) => setReflection({ ...reflection, nextLength: event.target.value })}>{['shorter', 'equal', 'longer'].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
    </div>
    <footer><button className="focus-primary" onClick={saveReflection}><Icon>check</Icon>Save reflection</button><button className="focus-secondary" onClick={() => navigate('dashboard')}>Return to Today</button></footer>
  </section>;

  if (!active) return <section className="focus-modern">
    <header><small>START A FOCUS SESSION</small><h2>Begin one protected block.</h2><p>Choose the task, set a humane duration, and keep everything else parked.</p></header>
    <div className="focus-form-grid">
      <label><span>Current task</span><select value={taskId} onChange={(event) => setTaskId(event.target.value)}><option value="">Intentional focus without a task</option>{tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label>
      <label><span>Duration</span><input type="number" min="5" max="180" value={minutes} onChange={(event) => setMinutes(clampSessionMinutes(event.target.value))} /></label>
    </div>
    {selectedTask?.nextAction && <div className="focus-note"><Icon>arrow_forward</Icon>First action: {selectedTask.nextAction}</div>}
    <footer><button className="focus-primary" onClick={start}><Icon>timer</Icon>Begin gently</button><button className="focus-secondary" onClick={() => navigate('dashboard')}>Return to Today</button></footer>
  </section>;

  const remaining = Math.max(0, active.plannedMinutes * 60 - elapsed);
  return <section className="focus-modern focus-running">
    <header><small>CURRENT OBJECTIVE</small><h2>{active.objective}</h2>{active.nextAction && <p>{active.nextAction}</p>}</header>
    <div className="focus-timer" aria-label={`${formatFocusTime(remaining)} remaining`}>{formatFocusTime(remaining)}</div>
    <div className="focus-controls">{active.status === 'running' ? <button onClick={pause}><Icon>pause</Icon>Pause</button> : <button onClick={resume}><Icon>play_arrow</Icon>Resume</button>}<button onClick={extend}><Icon>add</Icon>Extend 5 min</button><button onClick={() => end('completed')}><Icon>check</Icon>Finish</button><button onClick={() => end('stopped')}><Icon>logout</Icon>Stop</button></div>
    <div className="focus-parking"><label><span>Thought parking</span><div><input value={thought} onChange={(event) => setThought(event.target.value)} placeholder="Store it here so you do not have to hold it" /><button onClick={parkThought}>Park</button></div></label>{active.thoughtParking.map((item) => <p key={item.id}>{item.text}</p>)}</div>
  </section>;
}
