import React, { useState } from 'react';
import C from '../../constants/theme';
import { TIME_CATS } from '../../constants/nav';
import { CAT_COLORS } from '../../constants/theme';
import { Bar, Button, CardHeader, Input, Select, Label } from '../ui';
import { fmt } from '../../utils/dates';

export default function TimeLog({ data, setData, dateContext }) {
  const { today: TODAY, weekStart: WS, weekEnd: WE } = dateContext;
  const [form, setForm] = useState({ date: TODAY, cat: 'SQL Study', act: '', hrs: '1' });
  const weekTarget = data.settings?.weekTarget || 45;

  const wkEntries  = data.timeLog.filter(e => e.date >= fmt(WS) && e.date < fmt(WE));
  const wkHours    = wkEntries.reduce((s, e) => s + (e.hrs || 0), 0);
  const todayHours = data.timeLog.filter(e => e.date === TODAY).reduce((s, e) => s + (e.hrs || 0), 0);

  const addEntry = () => {
    if (!form.act.trim()) return;
    setData(p => ({ ...p, timeLog: [{ id: Date.now(), ...form, hrs: parseFloat(form.hrs) || 0 }, ...p.timeLog] }));
    setForm(f => ({ ...f, act: '', hrs: '1' }));
  };

  const deleteEntry = (id) => setData(p => ({ ...p, timeLog: p.timeLog.filter(e => e.id !== id) }));

  const catBreakdown = TIME_CATS
    .map(c => ({ c, h: wkEntries.filter(e => e.cat === c).reduce((s, e) => s + e.hrs, 0) }))
    .filter(x => x.h > 0)
    .sort((a, b) => b.h - a.h);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { l: 'Today',      v: `${todayHours.toFixed(1)}h`,                                     c: C.blue   },
          { l: 'This Week',  v: `${wkHours.toFixed(1)}h`,                                        c: C.navy2  },
          { l: 'Target',     v: `${weekTarget}h`,                                                 c: C.g3     },
          { l: 'Progress',   v: `${Math.min(100, wkHours / weekTarget * 100).toFixed(0)}%`,      c: wkHours >= weekTarget ? C.green : C.orange },
        ].map(s => (
          <div key={s.l} style={{ background: '#fff', borderRadius: 10, padding: 11, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,.07)', borderTop: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 9, color: C.g3, fontWeight: 700, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Add entry form */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="➕" title="LOG ACTIVITY" color={C.blue} />
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                <div><Label>DATE</Label><Input type="date" value={form.date} onChange={e => setForm(x => ({ ...x, date: e.target.value }))} /></div>
                <div><Label>HOURS</Label><Input type="number" value={form.hrs} onChange={e => setForm(x => ({ ...x, hrs: e.target.value }))} placeholder="1.5" /></div>
              </div>
              <div><Label>CATEGORY</Label><Select value={form.cat} onChange={e => setForm(x => ({ ...x, cat: e.target.value }))} options={TIME_CATS} /></div>
              <div><Label>ACTIVITY</Label><Input value={form.act} onChange={e => setForm(x => ({ ...x, act: e.target.value }))} placeholder="What did you work on?" style={{ fontSize: 11 }} /></div>
              <Button onClick={addEntry} color={C.blue} full>Add Entry</Button>
            </div>
          </div>

          {/* Week breakdown */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <CardHeader icon="📊" title="WEEK BREAKDOWN" color={C.navy2} />
            <div style={{ padding: '10px 12px' }}>
              {catBreakdown.length === 0
                ? <div style={{ color: C.g2, fontSize: 10, textAlign: 'center', padding: 8 }}>Log entries to see breakdown</div>
                : catBreakdown.map(x => (
                  <div key={x.c} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                      <span style={{ fontSize: 9, fontWeight: 600 }}>{x.c}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: CAT_COLORS[x.c] || C.blue }}>{x.h.toFixed(1)}h</span>
                    </div>
                    <Bar p={x.h / wkHours * 100} color={CAT_COLORS[x.c] || C.blue} h={5} />
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── ACTIVITY LOG ── */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
          <CardHeader icon="📋" title="ACTIVITY LOG" color={C.navy2} right={<span style={{ color: 'rgba(255,255,255,.5)', fontSize: 9 }}>{data.timeLog.length} entries</span>} />
          <div style={{ maxHeight: 480, overflowY: 'auto' }}>
            {data.timeLog.length === 0
              ? <div style={{ padding: 24, textAlign: 'center', color: C.g2 }}>No entries yet. Log your first activity!</div>
              : data.timeLog.map((e, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', background: i % 2 === 0 ? '#fff' : C.g0, borderBottom: `1px solid ${C.g1}` }}>
                  <span style={{ fontSize: 9, color: C.g3, minWidth: 76, flexShrink: 0 }}>{e.date}</span>
                  <span style={{ background: (CAT_COLORS[e.cat] || C.g3) + '22', color: CAT_COLORS[e.cat] || C.g3, borderRadius: 4, padding: '1px 7px', fontWeight: 700, fontSize: 9, flexShrink: 0 }}>{e.cat}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, flex: 1, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.act}</span>
                  <span style={{ fontWeight: 800, color: C.blue, fontSize: 11, flexShrink: 0 }}>{e.hrs}h</span>
                  <button onClick={() => deleteEntry(e.id)} style={{ background: 'none', border: 'none', color: C.g1, cursor: 'pointer', fontSize: 13 }}>×</button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
