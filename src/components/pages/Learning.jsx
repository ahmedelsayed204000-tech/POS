import React, { useState, useEffect, useMemo } from 'react';
import C from '../../constants/theme';
import { SUBS } from '../../constants/nav';
import { Bar, Button, CardHeader, Input, Select, Label, EditText } from '../ui';
import { scoreLearn, studyStreak } from '../../utils/scores';
import { fmt } from '../../utils/dates';

const FOCUS_SECS = 25 * 60;
const BREAK_SECS =  5 * 60;

const TOPIC_STATE = {
  done:   { ic: '✅', label: 'Done',    bg: C.lgreen,  c: C.green,  br: '#A9DFBF' },
  active: { ic: '🔵', label: 'Active',  bg: C.lblue,   c: C.blue,   br: '#AED6F1' },
  todo:   { ic: '⬜', label: 'To Do',   bg: C.g0,      c: C.g3,     br: C.border  },
};

export default function Learning({ data, setData, dateContext }) {
  const { today: TODAY, weekStart: WS, weekEnd: WE, now: NOW, year: YR, month: MO } = dateContext;
  const [sub,    setSub]    = useState('sql');
  const [filter, setFilter] = useState('all');
  const [logForm, setLogForm] = useState({ date: TODAY, sub: 'sql', min: '30', topic: '' });

  const S        = SUBS.find(s => s.k === sub);
  const topics   = data.learn[sub] || [];
  const sessions = data.learn.sessions || [];

  const wkMin    = sessions.filter(s => s.date >= fmt(WS) && s.date < fmt(WE)).reduce((a, s) => a + s.min, 0);
  const todayMin = sessions.filter(s => s.date === TODAY).reduce((a, s) => a + s.min, 0);
  const streak   = useMemo(() => studyStreak(sessions), [sessions]);
  const overallPct = scoreLearn(data.learn) * 100;

  const subStats = SUBS.reduce((acc, s) => {
    const t = data.learn[s.k] || [];
    acc[s.k] = {
      done:  t.filter(x => x.s === 'done').length,
      active:t.filter(x => x.s === 'active').length,
      total: t.length,
      pct:   t.length ? t.filter(x => x.s === 'done').length / t.length * 100 : 0,
    };
    return acc;
  }, {});

  const filtered = useMemo(
    () => filter === 'all' ? topics : topics.filter(t => (t.s || 'todo') === filter),
    [topics, filter]
  );

  const nextUp = useMemo(() => {
    for (const s of SUBS) {
      const t = data.learn[s.k].find(x => x.s === 'active') || data.learn[s.k].find(x => x.s === 'todo');
      if (t) return { ...t, sub: s };
    }
    return null;
  }, [data.learn]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const CYCLE = { todo: 'active', active: 'done', done: 'todo' };

  const cycleTopic = (subKey, id) =>
    setData(p => ({
      ...p,
      learn: { ...p.learn, [subKey]: p.learn[subKey].map(t => t.id === id ? { ...t, s: CYCLE[t.s || 'todo'] } : t) },
    }));

  const setTopicNote = (subKey, id, note) =>
    setData(p => ({
      ...p,
      learn: { ...p.learn, [subKey]: p.learn[subKey].map(t => t.id === id ? { ...t, note } : t) },
    }));

  const addSession = (min, subKey, topic) => {
    setData(p => ({
      ...p,
      learn: {
        ...p.learn,
        sessions: [{ id: Date.now(), date: TODAY, sub: subKey || logForm.sub, min: min || parseInt(logForm.min) || 30, topic: topic || logForm.topic }, ...(p.learn.sessions || [])],
      },
    }));
    if (!topic) setLogForm(f => ({ ...f, topic: '', min: '30' }));
  };

  const delSession = (id) =>
    setData(p => ({ ...p, learn: { ...p.learn, sessions: (p.learn.sessions || []).filter(x => x.id !== id) } }));

  // ── Pomodoro ──────────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(FOCUS_SECS);
  const [running,  setRunning]  = useState(false);
  const [mode,     setMode]     = useState('focus');   // 'focus' | 'break'
  const [pomoCount,setPomoCount]= useState(0);
  const [justDone, setJustDone] = useState(null);      // 'focus' | 'break' | null

  // Countdown tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Session completion
  useEffect(() => {
    if (timeLeft > 0 || !running) return;
    setRunning(false);
    if (mode === 'focus') {
      setPomoCount(c => c + 1);
      addSession(25, sub, `🍅 Pomodoro — ${S.label}`);
      setJustDone('focus');
      setMode('break');
      setTimeLeft(BREAK_SECS);
    } else {
      setJustDone('break');
      setMode('focus');
      setTimeLeft(FOCUS_SECS);
    }
  }, [timeLeft, running]);

  const resetTimer = () => { setRunning(false); setTimeLeft(FOCUS_SECS); setMode('focus'); setJustDone(null); };

  const mm  = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, '0');
  const ss  = String(Math.max(0, timeLeft) % 60).padStart(2, '0');
  const R   = 42;
  const CIR = 2 * Math.PI * R;
  const progress = timeLeft / (mode === 'focus' ? FOCUS_SECS : BREAK_SECS);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── HERO ── */}
      <div style={{ background: `linear-gradient(135deg,${C.navy2},${C.purple})`, borderRadius: 12, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: C.gold, fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>LEARNING PROGRESS</div>
            <div style={{ color: '#fff', fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{overallPct.toFixed(0)}<span style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>%</span></div>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <Bar p={overallPct} color={C.gold} h={6} />
            <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
              {SUBS.map(s => (
                <div key={s.k} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 8 }}>{s.ic}</div>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>{subStats[s.k].pct.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {[{ l: '🔥', v: `${streak}d` }, { l: '⏱', v: `${todayMin}m` }, { l: '📅', v: `${wkMin}m` }].map(s => (
              <div key={s.l} style={{ background: 'rgba(255,255,255,.1)', borderRadius: 7, padding: '5px 9px', textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 10 }}>{s.l}</div>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 800 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SUBJECT TABS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
        {SUBS.map(s => (
          <div key={s.k} onClick={() => setSub(s.k)} style={{ borderRadius: 10, padding: '9px 11px', border: `2px solid ${sub === s.k ? s.c : C.border}`, background: sub === s.k ? s.c + '12' : '#fff', cursor: 'pointer', transition: 'all .15s', boxShadow: sub === s.k ? `0 2px 8px ${s.c}30` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
              <span style={{ fontSize: 14 }}>{s.ic}</span>
              <span style={{ fontWeight: 700, fontSize: 11, color: sub === s.k ? s.c : C.dark }}>{s.label}</span>
              {subStats[s.k].active > 0 && <span style={{ fontSize: 9, color: C.blue, marginLeft: 'auto' }}>🔵</span>}
            </div>
            <Bar p={subStats[s.k].pct} color={s.c} h={4} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 8, color: C.g3 }}>{subStats[s.k].done}/{subStats[s.k].total}</span>
              <span style={{ fontSize: 8, fontWeight: 800, color: s.c }}>{subStats[s.k].pct.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 285px', gap: 12, alignItems: 'start' }}>

        {/* ── TOPICS LIST ── */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
          {/* Subject header */}
          <div style={{ background: S.c, padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 17 }}>{S.ic}</span>
              <div style={{ flex: 1 }}><div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>{S.label}</div></div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontSize: 19, fontWeight: 800 }}>{subStats[sub].pct.toFixed(0)}%</div>
                <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 8 }}>{subStats[sub].done}/{topics.length} done</div>
              </div>
            </div>
            <Bar p={subStats[sub].pct} color="rgba(255,255,255,.85)" h={5} />
          </div>

          {/* Next Up banner */}
          {nextUp && nextUp.sub.k === sub && (
            <div style={{ background: S.c + '12', borderBottom: `1px solid ${S.c}22`, padding: '7px 13px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <span>🎯</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: S.c }}>NEXT UP</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.dark }}>{nextUp.name}</div>
              </div>
              <Button onClick={() => cycleTopic(sub, nextUp.id)} color={S.c} small>
                {nextUp.s === 'active' ? '✓ Mark Done' : '▶ Start'}
              </Button>
            </div>
          )}

          {/* Filter bar */}
          <div style={{ padding: '7px 12px', display: 'flex', gap: 4, borderBottom: `1px solid ${C.g1}`, flexWrap: 'wrap' }}>
            {['all', 'todo', 'active', 'done'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? S.c : C.g0, color: filter === f ? '#fff' : C.g3, border: 'none', borderRadius: 5, padding: '2px 9px', cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: 'inherit' }}>
                {f === 'all'    ? `All (${topics.length})` :
                 f === 'todo'   ? `⬜ ${topics.filter(t => (t.s || 'todo') === 'todo').length}` :
                 f === 'active' ? `🔵 ${topics.filter(t => t.s === 'active').length}` :
                                  `✅ ${topics.filter(t => t.s === 'done').length}`}
              </button>
            ))}
          </div>

          {/* Topic rows */}
          <div style={{ padding: '7px 9px', maxHeight: 340, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ textAlign: 'center', padding: 18, color: C.g2, fontSize: 10 }}>No topics in this filter</div>
              : filtered.map(tp => {
                  const st = TOPIC_STATE[tp.s || 'todo'];
                  return (
                    <div key={tp.id} style={{ display: 'flex', gap: 7, padding: '8px 9px', borderRadius: 7, marginBottom: 3, background: st.bg, border: `1.5px solid ${st.br}`, alignItems: 'flex-start' }}>
                      <button onClick={() => cycleTopic(sub, tp.id)} style={{ width: 23, height: 23, borderRadius: 5, border: `1.5px solid ${st.br}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, marginTop: 1 }}>
                        {st.ic}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, fontWeight: tp.s === 'active' ? 700 : 500, color: tp.s === 'done' ? C.g3 : C.dark, textDecoration: tp.s === 'done' ? 'line-through' : 'none', flex: 1 }}>{tp.name}</span>
                          <span style={{ fontSize: 8, color: st.c, fontWeight: 700 }}>{st.label}</span>
                          <span style={{ fontSize: 8, color: C.g2 }}>{tp.hrs}h</span>
                        </div>
                        <EditText value={tp.note || ''} onSave={v => setTopicNote(sub, tp.id, v)} style={{ fontSize: 9, color: C.g3, display: 'block', marginTop: 1 }} placeholder="Click to add notes…" />
                      </div>
                      {tp.s !== 'done'
                        ? <Button onClick={() => cycleTopic(sub, tp.id)} color={S.c} small>{tp.s === 'active' ? '✓' : '▶'}</Button>
                        : <Button onClick={() => cycleTopic(sub, tp.id)} color={C.g3} small outline>↩</Button>
                      }
                    </div>
                  );
                })}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Pomodoro Timer */}
          <div style={{ background: mode === 'focus' ? S.c + '10' : C.lteal, borderRadius: 12, padding: 13, border: `2px solid ${mode === 'focus' ? S.c : C.teal}22`, textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: mode === 'focus' ? S.c : C.teal, letterSpacing: 2, marginBottom: 6 }}>
              {mode === 'focus' ? '🍅 FOCUS SESSION' : '☕ BREAK TIME'}
            </div>

            {justDone && (
              <div style={{ background: justDone === 'focus' ? C.lgreen : C.lblue, color: justDone === 'focus' ? C.green : C.blue, borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 700, marginBottom: 7 }}>
                {justDone === 'focus' ? '✅ Session done! +25min auto-logged' : '☕ Break done! Ready for next?'}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              {/* SVG ring */}
              <div style={{ position: 'relative', width: 104, height: 104 }}>
                <svg width="104" height="104" viewBox="0 0 104 104">
                  <circle cx="52" cy="52" r={R} fill="none" stroke={C.g1} strokeWidth="8" />
                  <circle cx="52" cy="52" r={R} fill="none" stroke={mode === 'focus' ? S.c : C.teal} strokeWidth="8"
                    strokeDasharray={`${CIR * progress} ${CIR * (1 - progress)}`}
                    strokeLinecap="round" transform="rotate(-90 52 52)"
                    style={{ transition: 'stroke-dasharray .5s' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: mode === 'focus' ? S.c : C.teal, lineHeight: 1 }}>{mm}:{ss}</div>
                  <div style={{ fontSize: 8, color: C.g3, marginTop: 1 }}>{mode.toUpperCase()}</div>
                </div>
              </div>

              {/* Controls */}
              <div>
                <div style={{ display: 'flex', gap: 5, marginBottom: 8, justifyContent: 'center' }}>
                  <button onClick={() => { setRunning(r => !r); setJustDone(null); }} style={{ background: running ? C.orange : S.c, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 13px', cursor: 'pointer', fontWeight: 700, fontSize: 12, fontFamily: 'inherit' }}>
                    {running ? '⏸ Pause' : '▶ Start'}
                  </button>
                  <button onClick={resetTimer} style={{ background: C.g0, color: C.g3, border: `1.5px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>↺</button>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 800, color: S.c }}>{pomoCount}</div><div style={{ fontSize: 8, color: C.g3 }}>🍅 Sessions</div></div>
                  <div style={{ textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 800, color: C.green }}>{pomoCount * 25}m</div><div style={{ fontSize: 8, color: C.g3 }}>⏱ Total</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual session log */}
          <div style={{ background: '#fff', borderRadius: 11, boxShadow: '0 1px 5px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="📝" title="LOG SESSION" color={C.navy2} />
            <div style={{ padding: 11, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                <div>
                  <Label>SUBJECT</Label>
                  <Select value={logForm.sub} onChange={e => setLogForm(f => ({ ...f, sub: e.target.value }))} options={SUBS.map(s => ({ v: s.k, l: `${s.ic} ${s.label}` }))} />
                </div>
                <div>
                  <Label>MINUTES</Label>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[15, 30, 60].map(m => (
                      <button key={m} onClick={() => setLogForm(f => ({ ...f, min: String(m) }))} style={{ background: logForm.min == m ? C.navy2 : C.g0, color: logForm.min == m ? '#fff' : C.g3, border: 'none', borderRadius: 5, padding: '3px 5px', cursor: 'pointer', fontSize: 9, fontWeight: 700, fontFamily: 'inherit', flex: 1 }}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div><Label>TOPIC</Label><Input value={logForm.topic} onChange={e => setLogForm(f => ({ ...f, topic: e.target.value }))} placeholder="What did you study?" style={{ fontSize: 11 }} /></div>
              <Button onClick={() => addSession(parseInt(logForm.min) || 30, logForm.sub, logForm.topic)} color={C.navy2} full>Log Session</Button>
            </div>
          </div>

          {/* Recent sessions */}
          <div style={{ background: '#fff', borderRadius: 11, boxShadow: '0 1px 5px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="📚" title={`SESSIONS (${sessions.length})`} color={C.navy2} />
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {sessions.length === 0
                ? <div style={{ padding: 14, textAlign: 'center', color: C.g2, fontSize: 10 }}>No sessions logged yet</div>
                : sessions.slice(0, 12).map((s, i) => {
                    const si = SUBS.find(x => x.k === s.sub) || SUBS[0];
                    return (
                      <div key={s.id} style={{ display: 'flex', gap: 6, padding: '6px 10px', background: i % 2 === 0 ? '#fff' : C.g0, borderBottom: `1px solid ${C.g1}`, alignItems: 'center' }}>
                        <span style={{ fontSize: 11 }}>{si.ic}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: si.c }}>{si.label}{s.topic?.includes('🍅') ? ' 🍅' : ''}</div>
                          <div style={{ fontSize: 8, color: C.g3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.topic || '—'} · {s.date}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, color: C.navy2, flexShrink: 0 }}>{s.min}m</span>
                        <button onClick={() => delSession(s.id)} style={{ background: 'none', border: 'none', color: C.g1, cursor: 'pointer', fontSize: 11 }}>×</button>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
