import React, { useMemo, useState } from 'react';
import './tracker-pages.css';

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const number = (value) => Number(value || 0);
const hoursBetween = (start, end, breakMinutes = 0) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number); const [eh, em] = end.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm); if (minutes < 0) minutes += 1440;
  return Math.max(0, (minutes - number(breakMinutes)) / 60);
};

function Field({ label, children, full = false }) { return <div className={`tracker-field${full ? ' full' : ''}`}><label>{label}</label>{children}</div>; }
function List({ title, items, empty, render }) { return <div className="tracker-card"><div className="tracker-card-head">{title}<span>{items.length}</span></div><div className="tracker-card-body">{items.length ? <div className="tracker-list">{items.map((item) => <div className="tracker-item" key={item.id}>{render(item)}</div>)}</div> : <div className="tracker-empty">{empty}</div>}</div></div>; }

export default function WorkCareer({ data, setData, dateContext }) {
  const today = dateContext?.today || new Date().toISOString().slice(0, 10);
  const work = data.workCareer;
  const [tab, setTab] = useState('shifts');
  const [shift, setShift] = useState({ date: today, start: '09:00', end: '17:00', breakMinutes: 60, type: 'regular', employer: work.profile.employer, role: work.profile.role, status: 'scheduled', notes: '' });
  const [development, setDevelopment] = useState({ type: 'course', title: '', provider: '', field: '', status: 'planned', startDate: today, targetDate: '', progress: 0, weeklyHoursTarget: 3, notes: '' });
  const [opportunity, setOpportunity] = useState({ organization: '', role: '', type: 'job', status: 'interested', date: today, nextAction: '', notes: '' });
  const updateWork = (recipe) => setData((previous) => ({ ...previous, workCareer: recipe(previous.workCareer) }));
  const updateProfile = (key, value) => updateWork((current) => ({ ...current, profile: { ...current.profile, [key]: value } }));
  const remove = (collection, id) => updateWork((current) => ({ ...current, [collection]: current[collection].filter((item) => item.id !== id) }));
  const stats = useMemo(() => {
    const weekStart = new Date(`${today}T00:00:00`); weekStart.setDate(weekStart.getDate() - 6);
    const recent = work.shifts.filter((item) => new Date(`${item.date}T00:00:00`) >= weekStart && !['cancelled','missed'].includes(item.status));
    return {
      hours: recent.reduce((sum, item) => sum + hoursBetween(item.start, item.end, item.breakMinutes), 0),
      shifts: recent.length,
      learning: work.development.filter((item) => item.status === 'active').length,
      opportunities: work.opportunities.filter((item) => !['accepted','rejected','withdrawn'].includes(item.status)).length,
    };
  }, [work, today]);
  const addShift = () => {
    if (!shift.date || !shift.start || !shift.end) return;
    updateWork((current) => ({ ...current, shifts: [{ ...shift, id: uid(), breakMinutes: number(shift.breakMinutes) }, ...current.shifts] }));
    setShift((current) => ({ ...current, notes: '' }));
  };
  const addDevelopment = () => {
    if (!development.title.trim()) return;
    updateWork((current) => ({ ...current, development: [{ ...development, id: uid(), progress: number(development.progress), weeklyHoursTarget: number(development.weeklyHoursTarget) }, ...current.development] }));
    setDevelopment((current) => ({ ...current, title: '', provider: '', field: '', notes: '', progress: 0 }));
  };
  const addOpportunity = () => {
    if (!opportunity.organization.trim() || !opportunity.role.trim()) return;
    updateWork((current) => ({ ...current, opportunities: [{ ...opportunity, id: uid() }, ...current.opportunities] }));
    setOpportunity((current) => ({ ...current, organization: '', role: '', nextAction: '', notes: '' }));
  };

  return <div className="tracker-page work-page">
    <section className="tracker-hero work">
      <h1>Work & Career Studio</h1>
      <p>Manage rotating shifts, working time, professional courses, certifications, postgraduate study and your next career move.</p>
      <div className="tracker-kpis">
        <div className="tracker-kpi"><strong>{stats.hours.toFixed(1)}/{work.profile.weeklyHoursTarget}</strong><span>hours this week</span></div>
        <div className="tracker-kpi"><strong>{stats.shifts}</strong><span>active shifts</span></div>
        <div className="tracker-kpi"><strong>{stats.learning}</strong><span>active studies</span></div>
        <div className="tracker-kpi"><strong>{stats.opportunities}</strong><span>open opportunities</span></div>
      </div>
    </section>
    <div className="tracker-tabs">{['profile','shifts','development','opportunities'].map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>

    {tab === 'profile' && <div className="tracker-card"><div className="tracker-card-head">Current work profile</div><div className="tracker-card-body tracker-form">
      <Field label="EMPLOYER"><input value={work.profile.employer} onChange={(e) => updateProfile('employer', e.target.value)} /></Field><Field label="ROLE"><input value={work.profile.role} onChange={(e) => updateProfile('role', e.target.value)} /></Field>
      <Field label="WEEKLY HOURS TARGET"><input type="number" min="0" max="168" value={work.profile.weeklyHoursTarget} onChange={(e) => updateProfile('weeklyHoursTarget', number(e.target.value))} /></Field><Field label="CAREER GOAL" full><textarea value={work.profile.careerGoal} onChange={(e) => updateProfile('careerGoal', e.target.value)} /></Field>
    </div></div>}

    {tab === 'shifts' && <div className="tracker-grid"><div className="tracker-card"><div className="tracker-card-head">Add a work shift</div><div className="tracker-card-body tracker-form">
      <Field label="DATE"><input type="date" value={shift.date} onChange={(e) => setShift({ ...shift, date: e.target.value })} /></Field><Field label="SHIFT TYPE"><select value={shift.type} onChange={(e) => setShift({ ...shift, type: e.target.value })}>{['regular','night','overtime','on_call','remote','leave'].map((value) => <option key={value}>{value.replace('_',' ')}</option>)}</select></Field>
      <Field label="START"><input type="time" value={shift.start} onChange={(e) => setShift({ ...shift, start: e.target.value })} /></Field><Field label="END"><input type="time" value={shift.end} onChange={(e) => setShift({ ...shift, end: e.target.value })} /></Field><Field label="BREAK (MIN)"><input type="number" min="0" value={shift.breakMinutes} onChange={(e) => setShift({ ...shift, breakMinutes: e.target.value })} /></Field><Field label="STATUS"><select value={shift.status} onChange={(e) => setShift({ ...shift, status: e.target.value })}>{['scheduled','completed','missed','cancelled'].map((value) => <option key={value}>{value}</option>)}</select></Field>
      <Field label="EMPLOYER"><input value={shift.employer} onChange={(e) => setShift({ ...shift, employer: e.target.value })} /></Field><Field label="ROLE"><input value={shift.role} onChange={(e) => setShift({ ...shift, role: e.target.value })} /></Field><Field label="NOTES" full><textarea value={shift.notes} onChange={(e) => setShift({ ...shift, notes: e.target.value })} /></Field><div className="tracker-actions"><button className="tracker-primary" onClick={addShift}>Add shift</button></div>
    </div></div><List title="Shift schedule" items={work.shifts} empty="No shifts scheduled." render={(item) => <><div><h3>{item.employer || 'Work'} · {item.role || item.type}</h3><div className="tracker-meta"><span>{item.date}</span><span>{item.start}–{item.end}</span><span>{hoursBetween(item.start,item.end,item.breakMinutes).toFixed(1)} h</span><span className="tracker-pill">{item.type.replace('_',' ')} · {item.status}</span></div>{item.notes && <div className="tracker-note">{item.notes}</div>}</div><button className="tracker-danger" onClick={() => remove('shifts', item.id)}>Delete</button></>} /></div>}

    {tab === 'development' && <div className="tracker-grid"><div className="tracker-card"><div className="tracker-card-head">Add course or postgraduate study</div><div className="tracker-card-body tracker-form">
      <Field label="TYPE"><select value={development.type} onChange={(e) => setDevelopment({ ...development, type: e.target.value })}>{['course','certification','workshop','postgraduate','degree','self_study'].map((value) => <option key={value}>{value.replace('_',' ')}</option>)}</select></Field><Field label="STATUS"><select value={development.status} onChange={(e) => setDevelopment({ ...development, status: e.target.value })}>{['planned','active','paused','completed','cancelled'].map((value) => <option key={value}>{value}</option>)}</select></Field>
      <Field label="TITLE" full><input value={development.title} onChange={(e) => setDevelopment({ ...development, title: e.target.value })} placeholder="MBA, certification, online course..." /></Field><Field label="PROVIDER / UNIVERSITY"><input value={development.provider} onChange={(e) => setDevelopment({ ...development, provider: e.target.value })} /></Field><Field label="FIELD OF STUDY"><input value={development.field} onChange={(e) => setDevelopment({ ...development, field: e.target.value })} /></Field>
      <Field label="START DATE"><input type="date" value={development.startDate} onChange={(e) => setDevelopment({ ...development, startDate: e.target.value })} /></Field><Field label="TARGET DATE"><input type="date" value={development.targetDate} onChange={(e) => setDevelopment({ ...development, targetDate: e.target.value })} /></Field><Field label="PROGRESS %"><input type="number" min="0" max="100" value={development.progress} onChange={(e) => setDevelopment({ ...development, progress: e.target.value })} /></Field><Field label="STUDY HOURS / WEEK"><input type="number" min="0" value={development.weeklyHoursTarget} onChange={(e) => setDevelopment({ ...development, weeklyHoursTarget: e.target.value })} /></Field><Field label="NOTES" full><textarea value={development.notes} onChange={(e) => setDevelopment({ ...development, notes: e.target.value })} /></Field><div className="tracker-actions"><button className="tracker-primary" onClick={addDevelopment}>Add development item</button></div>
    </div></div><List title="Learning & qualifications" items={work.development} empty="No courses or studies tracked." render={(item) => <><div><h3>{item.title}</h3><div className="tracker-meta"><span className="tracker-pill">{item.type.replace('_',' ')}</span><span>{item.provider}</span><span>{item.progress}% complete</span><span>{item.targetDate && `Target ${item.targetDate}`}</span></div><div className="tracker-progress"><div style={{ width: `${item.progress}%` }} /></div>{item.notes && <div className="tracker-note">{item.notes}</div>}</div><button className="tracker-danger" onClick={() => remove('development', item.id)}>Delete</button></>} /></div>}

    {tab === 'opportunities' && <div className="tracker-grid"><div className="tracker-card"><div className="tracker-card-head">Add career opportunity</div><div className="tracker-card-body tracker-form">
      <Field label="ORGANIZATION"><input value={opportunity.organization} onChange={(e) => setOpportunity({ ...opportunity, organization: e.target.value })} /></Field><Field label="ROLE / OPPORTUNITY"><input value={opportunity.role} onChange={(e) => setOpportunity({ ...opportunity, role: e.target.value })} /></Field><Field label="TYPE"><select value={opportunity.type} onChange={(e) => setOpportunity({ ...opportunity, type: e.target.value })}>{['job','promotion','freelance','internship','research'].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="STATUS"><select value={opportunity.status} onChange={(e) => setOpportunity({ ...opportunity, status: e.target.value })}>{['interested','applied','screening','interview','offer','accepted','rejected','withdrawn'].map((value) => <option key={value}>{value}</option>)}</select></Field><Field label="DATE"><input type="date" value={opportunity.date} onChange={(e) => setOpportunity({ ...opportunity, date: e.target.value })} /></Field><Field label="NEXT ACTION" full><input value={opportunity.nextAction} onChange={(e) => setOpportunity({ ...opportunity, nextAction: e.target.value })} /></Field><Field label="NOTES" full><textarea value={opportunity.notes} onChange={(e) => setOpportunity({ ...opportunity, notes: e.target.value })} /></Field><div className="tracker-actions"><button className="tracker-primary" onClick={addOpportunity}>Add opportunity</button></div>
    </div></div><List title="Career pipeline" items={work.opportunities} empty="No career opportunities tracked." render={(item) => <><div><h3>{item.organization} · {item.role}</h3><div className="tracker-meta"><span>{item.date}</span><span className="tracker-pill">{item.type} · {item.status}</span></div>{item.nextAction && <div className="tracker-note"><strong>Next:</strong> {item.nextAction}</div>}</div><button className="tracker-danger" onClick={() => remove('opportunities', item.id)}>Delete</button></>} /></div>}
  </div>;
}
